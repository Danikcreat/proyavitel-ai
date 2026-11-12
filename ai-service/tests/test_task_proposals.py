import asyncio
import json
from types import SimpleNamespace

import httpx
from conftest import auth, events
from pydantic import SecretStr
from sqlalchemy import func, select

from app.auth import Principal
from app.main import create_app
from app.models import AuditEvent, SyntheticTask


async def test_propose_confirm_once_and_reject(app, settings):
    previous_proposal_id = None
    payload = {
        "title": "Проверить станок №3",
        "description": "Проверить настройки термопереплёта",
        "station_id": "st-03",
        "reason": "Запрос пользователя на проверку",
        "deadline": None,
    }

    def gateway(request):
        body = json.loads(request.content)
        context = json.loads(body["messages"][2]["content"].split(": ", 1)[1])
        if previous_proposal_id and context["topic_start_message_id"]:
            assert previous_proposal_id not in body["messages"][0]["content"]
        if body["messages"][-1]["role"] != "tool":
            chunk = {
                "choices": [
                    {
                        "delta": {
                            "tool_calls": [
                                {
                                    "index": 0,
                                    "id": "proposal-call",
                                    "function": {
                                        "name": "propose_task",
                                        "arguments": json.dumps(payload),
                                    },
                                }
                            ]
                        },
                        "finish_reason": "tool_calls",
                    }
                ]
            }
        else:
            result = json.loads(body["messages"][-1]["content"])
            assert result["data"]["executed"] is False
            chunk = {
                "choices": [
                    {
                        "delta": {
                            "content": "Предложение подготовлено, подтвердите создание тестовой задачи."
                        },
                        "finish_reason": "stop",
                    }
                ]
            }
        return httpx.Response(200, text="data: " + json.dumps(chunk) + "\n\ndata: [DONE]\n\n")

    configured = settings.model_copy(
        update={
            "mode": "llm",
            "allow_demo_llm": True,
            "provider": "compatible",
            "llm_model": "deepseek-v4-flash",
            "llm_api_key": SecretStr("test-only"),
        }
    )
    integrated = create_app(configured, transport=httpx.MockTransport(gateway))
    headers = auth(permissions=["assistant:use", "production:read", "tasks:create"])
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:

            async def propose():
                cid = (
                    await client.post("/assistant/conversations", json={}, headers=headers)
                ).json()["id"]
                response = await client.post(
                    f"/assistant/conversations/{cid}/messages",
                    headers=headers,
                    json={"text": "Предложи задачу проверить станок №3"},
                )
                frames = events(response)
                assert frames[-1][1]["status"] == "completed"
                proposal = next(data["proposal"] for kind, data in frames if kind == "proposal")
                assert proposal["status"] == "pending" and proposal["result"] is None
                return cid, proposal["id"]

            cid, pid = await propose()
            history = (await client.get(f"/assistant/conversations/{cid}", headers=headers)).json()
            actor = Principal(
                "alice",
                frozenset({"assistant:use", "production:read", "tasks:create"}),
                frozenset({"production"}),
                "test-only",
            )
            repeated = await integrated.state.proposals.prepare(
                SimpleNamespace(
                    conversation_id=cid, assistant=SimpleNamespace(id=history["messages"][-1]["id"])
                ),
                actor,
                payload,
                "another-model-call",
            )
            assert repeated.data["proposal"]["id"] == pid
            async with integrated.state.database.sessions() as session:
                assert await session.scalar(select(func.count()).select_from(SyntheticTask)) == 0
            assert (
                await client.post(f"/assistant/proposals/{pid}/confirm", headers=auth("bob"))
            ).status_code == 404
            assert (
                await client.post(f"/assistant/proposals/{pid}/confirm", headers=auth())
            ).status_code == 403
            responses = await asyncio.gather(
                *[
                    client.post(f"/assistant/proposals/{pid}/confirm", headers=headers)
                    for _ in range(2)
                ]
            )
            assert all(response.status_code == 200 for response in responses)
            assert responses[0].json()["result"]["id"] == responses[1].json()["result"]["id"]
            assert responses[0].json()["status"] == "executed"
            saved = (await client.get(f"/assistant/conversations/{cid}", headers=headers)).json()
            assert saved["proposals"][0]["status"] == "executed"
            previous_proposal_id = pid
            reset = events(
                await client.post(
                    f"/assistant/conversations/{cid}/messages",
                    headers=headers,
                    json={"text": "Предложи задачу для новой темы", "reset_context": True},
                )
            )
            assert reset[-1][1]["status"] == "completed"
            boundary = next(data for kind, data in reset if kind == "context")[
                "topic_start_message_id"
            ]
            active = await integrated.state.proposals.list(actor, cid, boundary)
            assert len(active) == 1 and active[0].id != pid
            # Selecting a UI context later must not bring the earlier topic back.
            selected = events(
                await client.post(
                    f"/assistant/conversations/{cid}/messages",
                    headers=headers,
                    json={"text": "Ещё предложение", "context": {"module": "production"}},
                )
            )
            assert selected[-1][1]["status"] == "completed"
            assert (
                next(data for kind, data in selected if kind == "context")["topic_start_message_id"]
                == boundary
            )
            _, rejected = await propose()
            assert (
                await client.post(f"/assistant/proposals/{rejected}/reject", headers=headers)
            ).json()["status"] == "rejected"
            assert (
                await client.post(f"/assistant/proposals/{rejected}/confirm", headers=headers)
            ).status_code == 409
            async with integrated.state.database.sessions() as session:
                assert await session.scalar(select(func.count()).select_from(SyntheticTask)) == 1
                assert (
                    await session.scalar(
                        select(func.count())
                        .select_from(AuditEvent)
                        .where(AuditEvent.action == "synthetic_task.created")
                    )
                    == 1
                )
