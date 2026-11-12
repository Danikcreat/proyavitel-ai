import asyncio
import json
from datetime import timedelta
from types import SimpleNamespace

import httpx
from conftest import CONTEXT, auth, create, events
from pydantic import SecretStr
from sqlalchemy import update

from app.diagnostics import RunMetrics
from app.main import create_app
from app.models import Conversation, utcnow
from app.streaming import stream_turn


def stream(*chunks):
    return httpx.Response(
        200,
        text="".join("data: " + json.dumps(chunk) + "\n\n" for chunk in chunks)
        + "data: [DONE]\n\n",
    )


def usage(prompt, completion):
    return {
        "choices": [],
        "usage": {
            "prompt_tokens": prompt,
            "completion_tokens": completion,
            "total_tokens": prompt + completion,
        },
    }


def llm_settings(settings):
    return settings.model_copy(
        update={
            "mode": "llm",
            "allow_demo_llm": True,
            "provider": "compatible",
            "llm_model": "test-model",
            "llm_api_key": SecretStr("credential-test-secret"),
        }
    )


async def test_agent_diagnostics_usage_history_replay_and_access(app, settings):
    calls = []

    def gateway(request):
        body = json.loads(request.content)
        calls.append(body)
        if len(calls) == 1:
            return stream(
                {
                    "choices": [
                        {
                            "delta": {
                                "tool_calls": [
                                    {
                                        "index": 0,
                                        "id": "quality",
                                        "function": {
                                            "name": "get_defect_summary",
                                            "arguments": "{}",
                                        },
                                    }
                                ]
                            },
                            "finish_reason": "tool_calls",
                        }
                    ]
                },
                usage(30, 2),
                usage(30, 4),
            )
        return stream(
            {"choices": [{"delta": {"content": "Рост 4 п.п."}, "finish_reason": "stop"}]},
            usage(60, 8),
        )

    integrated = create_app(llm_settings(settings), transport=httpx.MockTransport(gateway))
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:
            cid = await create(client)
            path = f"/assistant/conversations/{cid}/messages"
            body = {"text": "private-prompt-marker", "context": CONTEXT}
            headers = {**auth(), "Idempotency-Key": "diagnostics-replay"}
            response = await client.post(path, headers=headers, json=body)
            frames = events(response)
            assert frames[-1][1]["status"] == "completed", response.text
            run = next(payload for kind, payload in frames if kind == "diagnostics")
            assert run["provider_calls"] == 2 and run["provider_retries"] == 0
            assert run["tool_calls"] == 1 and run["tool_time_ms"] >= 0
            assert run["reported_prompt_tokens"] == 90
            assert run["reported_completion_tokens"] == 12
            assert run["reported_total_tokens"] == 102 and run["usage_status"] == "complete"
            assert 0 <= run["preparation_ms"] <= run["first_text_ms"] <= run["total_ms"]
            assert run["output_chars"] == len("Рост 4 п.п.")
            assert run["trace_id"] == response.headers["x-trace-id"]
            assert (
                next(payload for kind, payload in frames if kind == "tool_end")["duration_ms"] >= 0
            )
            replay = events(await client.post(path, headers=headers, json=body))
            assert replay[0][1]["replay"] is True
            assert next(payload for kind, payload in replay if kind == "diagnostics") == run
            assert len(calls) == 2
            saved = (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()
            assert saved["messages"][-1]["diagnostics"] == run
            listing = await client.get(
                f"/assistant/conversations/{cid}/runs?limit=1", headers=auth()
            )
            assert listing.json()["items"] == [run]
            assert (
                "private-prompt-marker" not in listing.text
                and "credential-test-secret" not in listing.text
            )
            assert (
                await client.get(f"/assistant/conversations/{cid}/runs", headers=auth("bob"))
            ).status_code == 404
            assert (
                await client.get(
                    f"/assistant/conversations/{cid}/runs",
                    headers=auth(permissions=["assistant:use"]),
                )
            ).status_code == 403


async def test_retry_and_broken_stream_keep_usage_unknown_or_partial(app, settings, caplog):
    requests = []

    class Broken(httpx.AsyncByteStream):
        async def __aiter__(self):
            yield b'data: {"choices":[{"delta":{"content":"partial-secret-marker"}}]}\n\n'
            raise httpx.ReadError("private-upstream-error-marker")

    def gateway(request):
        requests.append(request)
        if len(requests) == 1:
            return httpx.Response(503)
        if len(requests) == 2:
            return stream(
                {"choices": [{"delta": {"content": "OK"}, "finish_reason": "stop"}]}, usage(20, 4)
            )
        return httpx.Response(200, stream=Broken())

    integrated = create_app(llm_settings(settings), transport=httpx.MockTransport(gateway))
    headers = auth(permissions=["assistant:use"])
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:
            cid = (await client.post("/assistant/conversations", headers=headers, json={})).json()[
                "id"
            ]
            path = f"/assistant/conversations/{cid}/messages"
            retried = events(await client.post(path, headers=headers, json={"text": "test"}))
            run = next(payload for kind, payload in retried if kind == "diagnostics")
            assert (
                run["status"] == "completed"
                and run["provider_calls"] == 2
                and run["provider_retries"] == 1
            )
            assert run["usage_status"] == "partial" and run["reported_total_tokens"] == 24
            broken = events(await client.post(path, headers=headers, json={"text": "test failure"}))
            run = next(payload for kind, payload in broken if kind == "diagnostics")
            assert run["status"] == "failed" and run["provider_calls"] == 1
            assert run["provider_retries"] == 0 and run["error_code"] == "provider_connection_lost"
            assert run["first_text_ms"] is not None and run["usage_status"] == "unknown"
            assert (
                run["reported_total_tokens"] is None and run["reported_completion_tokens"] is None
            )
            assert len(requests) == 3
            assert "private-upstream-error-marker" not in json.dumps(broken)
    assert "private-upstream-error-marker" not in caplog.text
    assert "partial-secret-marker" not in caplog.text
    assert "credential-test-secret" not in caplog.text


async def test_cancelled_run_and_process_recovery_do_not_invent_timings(client, app):
    class Cancellable:
        async def stream(self, messages, **kwargs):
            yield "partial"
            await asyncio.sleep(100)

    cid = await create(client)
    app.state.orchestrator.provider = Cancellable()
    info = {"trace_id": "test-trace", "mode": "demo", "provider": None, "model": None}
    turn = await app.state.repository.claim(
        "alice", cid, {"text": "test"}, None, 120, metrics=RunMetrics(), run_info=info
    )
    request = SimpleNamespace(app=app, state=SimpleNamespace(trace_id="test-trace"))

    async def connected():
        return False

    request.is_disconnected = connected
    generator = stream_turn(request, turn, [], [])
    while "event: delta" not in await anext(generator):
        pass
    await generator.aclose()
    run = (await app.state.repository.runs(cid))[0]
    assert run.status == "cancelled" and run.error_code == "request_cancelled"
    assert run.first_text_ms is not None and run.reported_total_tokens is None
    abandoned = await app.state.repository.claim(
        "alice", cid, {"text": "abandoned"}, None, 120, metrics=RunMetrics(), run_info=info
    )
    async with app.state.database.sessions.begin() as session:
        await session.execute(
            update(Conversation)
            .where(Conversation.id == cid)
            .values(lease_expires_at=utcnow() - timedelta(seconds=1))
        )
    runs = (await client.get(f"/assistant/conversations/{cid}/runs", headers=auth())).json()[
        "items"
    ]
    interrupted = next(item for item in runs if item["message_id"] == abandoned.assistant.id)
    assert interrupted["status"] == "interrupted" and interrupted["error_code"] == "run_interrupted"
    assert interrupted["total_ms"] is None and interrupted["provider_calls"] is None
    assert interrupted["first_text_ms"] is None and interrupted["reported_total_tokens"] is None
