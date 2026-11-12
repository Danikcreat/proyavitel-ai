import asyncio
from types import SimpleNamespace

import pytest
from conftest import create

from app.streaming import stream_turn


async def test_disconnect_persists_partial_and_closes_provider(client, app):
    closed = asyncio.Event()

    class Cancellable:
        async def stream(self, messages, **kwargs):
            try:
                yield "partial"
                await asyncio.sleep(100)
                yield "late"
            finally:
                closed.set()

    app.state.orchestrator.provider = Cancellable()
    cid = await create(client)
    turn = await app.state.repository.claim("alice", cid, {"text": "test"}, None, 120)
    request = SimpleNamespace(app=app, state=SimpleNamespace(trace_id="test-trace"))

    async def connected():
        return False

    request.is_disconnected = connected
    generator = stream_turn(request, turn, [], [])
    assert "event: meta" in await anext(generator)
    await anext(generator)  # sources
    assert '"phase": "waiting"' in await anext(generator)
    assert '"phase": "answering"' in await anext(generator)
    assert "partial" in await anext(generator)
    await generator.aclose()
    assert closed.is_set()
    history = await app.state.repository.history(cid)
    assert history[-1].status == "cancelled"
    assert history[-1].text == "partial"
    assert (await app.state.repository.owned("alice", cid)).active_message_id is None


async def test_cancellation_while_waiting(client, app):
    closed = asyncio.Event()

    class Blocked:
        async def stream(self, messages, **kwargs):
            try:
                await asyncio.sleep(100)
                yield "late"
            finally:
                closed.set()

    app.state.orchestrator.provider = Blocked()
    cid = await create(client)
    turn = await app.state.repository.claim("alice", cid, {"text": "test"}, None, 120)
    request = SimpleNamespace(app=app, state=SimpleNamespace(trace_id="cancel-trace"))

    async def connected():
        return False

    request.is_disconnected = connected
    generator = stream_turn(request, turn, [], [])
    await anext(generator)
    await anext(generator)
    await anext(generator)  # waiting status
    task = asyncio.create_task(anext(generator))
    await asyncio.sleep(0.01)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task
    assert closed.is_set()
    assert (await app.state.repository.history(cid))[-1].status == "cancelled"
