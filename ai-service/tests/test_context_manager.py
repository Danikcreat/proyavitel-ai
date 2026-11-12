import json

import httpx
import pytest
from conftest import CONTEXT, auth, events
from pydantic import SecretStr

from app.auth import Principal
from app.context_manager import ContextManager
from app.main import create_app
from app.pulse import SyntheticPulseClient
from app.schemas import ModuleContext
from app.tools import ToolError, ToolExecutor


async def test_quality_context_defaults_missing_fields_and_unsupported_filters():
    user = Principal(
        "alice", frozenset({"assistant:use", "production:read"}), frozenset({"production"}), "test"
    )
    tools = ToolExecutor(SyntheticPulseClient())
    context = ModuleContext.model_validate(CONTEXT)
    result = await tools.execute(user, "get_defect_summary", {}, context=context)
    assert result.data["change_percentage_points"] == 4
    assert result.applied_filters == {
        "station_id": "st-03",
        "start": "2026-11-01",
        "end": "2026-11-11",
    }
    missing = await tools.execute(user, "get_defect_summary", {})
    assert missing.code == "missing_context_fields" and missing.sources == []
    assert missing.data["missing_fields"] == ["station_id", "start", "end"]
    filtered = ModuleContext.model_validate(
        {**CONTEXT, "filters": {**CONTEXT["filters"], "product": "photobook"}}
    )
    result = await tools.execute(user, "get_defect_summary", {}, context=filtered)
    assert result.code == "unsupported_context_filters" and result.sources == []
    # Validate the combined dates, not just the partial model-supplied arguments.
    with pytest.raises(ToolError, match="invalid_tool_arguments"):
        await tools.execute(user, "get_defect_summary", {"start": "2026-12-01"}, context=context)
    # An explicit station override still goes through entity authorization.
    with pytest.raises(ToolError, match="entity_access_denied"):
        await tools.execute(
            user, "get_defect_summary", {"station_id": "st-private"}, context=context
        )


async def test_context_survives_text_window_replace_reset_and_replay(app, settings):
    requests = []
    states = []

    def model(request):
        body = json.loads(request.content)
        requests.append(body)
        resolved = json.loads(body["messages"][2]["content"].split(": ", 1)[1])
        if body["messages"][-1]["role"] == "tool":
            result = json.loads(body["messages"][-1]["content"])
            if resolved["origin"] == "inherited":
                assert result["data"]["change_percentage_points"] == 4
                assert result["applied_filters"]["station_id"] == "st-03"
                delta = {"content": "Синтетический рост: 4 п.п."}
            else:
                assert result["code"] == "missing_context_fields"
                assert result["data"]["missing_fields"] == (
                    ["station_id", "start", "end"]
                    if resolved["origin"] == "cleared"
                    else ["start", "end"]
                )
                delta = {"content": "Уточните станок и период."}
        else:
            states.append(resolved)
            assert len([item for item in body["messages"] if item["role"] == "user"]) == 1
            if len(states) == 1:
                delta = {"content": "Первый контекст принят."}
            else:
                delta = {
                    "tool_calls": [
                        {
                            "index": 0,
                            "id": f"quality-{len(states)}",
                            "function": {"name": "get_defect_summary", "arguments": "{}"},
                        }
                    ]
                }
        frame = {"choices": [{"delta": delta, "finish_reason": "stop"}]}
        return httpx.Response(200, text="data: " + json.dumps(frame) + "\n\ndata: [DONE]\n\n")

    configured = settings.model_copy(
        update={
            "mode": "llm",
            "allow_demo_llm": True,
            "history_max_messages": 1,
            "llm_model": "test-model",
            "llm_api_key": SecretStr("test-only"),
        }
    )
    integrated = create_app(configured, transport=httpx.MockTransport(model))
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:
            cid = (await client.post("/assistant/conversations", headers=auth(), json={})).json()[
                "id"
            ]
            path = f"/assistant/conversations/{cid}/messages"
            first = events(
                await client.post(
                    path, headers=auth(), json={"text": "Первый вопрос", "context": CONTEXT}
                )
            )
            assert first[-1][1]["status"] == "completed"
            first_user = first[0][1]["user_message_id"]
            followup = events(await client.post(path, headers=auth(), json={"text": "А разница?"}))
            assert followup[-1][1]["status"] == "completed"
            context = next(payload for kind, payload in followup if kind == "context")
            assert context["origin"] == "inherited" and context["source_message_id"] == first_user
            source = next(
                payload for kind, payload in followup if kind == "sources" and payload["items"]
            )
            assert source["items"][0]["filters"]["start"] == "2026-11-01"
            replacement = {"module": "production", "entity": {"type": "station", "id": "st-01"}}
            replaced = events(
                await client.post(
                    path, headers=auth(), json={"text": "Другой станок", "context": replacement}
                )
            )
            assert replaced[-1][1]["status"] == "completed"
            assert states[-1]["context"]["filters"]["from"] is None
            assert states[-1]["missing_fields"] == ["start", "end"]
            headers = {**auth(), "Idempotency-Key": "clear-context-test"}
            reset_body = {"text": "Новая тема", "reset_context": True}
            reset = events(await client.post(path, headers=headers, json=reset_body))
            assert reset[-1][1]["status"] == "completed"
            reset_state = next(payload for kind, payload in reset if kind == "context")
            assert reset_state["origin"] == "cleared" and reset_state["context"] is None
            calls_before_replay = len(requests)
            replay = events(await client.post(path, headers=headers, json=reset_body))
            assert replay[0][1]["replay"] is True
            assert next(payload for kind, payload in replay if kind == "context") == reset_state
            assert len(requests) == calls_before_replay
            saved = (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()
            assert saved["effective_context"] == reset_state
            assert saved["messages"][-2]["reset_context"] is True
            assert saved["messages"][-1]["effective_context"] == reset_state
            full_history = await integrated.state.repository.history(cid)
            larger_window = ContextManager(
                configured.model_copy(update={"history_max_messages": 40})
            )
            model_history = larger_window.messages(full_history)
            assert [item["role"] for item in model_history] == ["user", "assistant"]
            assert model_history[0]["content"] == "Новая тема"
            # Clearing inheritance must not bypass authorization of saved context/history.
            assert (
                await client.get(
                    f"/assistant/conversations/{cid}", headers=auth(permissions=["assistant:use"])
                )
            ).status_code == 403
            assert (
                await client.post(path, headers=auth(), json={**reset_body, "context": CONTEXT})
            ).status_code == 422
