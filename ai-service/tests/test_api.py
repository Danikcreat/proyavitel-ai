import asyncio
from datetime import timedelta

import httpx
import pytest
from conftest import CONTEXT, auth, create, events
from sqlalchemy import func, select, update

from app.main import create_app
from app.models import AuditEvent, Conversation, Message, utcnow


async def test_chat_persists_context_history_and_restart(client, app, settings):
    cid = await create(client)
    response = await client.post(
        f"/assistant/conversations/{cid}/messages",
        headers=auth(),
        json={"text": "Почему вырос брак?", "context": CONTEXT},
    )
    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    frames = events(response)
    assert frames[0][0] == "meta"
    assert frames[1] == (
        "sources",
        {
            "items": [
                {
                    "id": "demo-production-v1",
                    "synthetic": True,
                    "updated_at": "2026-11-11T09:00:00Z",
                    "period": {"from": "2026-11-01", "to": "2026-11-11"},
                }
            ]
        },
    )
    assert frames[-1][1]["status"] == "completed"
    answer = "".join(payload["delta"] for event, payload in frames if event == "delta")
    assert "6.0%" in answer and "4.0 п.п." in answer
    fresh = create_app(settings)
    async with fresh.router.lifespan_context(fresh):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=fresh), base_url="http://test"
        ) as restarted:
            saved = (await restarted.get(f"/assistant/conversations/{cid}", headers=auth())).json()
            assert len(saved["messages"]) == 2
            assert saved["messages"][0]["context"]["entity"] == CONTEXT["entity"]
            assert saved["messages"][1]["text"] == answer
            followup = await restarted.post(
                f"/assistant/conversations/{cid}/messages",
                headers=auth(),
                json={"text": "Что проверить первым?"},
            )
            assert "учтено сообщений пользователя: 2" in followup.text
            assert "6.0%" in followup.text  # Inherits the saved, re-authorized context.


async def test_user_isolation_and_owned_lists(client):
    cid = await create(client)
    assert (await client.get("/assistant/conversations", headers=auth("bob"))).json()["items"] == []
    assert (
        await client.get(f"/assistant/conversations/{cid}", headers=auth("bob"))
    ).status_code == 404
    assert (
        await client.post(
            f"/assistant/conversations/{cid}/messages", headers=auth("bob"), json={"text": "read"}
        )
    ).status_code == 404
    mine = await client.get("/assistant/conversations?limit=1&offset=0", headers=auth())
    assert mine.json()["items"][0]["id"] == cid


@pytest.mark.parametrize(
    "headers",
    [
        {},
        auth(exp=utcnow() - timedelta(seconds=1)),
        auth(aud="wrong"),
        auth(iss="wrong"),
        {"Authorization": "Bearer nonsense"},
    ],
)
async def test_invalid_auth_problem(client, headers):
    response = await client.get("/assistant/conversations", headers=headers)
    assert response.status_code == 401
    assert response.headers["content-type"] == "application/problem+json"
    assert response.json()["traceId"] == response.headers["x-trace-id"]


async def test_context_authorization_and_audit(client, app):
    cid = await create(client)
    for body, headers in [
        ({"text": "test", "context": CONTEXT}, auth(permissions=["assistant:use"])),
        (
            {
                "text": "test",
                "context": {**CONTEXT, "entity": {"type": "station", "id": "st-private"}},
            },
            auth(),
        ),
        ({"text": "test", "context": {**CONTEXT, "filters": {"department": "finance"}}}, auth()),
        (
            {
                "text": "test",
                "context": {**CONTEXT, "entity": {"type": "employee", "id": "someone"}},
            },
            auth(),
        ),
    ]:
        response = await client.post(
            f"/assistant/conversations/{cid}/messages", json=body, headers=headers
        )
        assert response.status_code == 403, response.text
    async with app.state.database.sessions() as session:
        assert await session.scalar(select(func.count()).select_from(AuditEvent)) == 4
        assert await session.scalar(select(func.count()).select_from(Message)) == 0


async def test_revoked_context_cannot_be_read_or_reused(client):
    cid = await create(client)
    await client.post(
        f"/assistant/conversations/{cid}/messages",
        headers=auth(),
        json={"text": "Брак", "context": CONTEXT},
    )
    restricted = auth(permissions=["assistant:use"])
    assert (
        await client.get(f"/assistant/conversations/{cid}", headers=restricted)
    ).status_code == 403
    assert (
        await client.post(
            f"/assistant/conversations/{cid}/messages", headers=restricted, json={"text": "Дальше?"}
        )
    ).status_code == 403


