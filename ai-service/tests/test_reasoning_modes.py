import asyncio
import json

import httpx
import pytest
from conftest import auth, create, events
from pydantic import SecretStr

from app.providers import CompatibleLLMProvider


async def test_modes_are_saved_per_turn_and_included_in_meta(client):
    cid = await create(client)
    path = f"/assistant/conversations/{cid}/messages"
    deep = events(
        await client.post(
            path, headers=auth(), json={"text": "Разбери подробно", "reasoning_mode": "deep"}
        )
    )
    standard = events(
        await client.post(
            path, headers=auth(), json={"text": "Привет", "reasoning_mode": "standard"}
        )
    )
    assert deep[0][1]["reasoning_mode"] == "deep"
    assert standard[0][1]["reasoning_mode"] == "standard"
    assert ("status", {"phase": "thinking"}) in deep
    assert ("status", {"phase": "answering"}) in deep
    history = (await client.get(f"/assistant/conversations/{cid}", headers=auth())).json()[
        "messages"
    ]
    assert [item["reasoning_mode"] for item in history] == ["deep", "deep", "standard", "standard"]


async def test_idempotency_detects_mode_change(client):
    cid = await create(client)
    path = f"/assistant/conversations/{cid}/messages"
    headers = {**auth(), "Idempotency-Key": "reasoning-mode-test"}
    body = {"text": "Вопрос", "reasoning_mode": "deep"}
    first = events(await client.post(path, headers=headers, json=body))
    replay = events(await client.post(path, headers=headers, json=body))
    assert replay[0][1]["replay"] is True
    assert replay[0][1]["assistant_message_id"] == first[0][1]["assistant_message_id"]
    assert replay[0][1]["reasoning_mode"] == "deep"
    assert (
        await client.post(path, headers=headers, json={**body, "reasoning_mode": "standard"})
    ).status_code == 409


async def test_concurrent_provider_modes_do_not_mutate_shared_settings(settings):
    settings.provider = "compatible"
    settings.llm_model = "deepseek-v4-flash"
    settings.llm_api_key = SecretStr("test-only")
    settings.llm_thinking = "disabled"
    settings.llm_max_tokens = 1024
    requests = []

    def handler(request):
        requests.append(json.loads(request.content))
        return httpx.Response(
            200, text='data: {"choices":[{"delta":{"content":"OK"}}]}\n\ndata: [DONE]\n\n'
        )

    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http:
        provider = CompatibleLLMProvider(settings, http)

        async def generate(mode):
            return "".join([part async for part in provider.stream([], reasoning_mode=mode)])

        assert await asyncio.gather(generate("deep"), generate("standard")) == ["OK", "OK"]
    deep = next(request for request in requests if request["thinking"]["type"] == "enabled")
    standard = next(request for request in requests if request["thinking"]["type"] == "disabled")
    assert deep["max_tokens"] == settings.deep_max_tokens
    assert deep["reasoning_effort"] == "high"
    assert standard["max_tokens"] == 1024
    assert settings.llm_thinking == "disabled"


@pytest.mark.parametrize("mode", ["enabled", "unknown", 1])
async def test_invalid_reasoning_modes_rejected(client, mode):
    cid = await create(client)
    assert (
        await client.post(
            f"/assistant/conversations/{cid}/messages",
            headers=auth(),
            json={"text": "Вопрос", "reasoning_mode": mode},
        )
    ).status_code == 422
