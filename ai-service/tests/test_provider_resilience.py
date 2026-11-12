import json

import httpx
import pytest
from pydantic import SecretStr

from app.providers import CompatibleLLMProvider, ProviderStreamError


def configured(settings):
    settings.provider = "compatible"
    settings.llm_api_key = SecretStr("test-only")
    settings.llm_model = "deepseek-v4-flash"
    return settings


async def test_catalog_cached_for_sequential_generations(settings):
    settings = configured(settings)
    settings.provider = "aiai"
    calls = []

    def handler(request):
        calls.append(request.url.path)
        if request.url.path.endswith("models"):
            return httpx.Response(200, json={"data": [{"id": settings.llm_model}]})
        return httpx.Response(
            200, text='data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n'
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        provider = CompatibleLLMProvider(settings, http)
        for _ in range(3):
            assert "".join([chunk async for chunk in provider.stream([])]) == "OK"
    assert calls.count("/v1/models") == 1
    assert calls.count("/v1/chat/completions") == 3


async def test_retry_before_first_chunk_only(settings):
    settings = configured(settings)
    attempts = 0

    def handler(request):
        nonlocal attempts
        attempts += 1
        if attempts == 1:
            return httpx.Response(503)
        return httpx.Response(
            200, text='data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n'
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        assert (
            "".join([chunk async for chunk in CompatibleLLMProvider(settings, http).stream([])])
            == "OK"
        )
    assert attempts == 2


async def test_partial_failure_never_replays_generation(settings):
    settings = configured(settings)
    attempts = 0

    def handler(request):
        nonlocal attempts
        attempts += 1
        return httpx.Response(200, text='data: {"choices":[{"delta":{"content":"partial"}}]}\n\n')

    received = []
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        with pytest.raises(ProviderStreamError, match="interrupted"):
            async for chunk in CompatibleLLMProvider(settings, http).stream([]):
                received.append(chunk)
    assert received == ["partial"]
    assert attempts == 1


async def test_null_delta_and_confirmed_finish_without_done(settings):
    settings = configured(settings)
    response = 'data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: {"choices":[{"delta":null,"finish_reason":"stop"}]}'
    async with httpx.AsyncClient(
        transport=httpx.MockTransport(lambda r: httpx.Response(200, text=response))
    ) as http:
        assert (
            "".join([part async for part in CompatibleLLMProvider(settings, http).stream([])])
            == "OK"
        )


async def test_fast_parameters_sent_explicitly(settings):
    settings = configured(settings)
    settings.llm_thinking = "disabled"
    settings.llm_max_tokens = 1024

    def handler(request):
        body = json.loads(request.content)
        assert body["thinking"] == {"type": "disabled"}
        assert body["max_tokens"] == 1024
        return httpx.Response(
            200, text='data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n'
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        _ = [part async for part in CompatibleLLMProvider(settings, http).stream([])]


async def test_auth_errors_not_retried(settings):
    settings = configured(settings)
    attempts = 0

    def handler(request):
        nonlocal attempts
        attempts += 1
        return httpx.Response(401)

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        with pytest.raises(httpx.HTTPStatusError):
            _ = [part async for part in CompatibleLLMProvider(settings, http).stream([])]
    assert attempts == 1
