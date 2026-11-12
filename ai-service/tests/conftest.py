import asyncio
import os
from datetime import timedelta
from pathlib import Path

import httpx
import jwt
import pytest
import pytest_asyncio
from alembic import command
from alembic.config import Config

from app.config import Settings
from app.main import create_app
from app.models import Base, utcnow

SECRET = "test-only-key-" + "0" * 40
SERVICE = Path(__file__).resolve().parents[1]
CONTEXT = {
    "module": "production",
    "screen": "station_details",
    "entity": {"type": "station", "id": "st-03"},
    "filters": {"from": "2026-11-01", "to": "2026-11-11"},
}


def token(subject="alice", permissions=None, departments=None, **overrides):
    now = utcnow()
    claims = {
        "sub": subject,
        "iss": "pulse",
        "aud": "pulse-ai",
        "iat": now,
        "exp": now + timedelta(hours=1),
        "permissions": permissions
        if permissions is not None
        else ["assistant:use", "production:read"],
        "departmentScope": departments if departments is not None else ["production"],
    }
    claims.update(overrides)
    return jwt.encode(claims, SECRET, algorithm="HS256")


def auth(subject="alice", **kwargs):
    return {"Authorization": "Bearer " + token(subject, **kwargs)}


def events(response):
    result = []
    import json

    for frame in response.text.split("\n\n"):
        lines = frame.splitlines()
        event = next((line[7:] for line in lines if line.startswith("event: ")), None)
        data = next((line[6:] for line in lines if line.startswith("data: ")), None)
        if event and data:
            result.append((event, json.loads(data)))
    return result


@pytest.fixture
def settings(tmp_path):
    url = os.environ.get("TEST_DATABASE_URL", f"sqlite+aiosqlite:///{tmp_path}/assistant.db")
    if url.startswith("postgresql") and not url.rsplit("/", 1)[-1].endswith("_test"):
        pytest.fail("TEST_DATABASE_URL must point to a dedicated database ending in _test")
    return Settings(
        _env_file=None,
        database_url=url,
        auth_mode="demo",
        demo_jwt_secret=SECRET,
        demo_chunk_delay_seconds=0,
    )


@pytest_asyncio.fixture
async def app(settings, monkeypatch):
    monkeypatch.setenv("AI_DATABASE_URL", settings.database_url)
    config = Config(str(SERVICE / "alembic.ini"))
    await asyncio.to_thread(command.upgrade, config, "head")
    application = create_app(settings)
    async with application.router.lifespan_context(application):
        yield application
        # Only a dedicated test DB is ever cleaned, see guard above.
        if settings.database_url.startswith("postgresql"):
            async with application.state.database.engine.begin() as connection:
                for table in reversed(Base.metadata.sorted_tables):
                    await connection.execute(table.delete())


@pytest_asyncio.fixture
async def client(app):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as value:
        yield value


async def create(client, subject="alice", key=None):
    headers = auth(subject)
    if key:
        headers["Idempotency-Key"] = key
    response = await client.post(
        "/assistant/conversations", json={"title": "Брак"}, headers=headers
    )
    assert response.status_code == 201, response.text
    return response.json()["id"]
