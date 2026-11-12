"""Exercise the public HTTP API using local demo identities; never print tokens."""

import argparse
from datetime import UTC, datetime, timedelta

import httpx
import jwt
from app.config import Settings

parser = argparse.ArgumentParser()
parser.add_argument("--base-url", default="http://127.0.0.1:8081")
args = parser.parse_args()
settings = Settings()
if settings.auth_mode != "demo":
    parser.error("This smoke script requires demo auth")


def headers(subject):
    now = datetime.now(UTC)
    token = jwt.encode(
        {
            "sub": subject,
            "iss": settings.jwt_issuer,
            "aud": settings.jwt_audience,
            "iat": now,
            "exp": now + timedelta(minutes=5),
            "permissions": ["assistant:use", "production:read"],
            "departmentScope": ["production"],
        },
        settings.demo_jwt_secret.get_secret_value(),
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


with httpx.Client(base_url=args.base_url, timeout=150) as client:
    client.get("/health/ready").raise_for_status()
    owner = headers("demo-smoke")
    response = client.post(
        "/assistant/conversations", json={"title": "Smoke: рост брака"}, headers=owner
    )
    response.raise_for_status()
    cid = response.json()["id"]
    print("Диалог:", cid)
    with client.stream(
        "POST",
        f"/assistant/conversations/{cid}/messages",
        headers=owner,
        json={
            "text": "Почему вырос процент брака?",
            "context": {
                "module": "production",
                "screen": "station_details",
                "entity": {"type": "station", "id": "st-03"},
                "filters": {"from": "2026-11-01", "to": "2026-11-11"},
            },
        },
    ) as stream:
        stream.raise_for_status()
        for line in stream.iter_lines():
            print(line)
    history = client.get(f"/assistant/conversations/{cid}", headers=owner)
    history.raise_for_status()
    messages = history.json()["messages"]
    assert len(messages) == 2 and messages[-1]["status"] == "completed"
    assert (
        client.get(
            f"/assistant/conversations/{cid}", headers=headers("demo-smoke-other")
        ).status_code
        == 404
    )
    print("OK: SSE, история, контекст и изоляция пользователей.")
