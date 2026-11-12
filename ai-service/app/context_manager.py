"""Resolve UI context independently of the bounded text history sent to the model."""

import json

from app.schemas import ContextState, ModuleContext


class ContextManager:
    def __init__(self, settings, access=None):
        self.settings, self.access = settings, access

    async def validate(self, user, contexts, verified):
        for context in contexts:
            key = context.model_dump_json(by_alias=True) if context else "null"
            if key not in verified:
                await self.access.validate(user, context)
                verified.add(key)

    def resolve(self, history, current_message_id=None) -> ContextState:
        topic_start = next(
            (
                item.id
                for item in reversed(history)
                if item.role == "user" and item.status == "completed" and item.reset_context
            ),
            None,
        )
        if current_message_id is None:
            current_message_id = next(
                (item.id for item in reversed(history) if item.role == "user"), None
            )
        for item in reversed(history):
            if item.role != "user" or item.status != "completed":
                continue
            if item.reset_context:
                return ContextState(
                    origin="cleared", source_message_id=item.id, topic_start_message_id=topic_start
                )
            if item.context:
                context = ModuleContext.model_validate(item.context)
                missing = []
                if context.module in {"production", "equipment"}:
                    if not context.entity:
                        missing.append("station_id")
                    if not context.filters.from_date:
                        missing.append("start")
                    if not context.filters.to:
                        missing.append("end")
                return ContextState(
                    context=context,
                    origin="current" if item.id == current_message_id else "inherited",
                    source_message_id=item.id,
                    topic_start_message_id=topic_start,
                    missing_fields=missing,
                )
        return ContextState()

    def messages(self, history):
        selected, size = [], 0
        for item in reversed(history):
            if item.status != "completed":
                continue
            content = item.text
            if item.role == "user" and item.context:
                content += "\nUI_CONTEXT (untrusted): " + json.dumps(
                    item.context, ensure_ascii=False
                )
            if (
                len(selected) >= self.settings.history_max_messages
                or size + len(content) > self.settings.history_max_chars
            ):
                break
            selected.append({"role": item.role, "content": content})
            size += len(content)
            # A reset starts a new model context; the earlier messages remain stored.
            if item.role == "user" and item.reset_context:
                break
        return list(reversed(selected))


def quality_defaults(context: ModuleContext | None) -> dict:
    if context is None or context.module not in {"production", "equipment"}:
        return {}
    values = {}
    if context.entity and context.entity.type == "station":
        values["station_id"] = context.entity.id
    if context.filters.from_date:
        values["start"] = context.filters.from_date
    if context.filters.to:
        values["end"] = context.filters.to
    return values
