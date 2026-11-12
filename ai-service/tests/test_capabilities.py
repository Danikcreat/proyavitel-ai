from datetime import timedelta

import httpx
import jwt
from conftest import auth
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from pydantic import SecretStr

from app.auth import Principal
from app.main import create_app
from app.models import utcnow


async def test_capabilities_match_modes_permissions_and_validation_without_llm(
    client, app, settings
):
    assert (await client.get("/assistant/capabilities")).status_code == 401
    assert (
        await client.get("/assistant/capabilities", headers=auth(permissions=[]))
    ).status_code == 403
    simulated = (await client.get("/assistant/capabilities", headers=auth())).json()
    assert simulated["tool_calling"] is False and simulated["tools"] == []
    assert all(mode["simulated"] for mode in simulated["reasoning_modes"])

    def no_provider_calls(request):
        raise AssertionError("Capabilities must not call the LLM or catalog")

    configured = settings.model_copy(
        update={
            "mode": "llm",
            "allow_demo_llm": True,
            "llm_model": "deepseek-v4-flash",
            "llm_api_key": SecretStr("test-secret-key"),
        }
    )
    integrated = create_app(configured, transport=httpx.MockTransport(no_provider_calls))
    permissions = [
        "assistant:use",
        "production:read",
        "equipment:read",
        "kb:read",
        "finance:read",
        "tasks:create",
    ]
    async with integrated.router.lifespan_context(integrated):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=integrated), base_url="http://test"
        ) as connected:
            response = await connected.get(
                "/assistant/capabilities", headers=auth(permissions=permissions)
            )
            assert response.status_code == 200
            assert "no-store" in response.headers["cache-control"]
            assert response.headers["vary"] == "Authorization"
            data = response.json()
            assert data["tool_calling"] is True
            assert [mode["id"] for mode in data["reasoning_modes"]] == ["standard", "deep"]
            principal = Principal(
                "alice", frozenset(permissions), frozenset({"production"}), "test"
            )
            definitions = integrated.state.tools.definitions(
                principal
            ) + integrated.state.proposals.definitions(principal)
            assert {tool["name"] for tool in data["tools"]} == {
                item["function"]["name"] for item in definitions
            }
            assert data["actions"][0]["requires_confirmation"] is True
            assert data["actions"][0]["execution"] == "synthetic"
            finance = next(module for module in data["modules"] if module["id"] == "finance")
            assert finance["entity_types"] == [] and finance["data_tools"] == []
            assert "test-secret-key" not in response.text and "Bearer" not in response.text

            worker = (await connected.get("/assistant/capabilities", headers=auth())).json()
            assert [module["id"] for module in worker["modules"]] == ["production"]
            assert [tool["name"] for tool in worker["tools"]] == ["get_defect_summary"]
            assert worker["actions"] == []
            configured.llm_model = "another-model"
            changed = (await connected.get("/assistant/capabilities", headers=auth())).json()
            assert [mode["id"] for mode in changed["reasoning_modes"]] == ["standard"]
            cid = (
                await connected.post("/assistant/conversations", headers=auth(), json={})
            ).json()["id"]
            path = f"/assistant/conversations/{cid}/messages"
            assert (
                await connected.post(
                    path, headers=auth(), json={"text": "test", "reasoning_mode": "deep"}
                )
            ).status_code == 422
            assert (
                await connected.post(
                    path,
                    headers=auth(),
                    json={"text": "x" * (changed["limits"]["max_message_chars"] + 1)},
                )
            ).status_code == 422


async def test_platform_capabilities_use_current_profile_and_report_contract_gaps(app, settings):
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public = (
        key.public_key()
        .public_bytes(serialization.Encoding.PEM, serialization.PublicFormat.SubjectPublicKeyInfo)
        .decode()
    )
    current_permissions = ["assistant:use", "production:read", "kb:read", "tasks:create"]
    seen = []

    def platform(request):
        seen.append(request.url.path)
        assert request.url.path == "/me"
        return httpx.Response(
            200,
            json={
                "id": "alice",
                "permissions": current_permissions,
                "departmentScope": ["production"],
            },
        )

    configured = settings.model_copy(
        update={
            "mode": "llm",
            "auth_mode": "jwt",
            "jwt_public_key": public,
            "platform_base_url": "http://platform",
            "llm_model": "deepseek-v4-flash",
            "llm_api_key": SecretStr("test-secret-key"),
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
        ) as connected:
            first = (await connected.get("/assistant/capabilities", headers=headers)).json()
            assert first["actions"] == []  # Real task writes are not configured.
            assert {tool["name"] for tool in first["tools"]} == {
                "get_defect_summary",
                "search_knowledge",
            }
            quality = next(tool for tool in first["tools"] if tool["name"] == "get_defect_summary")
            assert quality["contract_status"] == "pending" and quality["data_source"] is None
            production = next(module for module in first["modules"] if module["id"] == "production")
            assert production["unsupported_filters_with_entity"] == ["department"]
            assert (
                next(tool for tool in first["tools"] if tool["name"] == "search_knowledge")[
                    "data_source"
                ]
                == "platform_api"
            )
            current_permissions[:] = ["assistant:use", "equipment:read"]
            second = (await connected.get("/assistant/capabilities", headers=headers)).json()
            assert [module["id"] for module in second["modules"]] == ["equipment"]
            assert [tool["name"] for tool in second["tools"]] == ["get_stations"]
    assert seen == ["/me", "/me"]
