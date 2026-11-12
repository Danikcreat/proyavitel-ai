import asyncio
import json
import logging
import time
from contextlib import suppress

import anyio
import httpx

from app.agent import run_agent
from app.diagnostics import safe_error_code
from app.providers import ProviderStreamError
from app.schemas import AnalysisRunOut

log = logging.getLogger("proyavitel.stream")


def sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


async def stream_turn(request, turn, messages, sources, user=None):
    state = request.app.state
    repository = state.repository
    settings = state.settings
    trace = request.state.trace_id
    meta = {
        "conversation_id": turn.conversation_id,
        "user_message_id": turn.user_message_id,
        "assistant_message_id": turn.assistant.id,
        "mode": settings.mode,
        "replay": turn.replay,
        "reasoning_mode": turn.assistant.reasoning_mode,
    }
    if turn.replay:
        previous = await repository.runs(
            turn.conversation_id, limit=1, message_ids=[turn.assistant.id]
        )
        diagnostics = (
            AnalysisRunOut.model_validate(previous[0]).model_dump(mode="json") if previous else None
        )
        yield sse("meta", meta)
        if turn.assistant.sources:
            yield sse("sources", {"items": turn.assistant.sources})
        if turn.assistant.effective_context is not None:
            yield sse("context", turn.assistant.effective_context)
        if turn.assistant.text:
            yield sse("delta", {"delta": turn.assistant.text})
        if turn.assistant.status != "completed":
            yield sse(
                "error",
                {
                    "code": (diagnostics or {}).get("error_code") or turn.assistant.status,
                    "traceId": (diagnostics or {}).get("trace_id") or trace,
                },
            )
        if diagnostics:
            yield sse("diagnostics", diagnostics)
        yield sse("done", {"message_id": turn.assistant.id, "status": turn.assistant.status})
        return

    text = ""
    status = "cancelled"
    error = None
    iterator = None
    pending = None
    last_checkpoint = time.monotonic()
    if turn.metrics:
        turn.metrics.preparation_ms = turn.metrics.elapsed_ms()
    try:
        yield sse("meta", meta)
        yield sse("sources", {"items": sources})
        if turn.assistant.effective_context is not None:
            yield sse("context", turn.assistant.effective_context)
        reasoning_mode = turn.assistant.reasoning_mode
        yield sse("status", {"phase": "thinking" if reasoning_mode == "deep" else "waiting"})
        iterator = (
            run_agent(state, turn, messages, user, reasoning_mode)
            if user is not None and settings.mode == "llm"
            else state.orchestrator.stream(
                messages, reasoning_mode=reasoning_mode, metrics=turn.metrics
            )
        ).__aiter__()
        timeout = (
            settings.deep_timeout_seconds
            if reasoning_mode == "deep"
            else settings.stream_timeout_seconds
        )
        async with asyncio.timeout(timeout):
            while True:
                if await request.is_disconnected():
                    return
                if pending is None:
                    pending = asyncio.create_task(anext(iterator))
                ready, _ = await asyncio.wait({pending}, timeout=settings.heartbeat_seconds)
                if not ready:
                    yield ": heartbeat\n\n"
                    continue
                try:
                    chunk = pending.result()
                except StopAsyncIteration:
                    pending = None
                    status = "completed"
                    break
                pending = None
                if isinstance(chunk, dict):
                    event_type = chunk["type"]
                    if event_type != "delta":
                        yield sse(
                            event_type,
                            {key: value for key, value in chunk.items() if key != "type"},
                        )
                        continue
                    chunk = chunk["delta"]
                if not chunk:
                    continue
                if len(text) + len(chunk) > settings.max_output_chars:
                    raise ValueError("Output limit")
                if not text:
                    if turn.metrics:
                        turn.metrics.first_text()
                    yield sse("status", {"phase": "answering"})
                text += chunk
                if time.monotonic() - last_checkpoint >= 1:
                    await repository.checkpoint(turn, text)
                    last_checkpoint = time.monotonic()
                yield sse("delta", {"delta": chunk})
        if not text:
            raise ValueError("Empty model response")
    except (asyncio.CancelledError, GeneratorExit):
        status = "cancelled"
        raise
    except TimeoutError:
        status, error = "failed", "generation_timeout"
    except Exception as exc:
        status, error = "failed", "generation_failed"
        http_status = exc.response.status_code if isinstance(exc, httpx.HTTPStatusError) else None
        if isinstance(exc, ProviderStreamError):
            error = safe_error_code(exc.code.split(":", 1)[0])
        elif isinstance(exc, httpx.TimeoutException):
            error = "provider_timeout"
        elif isinstance(exc, httpx.TransportError):
            error = "provider_connection_lost"
        elif http_status == 429:
            error = "provider_rate_limited"
        elif http_status in (401, 403):
            error = "provider_auth_failed"
        elif http_status and http_status >= 500:
            error = "provider_unavailable"
        # Deliberately do not log exception strings, prompts, upstream bodies, or identity.
        log.warning(
            "generation_failed trace_id=%s code=%s exception_type=%s http_status=%s",
            trace,
            error,
            type(exc).__name__,
            http_status,
        )
    finally:
        # Starlette cancels the stream task on disconnect. Shield persistence and provider close.
        with anyio.CancelScope(shield=True):
            if pending:
                pending.cancel()
                with suppress(asyncio.CancelledError, Exception):
                    await pending
            if iterator and hasattr(iterator, "aclose"):
                with suppress(Exception):
                    await iterator.aclose()
            if turn.metrics:
                turn.metrics.error_code = error
            await repository.finish(turn, text, status)
    if error:
        yield sse("error", {"code": error, "traceId": trace})
    if turn.diagnostics:
        yield sse("diagnostics", turn.diagnostics)
        log.info(
            "analysis_finished trace_id=%s status=%s first_text_ms=%s total_ms=%s provider_calls=%s tool_calls=%s",
            trace,
            status,
            turn.diagnostics["first_text_ms"],
            turn.diagnostics["total_ms"],
            turn.diagnostics["provider_calls"],
            turn.diagnostics["tool_calls"],
        )
    yield sse("done", {"message_id": turn.assistant.id, "status": status})
