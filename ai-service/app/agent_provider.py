"""Streaming function calls. Reasoning stays internal and is never sent as SSE text."""

import asyncio
import json
from contextlib import nullcontext

import httpx

from app.providers import ProviderStreamError


async def agent_turn(provider, messages, tools, reasoning_mode, metrics=None):
    emitted = False
    for attempt in range(3):
        try:
            if metrics and attempt:
                metrics.provider_retries += 1
            with metrics.provider_attempt() if metrics else nullcontext() as attempt_metrics:
                async for event in _agent_turn_once(
                    provider, messages, tools, reasoning_mode, attempt_metrics
                ):
                    emitted = True
                    yield event
            return
        except (httpx.TransportError, httpx.HTTPStatusError, ProviderStreamError) as exc:
            retryable = (
                isinstance(exc, httpx.TransportError)
                or isinstance(exc, httpx.HTTPStatusError)
                and exc.response.status_code in (408, 429, 500, 502, 503, 504)
                or isinstance(exc, ProviderStreamError)
                and exc.code == "provider_stream_interrupted"
            )
            if emitted or not retryable or attempt == 2:
                raise
            await asyncio.sleep(0.25 * 2**attempt)


async def _agent_turn_once(provider, messages, tools, reasoning_mode, attempt_metrics=None):
    settings = provider.settings
    if settings.provider == "aiai":
        await provider.validate_model()
    payload = {
        "model": settings.llm_model,
        "messages": messages,
        "stream": True,
        "tools": tools,
        "tool_choice": "auto",
    }
    if settings.llm_max_tokens:
        payload["max_tokens"] = settings.llm_max_tokens
    if (settings.llm_model or "").startswith("deepseek"):
        payload["thinking"] = {"type": "enabled" if reasoning_mode == "deep" else "disabled"}
        if reasoning_mode == "deep":
            payload.update(max_tokens=settings.deep_max_tokens, reasoning_effort="high")
    calls = {}
    content = ""
    reasoning = ""
    finished = False
    async with provider.http.stream(
        "POST",
        settings.llm_base_url.rstrip("/") + "/chat/completions",
        headers={"Authorization": "Bearer " + settings.llm_api_key.get_secret_value()},
        json=payload,
        timeout=httpx.Timeout(settings.llm_read_timeout_seconds, connect=10),
    ) as response:
        response.raise_for_status()
        data = []

        def decode(raw):
            nonlocal content, reasoning, finished
            if raw == "[DONE]":
                finished = True
                return []
            try:
                event = json.loads(raw)
                if not isinstance(event, dict) or event.get("error"):
                    raise ValueError()
                if attempt_metrics:
                    attempt_metrics.observe_usage(event.get("usage"))
                output = []
                for choice in event.get("choices") or []:
                    if choice.get("index", 0) != 0:
                        continue
                    end = choice.get("finish_reason")
                    if end == "length":
                        raise ProviderStreamError("provider_output_limit")
                    if end == "content_filter":
                        raise ProviderStreamError("provider_content_filter")
                    if end in ("stop", "tool_calls"):
                        finished = True
                    delta = choice.get("delta") or {}
                    text = delta.get("content")
                    if text:
                        if not isinstance(text, str):
                            raise ValueError()
                        content += text
                        output.append({"type": "delta", "delta": text})
                    hidden = delta.get("reasoning_content")
                    if hidden:
                        if not isinstance(hidden, str):
                            raise ValueError()
                        reasoning += hidden
                    for fragment in delta.get("tool_calls") or []:
                        index = fragment["index"]
                        if not isinstance(index, int) or not 0 <= index < 8:
                            raise ValueError()
                        call = calls.setdefault(
                            index,
                            {
                                "id": "",
                                "type": "function",
                                "function": {"name": "", "arguments": ""},
                            },
                        )
                        if fragment.get("id"):
                            call["id"] += fragment["id"]
                        function = fragment.get("function") or {}
                        call["function"]["name"] += function.get("name") or ""
                        call["function"]["arguments"] += function.get("arguments") or ""
                        if (
                            len(call["id"]) > 200
                            or len(call["function"]["name"]) > 100
                            or len(call["function"]["arguments"]) > 8192
                        ):
                            raise ValueError()
                if len(reasoning) > 160000 or len(content) > settings.max_output_chars:
                    raise ProviderStreamError("provider_output_limit")
                return output
            except (ValueError, TypeError, KeyError, AttributeError):
                raise ProviderStreamError("provider_response_invalid") from None

        async for line in response.aiter_lines():
            if line.startswith("data:"):
                data.append(line[5:].lstrip(" "))
            elif not line and data:
                for event in decode("\n".join(data)):
                    yield event
                data.clear()
        if data:
            for event in decode("\n".join(data)):
                yield event
    if not finished:
        raise ProviderStreamError("provider_stream_interrupted")
    ordered = [calls[index] for index in sorted(calls)]
    if any(not call["id"] or not call["function"]["name"] for call in ordered) or len(
        {call["id"] for call in ordered}
    ) != len(ordered):
        raise ProviderStreamError("provider_response_invalid")
    message = {"role": "assistant", "content": content or None}
    if ordered:
        message["tool_calls"] = ordered
    if reasoning:
        message["reasoning_content"] = reasoning
    yield {"type": "turn", "message": message}
