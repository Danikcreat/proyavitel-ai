import asyncio
import json
import time
from collections.abc import AsyncIterator
from contextlib import nullcontext
from typing import Protocol

import httpx


class Provider(Protocol):
    def stream(
        self, messages: list[dict[str, str]], *, reasoning_mode: str | None = None
    ) -> AsyncIterator[str]: ...


class ProviderStreamError(RuntimeError):
    def __init__(self, code: str):
        self.code = code
        super().__init__(code)


class CompatibleLLMProvider:
    """OpenAI-compatible Chat Completions wire protocol, isolated from domain code."""

    def __init__(self, settings, http: httpx.AsyncClient):
        self.settings = settings
        self.http = http
        self._validated = None
        self._validation_lock = asyncio.Lock()

    async def available_models(self) -> list[str]:
        response = await self.http.get(
            self.settings.llm_base_url.rstrip("/") + "/models",
            headers={"Authorization": "Bearer " + self.settings.llm_api_key.get_secret_value()},
        )
        response.raise_for_status()
        payload = response.json()
        return [item["id"] for item in payload["data"] if isinstance(item.get("id"), str)]

    async def validate_model(self):
        key = (self.settings.llm_base_url, self.settings.llm_model)
        async with self._validation_lock:
            if (
                self._validated
                and self._validated[:2] == key
                and time.monotonic() < self._validated[2]
            ):
                return
            if self.settings.llm_model not in await self.available_models():
                raise ValueError("Configured model is not present in the provider model catalog")
            self._validated = (*key, time.monotonic() + 3600)

    async def stream(
        self, messages: list[dict[str, str]], *, reasoning_mode: str | None = None, metrics=None
    ) -> AsyncIterator[str]:
        emitted = False
        for attempt in range(3):
            try:
                if metrics and attempt:
                    metrics.provider_retries += 1
                with metrics.provider_attempt() if metrics else nullcontext() as attempt_metrics:
                    if self.settings.provider == "aiai":
                        await self.validate_model()
                    async for chunk in self._stream_once(
                        messages, reasoning_mode=reasoning_mode, attempt_metrics=attempt_metrics
                    ):
                        emitted = True
                        yield chunk
                return
            except (httpx.TransportError, httpx.HTTPStatusError, ProviderStreamError) as exc:
                retryable = (
                    isinstance(exc, httpx.TransportError)
                    or isinstance(exc, httpx.HTTPStatusError)
                    and exc.response.status_code in (408, 429, 500, 502, 503, 504)
                    or isinstance(exc, ProviderStreamError)
                    and exc.code.startswith("provider_stream_interrupted")
                )
                if emitted or not retryable or attempt == 2:
                    raise
                await asyncio.sleep(0.25 * (2**attempt))

    async def _stream_once(
        self,
        messages: list[dict[str, str]],
        *,
        reasoning_mode: str | None = None,
        attempt_metrics=None,
    ) -> AsyncIterator[str]:
        payload = {"model": self.settings.llm_model, "messages": messages, "stream": True}
        if self.settings.llm_max_tokens:
            payload["max_tokens"] = self.settings.llm_max_tokens
        if self.settings.llm_thinking and (self.settings.llm_model or "").startswith("deepseek"):
            payload["thinking"] = {"type": self.settings.llm_thinking}
        if reasoning_mode is not None and (self.settings.llm_model or "").startswith("deepseek"):
            payload["thinking"] = {"type": "enabled" if reasoning_mode == "deep" else "disabled"}
            if reasoning_mode == "deep":
                payload["max_tokens"] = self.settings.deep_max_tokens
                payload["reasoning_effort"] = "high"
        async with self.http.stream(
            "POST",
            self.settings.llm_base_url.rstrip("/") + "/chat/completions",
            headers={"Authorization": "Bearer " + self.settings.llm_api_key.get_secret_value()},
            json=payload,
            timeout=httpx.Timeout(self.settings.llm_read_timeout_seconds, connect=10),
        ) as response:
            response.raise_for_status()
            data: list[str] = []
            finished = False

            def decode(payload):
                nonlocal finished
                try:
                    event = json.loads(payload)
                    if not isinstance(event, dict):
                        raise ValueError()
                    if event.get("error"):
                        raise ProviderStreamError("provider_error")
                    if attempt_metrics:
                        attempt_metrics.observe_usage(event.get("usage"))
                    chunks = []
                    for choice in event.get("choices") or []:
                        if not isinstance(choice, dict):
                            raise ValueError()
                        reason = choice.get("finish_reason")
                        if reason == "length":
                            raise ProviderStreamError("provider_output_limit")
                        if reason in ("stop", "tool_calls", "content_filter"):
                            finished = True
                        delta = choice.get("delta") or {}
                        if not isinstance(delta, dict):
                            raise ValueError()
                        text = delta.get("content")
                        if isinstance(text, str) and text:
                            chunks.append(text)
                    return chunks
                except (ValueError, TypeError, AttributeError):
                    raise ProviderStreamError("provider_response_invalid") from None

            async for line in response.aiter_lines():
                if line.startswith("data:"):
                    data.append(line[5:].lstrip(" "))
                elif not line and data:
                    payload = "\n".join(data)
                    data.clear()
                    if payload == "[DONE]":
                        return
                    for text in decode(payload):
                        yield text
            if data:
                payload = "\n".join(data)
                if payload == "[DONE]":
                    return
                for text in decode(payload):
                    yield text
            if finished:
                return
            # A broken upstream connection must never be presented as a complete answer.
            raise ProviderStreamError("provider_stream_interrupted: without DONE or finish_reason")


class DemoProvider:
    def __init__(self, chunk_delay_seconds: float = 0.06):
        self.chunk_delay_seconds = chunk_delay_seconds

    async def stream(
        self, messages: list[dict[str, str]], *, reasoning_mode: str | None = None
    ) -> AsyncIterator[str]:
        facts = json.loads(messages[1]["content"])
        if facts.get("available"):
            before = facts["before_defects"] / facts["before_orders"] * 100
            current = facts["defects"] / facts["orders"] * 100
            answer = (
                f"Демонстрационные данные, не показатели компании. Для станка {facts['station']} "
                f"за 1–11 ноября 2026: {facts['defects']} бракованных из {facts['orders']} заказов "
                f"({current:.1f}%). В предыдущем синтетическом периоде — "
                f"{facts['before_defects']} из {facts['before_orders']} ({before:.1f}%). "
                f"Рост — {current - before:.1f} п.п. "
                "В демо-разметке 160 случаев связаны с оборудованием, 48 — с материалом, "
                "32 — с другими причинами. Это распределение меток, а не доказанная причинность. "
                "Предлагаю проверить настройки термопереплёта и партию материала, затем сравнить "
                "долю брака после проверки. Задачи автоматически не создаю. "
                "Источник: demo-production-v1, синтетический набор, срез 2026-11-11T09:00:00Z."
            )
        else:
            answer = (
                "Демонстрационный режим «Проявителя». Реальные данные компании не подключены. "
                "Для разбора роста брака передайте контекст production со станком st-03 "
                "и периодом 2026-11-01 — 2026-11-11. Для других сущностей и периодов "
                "в текущем демо нет проверенных данных."
            )
        turns = sum(message["role"] == "user" for message in messages)
        if turns > 1:
            answer += f" Продолжаю этот диалог; учтено сообщений пользователя: {turns}."
        for start in range(0, len(answer), 48):
            await asyncio.sleep(self.chunk_delay_seconds)
            yield answer[start : start + 48]
