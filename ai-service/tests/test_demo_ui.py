import httpx
import jwt
from conftest import CONTEXT, SECRET

from app.main import create_app


async def test_demo_page_assets_and_session_flow(app):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://127.0.0.1:8081"
    ) as client:
        page = await client.get("/")
        assert page.status_code == 200
        assert "Проверим «Проявитель»?" in page.text
        assert "frame-ancestors 'none'" in page.headers["content-security-policy"]
        assert SECRET not in page.text
        for file in ("app.js", "app.css", "favicon.svg"):
            assert (await client.get("/demo-assets/" + file)).status_code == 200
        sessions = []
        for user in ("director", "worker", "other"):
            response = await client.post(
                "/demo/session", json={"user": user}, headers={"Origin": "http://127.0.0.1:8081"}
            )
            assert response.status_code == 200
            assert response.headers["cache-control"] == "no-store"
            session = response.json()
            claims = jwt.decode(
                session["token"], SECRET, algorithms=["HS256"], audience="pulse-ai", issuer="pulse"
            )
            assert claims["sub"] == f"demo-{user}"
            sessions.append({"Authorization": "Bearer " + session["token"]})
        chat = await client.post("/assistant/conversations", json={}, headers=sessions[0])
        cid = chat.json()["id"]
        assert (
            await client.get(f"/assistant/conversations/{cid}", headers=sessions[1])
        ).status_code == 404
        assert (
            await client.post(
                f"/assistant/conversations/{cid}/messages",
                headers=sessions[0],
                json={"text": "Брак?", "context": CONTEXT},
            )
        ).status_code == 200


async def test_demo_login_rejects_cross_origin_and_unrecognized_users(app):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://localhost:8081"
    ) as client:
        for origin in (None, "https://untrusted.example", "http://localhost:3000"):
            response = await client.post(
                "/demo/session",
                json={"user": "director"},
                headers={"Origin": origin} if origin else {},
            )
            assert response.status_code == 403
        response = await client.post(
            "/demo/session", json={"user": "admin"}, headers={"Origin": "http://localhost:8081"}
        )
        assert response.status_code == 422
        response = await client.post(
            "/demo/session",
            json={"user": "director", "permissions": ["*"]},
            headers={"Origin": "http://localhost:8081"},
        )
        assert response.status_code == 422


async def test_demo_ui_rejects_external_host(app):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://public.example"
    ) as client:
        assert (await client.get("/")).status_code == 404
        assert (
            await client.post(
                "/demo/session",
                json={"user": "director"},
                headers={"Origin": "http://public.example"},
            )
        ).status_code == 404


async def test_demo_ui_disabled_in_jwt_mode_or_by_config(settings):
    for configured in (
        settings.model_copy(update={"demo_ui_enabled": False}),
        settings.model_copy(
            update={
                "auth_mode": "jwt",
                "platform_base_url": "http://platform",
                "jwt_public_key": "test-only-unused-key",
            }
        ),
    ):
        app = create_app(configured)
        async with app.router.lifespan_context(app):
            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app), base_url="http://localhost:8081"
            ) as client:
                assert (await client.get("/")).status_code == 404
                assert (
                    await client.post(
                        "/demo/session",
                        json={"user": "director"},
                        headers={"Origin": "http://localhost:8081"},
                    )
                ).status_code == 404
                assert (await client.get("/demo-assets/app.js")).status_code == 404
