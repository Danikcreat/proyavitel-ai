"""Atomic per-user generation admission inside the message-claim transaction."""

import math
from datetime import timedelta

from fastapi import HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.dialects.sqlite import insert as sqlite_insert

from app.models import Conversation, GenerationGuard, GlobalGenerationGuard, Message, utcnow


async def lock_global_generation(session):
    insert = sqlite_insert if session.bind.dialect.name == "sqlite" else pg_insert
    await session.execute(
        insert(GlobalGenerationGuard)
        .values(id=1, touched_at=utcnow())
        .on_conflict_do_nothing(index_elements=["id"])
    )
    await session.execute(
        update(GlobalGenerationGuard)
        .where(GlobalGenerationGuard.id == 1)
        .values(touched_at=utcnow())
    )


async def admit_global_generation(session, settings):
    now = utcnow()
    active = await session.scalar(
        select(func.count())
        .select_from(Conversation)
        .where(Conversation.active_message_id.is_not(None), Conversation.lease_expires_at > now)
    )
    if active >= settings.global_max_concurrent_generations:
        raise HTTPException(
            429, "Сервис занят. Дождитесь освобождения генерации.", headers={"Retry-After": "1"}
        )
    for seconds, limit in (
        (60, settings.global_generation_requests_per_minute),
        (86400, settings.global_generation_requests_per_day),
    ):
        count, first = (
            await session.execute(
                select(func.count(), func.min(Message.created_at)).where(
                    Message.role == "assistant",
                    Message.created_at > now - timedelta(seconds=seconds),
                )
            )
        ).one()
        if count >= limit:
            retry = max(1, math.ceil((first + timedelta(seconds=seconds) - now).total_seconds()))
            raise HTTPException(
                429,
                "Достигнут общий лимит новых ответов сервиса. Попробуйте позже.",
                headers={"Retry-After": str(retry)},
            )


async def lock_generation_owner(session, owner):
    now = utcnow()
    insert = sqlite_insert if session.bind.dialect.name == "sqlite" else pg_insert
    await session.execute(
        insert(GenerationGuard)
        .values(owner_id=owner, touched_at=now)
        .on_conflict_do_nothing(index_elements=["owner_id"])
    )
    # UPDATE obtains a row lock on PostgreSQL and a write lock on SQLite. Held to commit.
    await session.execute(
        update(GenerationGuard).where(GenerationGuard.owner_id == owner).values(touched_at=now)
    )


async def admit_generation(session, owner, settings):
    now = utcnow()
    active = await session.scalar(
        select(func.count())
        .select_from(Conversation)
        .where(
            Conversation.owner_id == owner,
            Conversation.active_message_id.is_not(None),
            Conversation.lease_expires_at > now,
        )
    )
    if active >= settings.max_concurrent_generations_per_user:
        raise HTTPException(
            429,
            "Достигнут лимит одновременных ответов. Дождитесь завершения или остановите текущий ответ.",
            headers={"Retry-After": "1"},
        )
    for seconds, limit, label in (
        (60, settings.generation_requests_per_minute, "минуту"),
        (86400, settings.generation_requests_per_day, "24 часа"),
    ):
        count, first = (
            await session.execute(
                select(func.count(), func.min(Message.created_at))
                .join(Conversation, Conversation.id == Message.conversation_id)
                .where(
                    Conversation.owner_id == owner,
                    Message.role == "assistant",
                    Message.created_at > now - timedelta(seconds=seconds),
                )
            )
        ).one()
        if count >= limit:
            retry = max(1, math.ceil((first + timedelta(seconds=seconds) - now).total_seconds()))
            raise HTTPException(
                429,
                f"Достигнут лимит новых ответов за {label}. Попробуйте позже.",
                headers={"Retry-After": str(retry)},
            )
