import httpx
import pytest
from pydantic import SecretStr

from app.config import Settings
from app.providers import CompatibleLLMProvider


def test_local_llm_requires_explicit_opt_in():
    settings = Settings(
        _env_file=None,
        provider="aiai",
        auth_mode="demo",
        demo_jwt_secret="x" * 32,
        mode="llm",
        llm_api_key="test-only",
        llm_model="deepseek-v4-flash",
        allow_demo_llm=True,
    )
    assert settings.mode == "llm"
    with pytest.raises(ValueError, match="Demo identities"):
        Settings(
            _env_file=None,
            auth_mode="demo",
            demo_jwt_secret="x" * 32,
            mode="llm",
            llm_api_key="test-only",
            llm_model="model",
            allow_demo_llm=True,
            demo_ui_enabled=False,
        )


def test_aiai_environment_aliases(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "aiai")
    monkeypatch.setenv("AI_BASE_URL", "https://vedai.by/api/v1")
    monkeypatch.setenv("AI_MODEL", "candidate")
    monkeypatch.setenv("AIAI_API_KEY", "test-secret")
    settings = Settings(_env_file=None, auth_mode="demo", demo_jwt_secret="x" * 32)
    assert settings.provider == "aiai"
    assert settings.llm_base_url == "https://vedai.by/api/v1"
    assert settings.llm_model == "candidate"
    assert settings.llm_api_key.get_secret_value() == "test-secret"
    assert "test-secret" not in repr(settings)


async def test_aiai_rejects_unlisted_model_before_generation(settings):
    paths = []

    def handler(request):
        paths.append(request.url.path)
        return httpx.Response(200, json={"data": [{"id": "available-model"}]})

    settings.provider = "aiai"
    settings.llm_model = "unverified-model"
    settings.llm_api_key = SecretStr("test-only")
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        provider = CompatibleLLMProvider(settings, http)
        with pytest.raises(ValueError, match="catalog"):
            _ = [part async for part in provider.stream([])]
    assert paths == ["/v1/models"]


async def test_aiai_validated_model_streams(settings):
    paths = []

    def handler(request):
        paths.append(request.url.path)
        if request.url.path.endswith("/models"):
            return httpx.Response(200, json={"data": [{"id": "chosen-model"}]})
        return httpx.Response(
            200, text='data: {"choices":[{"delta":{"content":"Работает"}}]}\n\ndata: [DONE]\n\n'
        )

    settings.provider = "aiai"
    settings.llm_model = "chosen-model"
    settings.llm_api_key = SecretStr("test-only")
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        provider = CompatibleLLMProvider(settings, http)
        assert "".join([part async for part in provider.stream([])]) == "Работает"
    assert paths == ["/v1/models", "/v1/chat/completions"]