async def test_idempotency_and_payload_conflict(client):
    cid = await create(client, key="create-demo-1")
    assert await create(client, key="create-demo-1") == cid
    headers = {**auth(), "Idempotency-Key": "message-demo-1"}
    path = f"/assistant/conversations/{cid}/messages"
    body = {"text": "test", "context": CONTEXT}
    first = events(await client.post(path, json=body, headers=headers))
    replay = events(await client.post(path, json=body, headers=headers))
    assert replay[0][1]["replay"] is True
    assert first[0][1]["assistant_message_id"] == replay[0][1]["assistant_message_id"]
    assert (
        len(
            (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()["messages"]
        )
        == 2
    )
    conflict = await client.post(path, json={"text": "different"}, headers=headers)
    assert conflict.status_code == 409


async def test_generation_error_is_saved_and_lock_released(client, app):
    class Broken:
        async def stream(self, messages, **kwargs):
            yield "partial"
            raise RuntimeError("never-log-this-secret")

    app.state.orchestrator.provider = Broken()
    cid = await create(client)
    response = await client.post(
        f"/assistant/conversations/{cid}/messages", headers=auth(), json={"text": "test"}
    )
    frames = events(response)
    assert any(kind == "error" for kind, _ in frames) and frames[-1][1]["status"] == "failed"
    assert "never-log-this-secret" not in response.text
    saved = (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()[
        "messages"
    ][-1]
    assert saved["status"] == "failed" and saved["text"] == "partial"
    async with app.state.database.sessions() as session:
        assert (await session.get(Conversation, cid)).active_message_id is None


async def test_timeout_and_heartbeats(client, app):
    class Slow:
        async def stream(self, messages, **kwargs):
            await asyncio.sleep(10)
            yield "late"

    app.state.orchestrator.provider = Slow()
    app.state.settings.stream_timeout_seconds = 0.05
    app.state.settings.heartbeat_seconds = 0.01
    cid = await create(client)
    response = await client.post(
        f"/assistant/conversations/{cid}/messages", headers=auth(), json={"text": "test"}
    )
    assert ": heartbeat" in response.text
    assert (
        next(data for kind, data in events(response) if kind == "error")["code"]
        == "generation_timeout"
    )
    assert events(response)[-1][1]["status"] == "failed"


async def test_expired_lease_recovery_and_no_duplicate_generation(client, app):
    cid = await create(client)
    repo = app.state.repository
    turn = await repo.claim("alice", cid, {"text": "abandoned"}, "abandoned-1", 120)
    response = await client.post(
        f"/assistant/conversations/{cid}/messages", headers=auth(), json={"text": "busy"}
    )
    assert response.status_code == 409
    async with app.state.database.sessions.begin() as session:
        await session.execute(
            update(Conversation)
            .where(Conversation.id == cid)
            .values(lease_expires_at=utcnow() - timedelta(seconds=1))
        )
    saved = (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()
    assert saved["messages"][-1]["status"] == "interrupted"
    # A late cleanup from the old worker cannot overwrite the terminal result.
    await repo.finish(turn, "late data", "completed")
    response = await client.post(
        f"/assistant/conversations/{cid}/messages", headers=auth(), json={"text": "new"}
    )
    assert events(response)[-1][1]["status"] == "completed"


@pytest.mark.parametrize(
    "body",
    [
        {"text": " "},
        {"text": "x" * 12001},
        {"text": "x", "user_id": "bob"},
        {"text": "x", "context": {**CONTEXT, "permissions": ["*"]}},
        {
            "text": "x",
            "context": {**CONTEXT, "filters": {"from": "2026-11-11", "to": "2026-11-01"}},
        },
    ],
)
async def test_input_validation(client, body):
    cid = await create(client)
    response = await client.post(
        f"/assistant/conversations/{cid}/messages", headers=auth(), json=body
    )
    assert response.status_code == 422


async def test_other_period_does_not_fabricate_fixture(client):
    cid = await create(client)
    response = await client.post(
        f"/assistant/conversations/{cid}/messages",
        headers=auth(),
        json={"text": "Брак?", "context": {**CONTEXT, "filters": {"from": "2025-01-01"}}},
    )
    assert "6.0%" not in response.text
    assert events(response)[1] == ("sources", {"items": []})
