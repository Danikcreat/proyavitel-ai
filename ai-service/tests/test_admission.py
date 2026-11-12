import asyncio
from datetime import timedelta

from conftest import auth, create, events
from fastapi import HTTPException
from sqlalchemy import update

from app.models import Message, utcnow
from app.repository import Repository


async def test_global_admission_across_users(client, app, settings):
    ids = [await create(client, subject=name) for name in ("alice", "bob")]
    settings.global_max_concurrent_generations = 1

    async def claim(index):
        try:
            return await Repository(app.state.database).claim(
                ("alice", "bob")[index],
                ids[index],
                {"text": "global"},
                "global-key",
                120,
                admission_settings=settings,
            )
        except HTTPException as exc:
            return exc.status_code

    results = await asyncio.gather(claim(0), claim(1))
    assert sum(item == 429 for item in results) == 1
    winner_index = next(index for index, item in enumerate(results) if item != 429)
    await app.state.repository.finish(results[winner_index], "done", "completed")
    settings.global_generation_requests_per_minute = 1
    assert await claim(1 - winner_index) == 429
    assert (await claim(winner_index)).replay is True
    settings.global_generation_requests_per_minute = 100
    settings.global_generation_requests_per_day = 1
    assert await claim(1 - winner_index) == 429


async def test_generation_windows_replay_and_user_isolation(client, settings):
    settings.generation_requests_per_minute = 1
    settings.generation_requests_per_day = 1
    cid = await create(client)
    path = f"/assistant/conversations/{cid}/messages"
    headers = {**auth(), "Idempotency-Key": "quota-replay"}
    body = {"text": "test"}
    first = await client.post(path, headers=headers, json=body)
    assert events(first)[-1][1]["status"] == "completed"
    assert events(await client.post(path, headers=headers, json=body))[0][1]["replay"] is True
    blocked = await client.post(path, headers=auth(), json=body)
    assert blocked.status_code == 429 and 1 <= int(blocked.headers["retry-after"]) <= 60
    assert blocked.headers["content-type"].startswith("application/problem+json")
    other = await create(client, subject="bob")
    assert (
        await client.post(
            f"/assistant/conversations/{other}/messages", headers=auth("bob"), json=body
        )
    ).status_code == 200


async def test_daily_window_expires_and_parallel_claims_share_database_limit(client, app, settings):
    cid = await create(client)
    settings.generation_requests_per_day = 1
    path = f"/assistant/conversations/{cid}/messages"
    assert (await client.post(path, headers=auth(), json={"text": "one"})).status_code == 200
    async with app.state.database.sessions.begin() as session:
        await session.execute(
            update(Message)
            .where(Message.conversation_id == cid)
            .values(created_at=utcnow() - timedelta(minutes=2))
        )
    blocked = await client.post(path, headers=auth(), json={"text": "two"})
    assert blocked.status_code == 429 and int(blocked.headers["retry-after"]) > 60
    async with app.state.database.sessions.begin() as session:
        await session.execute(
            update(Message)
            .where(Message.conversation_id == cid)
            .values(created_at=utcnow() - timedelta(hours=25))
        )
    assert (await client.post(path, headers=auth(), json={"text": "three"})).status_code == 200

    settings.generation_requests_per_day = 100
    settings.max_concurrent_generations_per_user = 1
    ids = [await create(client), await create(client)]
    repositories = [Repository(app.state.database), Repository(app.state.database)]

    async def claim(index):
        try:
            return await repositories[index].claim(
                "alice", ids[index], {"text": "parallel"}, None, 120, admission_settings=settings
            )
        except HTTPException as exc:
            return exc.status_code

    results = await asyncio.gather(claim(0), claim(1))
    assert sum(result == 429 for result in results) == 1
    winner = next(result for result in results if result != 429)
    await app.state.repository.finish(winner, "done", "completed")
    loser_index = results.index(429)
    assert not await app.state.repository.history(ids[loser_index])
    assert (await claim(loser_index)).conversation_id == ids[loser_index]
