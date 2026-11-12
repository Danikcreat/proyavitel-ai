import asyncio
import json
from datetime import timedelta

import httpx
import jwt
import pytest
from conftest import CONTEXT, auth, create
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException

from app.config import Settings
from app.main import create_app
from app.models import utcnow
from app.providers import CompatibleLLMProvider


async def test_concurrent_claims_have_single_winner(client, app):
    cid = await create(client)

    async def claim():
        try:
            return await app.state.repository.claim("alice", cid, {"text": "parallel"}, None, 120)
        except HTTPException as exc:
            return exc.status_code

    results = await asyncio.gather(claim(), claim())
    assert sum(result == 409 for result in results) == 1
    assert len(await app.state.repository.history(cid)) == 2


async def test_verified_platform_profile_overrides_jwt_claims(app, settings):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public = (
        key.public_key()
        .public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
        .decode()
    )
    current_permissions = ["assistant:use", "production:read"]
    seen = []

    def platform(request):
        seen.append(request.url.path)
        assert request.headers["Authorization"].startswith("Bearer ")
        if request.url.path == "/me":
            return httpx.Response(
                200,
                json={
                    "id": "alice",
                    "permissions": current_permissions,
                    "departmentScope": ["production"],
                },
            )
        if request.url.path == "/equipment/stations":
            return httpx.Response(200, json=[{"id": "st-03"}])
        return httpx.Response(404)

    configured = settings.model_copy(
        update={
            "auth_mode": "jwt",
            "jwt_public_key": public,
            "platform_base_url": "http://platform",
        }
    )
    integrated = create_app(configured, transport=httpx.MockTransport(platform))
    now = utcnow()
    signed = jwt.encode(
        {
            "sub": "alice",
            "iss": "pulse",
            "aud": "pulse-ai",
            "iat": now,
            "exp": now + timedelta(minutes=5),
            "permissions": ["*"],
        },
        key,
        algorithm="RS256",
    )
    headers = {"Authorization": f"Bearer {signed}"}
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as client:
            response = await client.post("/assistant/conversations", headers=headers, json={})
            cid = response.json()["id"]
            response = await client.post(
                f"/assistant/conversations/{cid}/messages",
                headers=headers,
                json={"text": "Брак", "context": CONTEXT},
            )
            assert response.status_code == 200
            assert "/equipment/stations" in seen
            current_permissions[:] = ["assistant:use"]
            denied = await client.post(
                f"/assistant/conversations/{cid}/messages", headers=headers, json={"text": "Ещё?"}
            )
            assert denied.status_code == 403
            # A valid HMAC token cannot be used against the platform's RSA verifier.
            assert (await client.get("/assistant/conversations", headers=auth())).status_code == 401


async def test_llm_wire_stream_and_history(settings):
    request_body = {}

    def model(request):
        nonlocal request_body
        request_body = json.loads(request.content)
        return httpx.Response(
            200,
            text=(
                ": keepalive\n\n"
                'data: {"choices":[{"delta":{"content":"Привет"}}]}\n\n'
                'data: {"choices":[{"delta":{"content":"!"}}]}\n\n'
                "data: [DONE]\n\n"
            ),
            headers={"content-type": "text/event-stream"},
        )

    settings.llm_api_key = __import__("pydantic").SecretStr("fake-test-key")
    settings.llm_model = "test-model"
    async with httpx.AsyncClient(transport=httpx.MockTransport(model)) as http:
        provider = CompatibleLLMProvider(settings, http)
        messages = [{"role": "user", "content": "Привет"}]
        assert "".join([chunk async for chunk in provider.stream(messages)]) == "Привет!"
        assert request_body == {"model": "test-model", "messages": messages, "stream": True}


async def test_llm_broken_stream_is_not_success(settings):
    settings.llm_api_key = __import__("pydantic").SecretStr("fake-test-key")
    settings.llm_model = "test-model"
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(
            lambda request: httpx.Response(
                200, text='data: {"choices":[{"delta":{"content":"partial"}}]}\n\n'
            )
        )
    ) as http:
        provider = CompatibleLLMProvider(settings, http)
        with pytest.raises(RuntimeError, match="without DONE"):
            _ = [chunk async for chunk in provider.stream([])]


def test_demo_credentials_cannot_reach_real_llm():
    with pytest.raises(ValueError, match="Demo identities"):
        Settings(
            _env_file=None,
            auth_mode="demo",
            demo_jwt_secret="x" * 32,
            mode="llm",
            llm_model="test",
            llm_api_key="fake",
        )
