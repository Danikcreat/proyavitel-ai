"""Per-request counters only: no prompts, credentials or hidden reasoning."""

import time
from contextlib import contextmanager
from dataclasses import dataclass, field
from datetime import datetime

from app.models import utcnow

SAFE_ERRORS = frozenset(
    {
        "generation_failed",
        "generation_timeout",
        "provider_timeout",
        "provider_connection_lost",
        "provider_stream_interrupted",
        "provider_rate_limited",
        "provider_auth_failed",
        "provider_unavailable",
        "provider_output_limit",
        "provider_response_invalid",
        "provider_content_filter",
        "provider_error",
        "agent_step_limit",
        "request_cancelled",
        "preparation_failed",
        "preparation_access_denied",
        "run_interrupted",
    }
)


def safe_error_code(code):
    return code if code in SAFE_ERRORS else "generation_failed"


@dataclass
class ProviderAttempt:
    usage: tuple[int, int, int] | None = None
    completed: bool = False

    def observe_usage(self, value):
        if not isinstance(value, dict):
            return
        counts = tuple(
            value.get(key) for key in ("prompt_tokens", "completion_tokens", "total_tokens")
        )
        if all(type(count) is int and 0 <= count <= 10**9 for count in counts):
            if counts[0] + counts[1] == counts[2]:
                # Streaming counters are cumulative. Replace, never add each chunk.
                self.usage = counts


@dataclass
class RunMetrics:
    started_monotonic: float = field(default_factory=time.perf_counter)
    started_at: datetime = field(default_factory=utcnow)
    preparation_ms: int | None = None
    first_text_ms: int | None = None
    provider_retries: int = 0
    provider_time_ms: float = 0
    tool_calls: int = 0
    tool_time_ms: float = 0
    error_code: str | None = None
    attempts: list[ProviderAttempt] = field(default_factory=list)

    def elapsed_ms(self):
        return max(0, round((time.perf_counter() - self.started_monotonic) * 1000))

    def first_text(self):
        if self.first_text_ms is None:
            self.first_text_ms = self.elapsed_ms()

    @contextmanager
    def provider_attempt(self):
        attempt = ProviderAttempt()
        self.attempts.append(attempt)
        started = time.perf_counter()
        try:
            yield attempt
            attempt.completed = True
        finally:
            self.provider_time_ms += (time.perf_counter() - started) * 1000

    def finish(self, text, status):
        reported = [attempt.usage for attempt in self.attempts if attempt.usage is not None]
        usage_status = "unknown"
        if reported:
            usage_status = (
                "complete"
                if all(attempt.completed and attempt.usage is not None for attempt in self.attempts)
                else "partial"
            )
        error = self.error_code or ("request_cancelled" if status == "cancelled" else None)
        return {
            "status": status,
            "finished_at": utcnow(),
            "preparation_ms": self.preparation_ms,
            "first_text_ms": self.first_text_ms,
            "total_ms": self.elapsed_ms(),
            "provider_calls": len(self.attempts),
            "provider_retries": self.provider_retries,
            "provider_time_ms": max(0, round(self.provider_time_ms)),
            "tool_calls": self.tool_calls,
            "tool_time_ms": max(0, round(self.tool_time_ms)),
            "output_chars": len(text),
            "reported_prompt_tokens": sum(item[0] for item in reported) if reported else None,
            "reported_completion_tokens": sum(item[1] for item in reported) if reported else None,
            "reported_total_tokens": sum(item[2] for item in reported) if reported else None,
            "usage_status": usage_status,
            "error_code": safe_error_code(error) if error else None,
        }
