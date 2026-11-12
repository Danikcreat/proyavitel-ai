import hashlib
import json
from dataclasses import dataclass
from datetime import timedelta

from fastapi import HTTPException
from sqlalchemy import or_, select, update
from sqlalchemy.exc import IntegrityError

from app.admission import (
    admit_generation,
    admit_global_generation,
    lock_generation_owner,
    lock_global_generation,
)
from app.diagnostics import RunMetrics
from app.models import AnalysisRun, AuditEvent, Conversation, Message, ToolCall, new_id, utcnow
from app.pulse import PulseForbidden, PulseUnavailable
from app.schemas import AnalysisRunOut
from app.tools import REGISTRY


def fingerprint(payload: dict) -> str:
    return hashlib.sha256(
        json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()
    ).hexdigest()


@dataclass
class Turn:
    conversation_id: str
    user_message_id: str
    assistant: Message
    replay: bool = False
    metrics: RunMetrics | None = None
    diagnostics: dict | None = None


class Repository:
    def __init__(self, database):
        self.database = database

    async def record_tool(self, turn, user, call_id, name, arguments, result):
        async with self.database.sessions.begin() as session:
            session.add(
                ToolCall(
                    conversation_id=turn.conversation_id,
                    message_id=turn.assistant.id,
                    call_id=call_id,
                    tool=name,
                    permission="tasks:create"
                    if name == "propose_task"
                    else REGISTRY.get(name, ("unknown",))[0],
                    department_scope=sorted(user.departments),
                    arguments=arguments if result["status"] != "denied" else {},
                    result=result,
                )
            )

    async def save_sources(self, turn, sources):
        async with self.database.sessions.begin() as session:
            await session.execute(
                update(Message)
                .where(Message.id == turn.assistant.id, Message.status == "streaming")
                .values(sources=sources)
            )

    async def save_context(self, turn, context, sources):
        snapshot = context.model_dump(mode="json", by_alias=True)
        async with self.database.sessions.begin() as session:
            await session.execute(
                update(Message)
                .where(Message.id == turn.assistant.id, Message.status == "streaming")
                .values(effective_context=snapshot, sources=sources)
            )
            if turn.metrics:
                turn.metrics.preparation_ms = turn.metrics.elapsed_ms()
                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.message_id == turn.assistant.id)
                    .values(status="running", preparation_ms=turn.metrics.preparation_ms)
                )
        turn.assistant.effective_context = snapshot

    async def assert_tool_access(
        self, user, conversation_id, knowledge=None, verified_documents=None
    ):
        verified_documents = verified_documents if verified_documents is not None else set()
        async with self.database.sessions() as session:
            calls = (
                await session.scalars(
                    select(ToolCall).where(ToolCall.conversation_id == conversation_id)
                )
            ).all()
            knowledge_ids = set()
            for call in calls:
                if call.result.get("status") != "ok":
                    continue
                if call.tool == "propose_task" and "production:read" not in user.permissions:
                    raise HTTPException(403, "Доступ к источникам этого диалога изменился")
                if call.permission not in user.permissions or (
                    "*" not in user.departments
                    and not set(call.department_scope).issubset(user.departments)
                ):
                    raise HTTPException(403, "Доступ к источникам этого диалога изменился")
                if call.tool in {"search_knowledge", "read_knowledge_article"}:
                    knowledge_ids.update(source["id"] for source in call.result.get("sources", []))
            for document_id in knowledge_ids - verified_documents:
                if knowledge is None:
                    raise HTTPException(503, "Проверка доступа к документам недоступна")
                try:
                    await knowledge.authorize(user, document_id)
                    verified_documents.add(document_id)
                except PulseForbidden:
                    raise HTTPException(
                        403, "Доступ к документам этого диалога изменился"
                    ) from None
                except PulseUnavailable:
                    raise HTTPException(503, "Проверка доступа к документам недоступна") from None

    async def audit_denied(self, owner: str, trace: str):
        async with self.database.sessions.begin() as session:
            session.add(
                AuditEvent(
                    actor_id=owner,
                    trace_id=trace,
                    action="context_or_conversation",
                    result="denied",
                )
            )

    async def create(self, owner: str, title: str, key: str | None):
        digest = fingerprint({"title": title})
        try:
            async with self.database.sessions.begin() as session:
                if key:
                    previous = await session.scalar(
                        select(Conversation).where(
                            Conversation.owner_id == owner, Conversation.create_key == key
                        )
                    )
                    if previous:
                        if previous.create_hash != digest:
                            raise HTTPException(
                                409, "Idempotency-Key уже использован с другим запросом"
                            )
                        return previous
                conversation = Conversation(
                    owner_id=owner, title=title, create_key=key, create_hash=digest
                )
                session.add(conversation)
                await session.flush()
                return conversation
        except IntegrityError:
            if not key:
                raise
            return await self.create(owner, title, key)

    async def owned(self, owner: str, conversation_id: str):
        async with self.database.sessions() as session:
            conversation = await session.scalar(
                select(Conversation).where(
                    Conversation.id == conversation_id, Conversation.owner_id == owner
                )
            )
            if conversation is None:
                raise HTTPException(404, "Диалог не найден")
            return conversation

    async def list(self, owner: str, limit: int, offset: int):
        async with self.database.sessions() as session:
            return list(
                (
                    await session.scalars(
                        select(Conversation)
                        .where(Conversation.owner_id == owner)
                        .order_by(Conversation.updated_at.desc(), Conversation.id)
                        .limit(limit)
                        .offset(offset)
                    )
                ).all()
            )

    async def history(self, conversation_id: str, limit: int | None = None, offset: int = 0):
        async with self.database.sessions() as session:
            query = select(Message).where(Message.conversation_id == conversation_id)
            if limit is not None:
                query = query.order_by(Message.sequence.desc()).limit(limit).offset(offset)
                return list(reversed((await session.scalars(query)).all()))
            return list((await session.scalars(query.order_by(Message.sequence))).all())

    async def runs(self, conversation_id, limit=20, offset=0, message_ids=None):
        async with self.database.sessions() as session:
            query = select(AnalysisRun).where(AnalysisRun.conversation_id == conversation_id)
            if message_ids is not None:
                query = query.where(AnalysisRun.message_id.in_(message_ids))
            return list(
                (
                    await session.scalars(
                        query.order_by(AnalysisRun.started_at.desc(), AnalysisRun.message_id)
                        .limit(limit)
                        .offset(offset)
                    )
                ).all()
            )

    async def recover_expired(self, conversation_id: str, owner: str):
        async with self.database.sessions.begin() as session:
            conversation = await session.scalar(
                select(Conversation).where(
                    Conversation.id == conversation_id,
                    Conversation.owner_id == owner,
                    Conversation.lease_expires_at < utcnow(),
                    Conversation.active_message_id.is_not(None),
                )
            )
            if conversation is None:
                return
            active_id = conversation.active_message_id
            result = await session.execute(
                update(Conversation)
                .where(
                    Conversation.id == conversation_id,
                    Conversation.active_message_id == active_id,
                    Conversation.lease_expires_at < utcnow(),
                )
                .values(active_message_id=None, lease_expires_at=None)
            )
            if result.rowcount:
                await session.execute(
                    update(Message)
                    .where(Message.id == active_id, Message.status == "streaming")
                    .values(status="interrupted")
                )
                await session.execute(
                    update(AnalysisRun)
                    .where(AnalysisRun.message_id == active_id)
                    .values(
                        status="interrupted", finished_at=utcnow(), error_code="run_interrupted"
                    )
                )

    async def claim(
        self,
        owner: str,
        conversation_id: str,
        payload: dict,
        key: str | None,
        lease_seconds: float,
        *,
        metrics: RunMetrics | None = None,
        run_info: dict | None = None,
        admission_settings=None,
    ):
        await self.owned(owner, conversation_id)
        await self.recover_expired(conversation_id, owner)
        digest = fingerprint(payload)
        assistant_id = new_id()
        async with self.database.sessions.begin() as session:
            if admission_settings is not None:
                await lock_global_generation(session)
                await lock_generation_owner(session, owner)
            if key:
                previous = await session.scalar(
                    select(Message).where(
                        Message.conversation_id == conversation_id, Message.request_key == key
                    )
                )
                if previous:
                    if previous.request_hash != digest:
                        raise HTTPException(
                            409, "Idempotency-Key уже использован с другим запросом"
                        )
                    if previous.status == "streaming":
                        raise HTTPException(409, "Этот ответ ещё формируется")
                    user_id = await session.scalar(
                        select(Message.id).where(
                            Message.conversation_id == conversation_id,
                            Message.sequence == previous.sequence - 1,
                        )
                    )
                    return Turn(conversation_id, user_id, previous, replay=True)
            if admission_settings is not None:
                active = await session.scalar(
                    select(Conversation.id).where(
                        Conversation.id == conversation_id,
                        Conversation.active_message_id.is_not(None),
                        Conversation.lease_expires_at > utcnow(),
                    )
                )
                if active:
                    raise HTTPException(
                        409, "В диалоге уже формируется ответ; дождитесь завершения"
                    )
                await admit_generation(session, owner, admission_settings)
                await admit_global_generation(session, admission_settings)
            now = utcnow()
            sequence = await session.scalar(
                update(Conversation)
                .where(
                    Conversation.id == conversation_id,
                    Conversation.owner_id == owner,
                    or_(
                        Conversation.active_message_id.is_(None),
                        Conversation.lease_expires_at < now,
                    ),
                )
                .values(
                    active_message_id=assistant_id,
                    lease_expires_at=now + timedelta(seconds=lease_seconds + 30),
                    next_sequence=Conversation.next_sequence + 2,
                    updated_at=now,
                )
                .returning(Conversation.next_sequence)
            )
            if sequence is None:
                raise HTTPException(409, "В диалоге уже формируется ответ; дождитесь завершения")
            # Also handles a process that died while generating an earlier response.
            await session.execute(
                update(Message)
                .where(Message.conversation_id == conversation_id, Message.status == "streaming")
                .values(status="interrupted")
            )
            await session.execute(
                update(AnalysisRun)
                .where(
                    AnalysisRun.conversation_id == conversation_id,
                    AnalysisRun.status.in_(["preparing", "running"]),
                )
                .values(status="interrupted", finished_at=now, error_code="run_interrupted")
            )
            user = Message(
                id=new_id(),
                conversation_id=conversation_id,
                sequence=sequence - 2,
                role="user",
                text=payload["text"],
                context=payload.get("context"),
                reset_context=payload.get("reset_context", False),
                status="completed",
                reasoning_mode=payload.get("reasoning_mode", "standard"),
            )
            assistant = Message(
                id=assistant_id,
                conversation_id=conversation_id,
                sequence=sequence - 1,
                role="assistant",
                text="",
                status="streaming",
                request_key=key,
                request_hash=digest,
                reasoning_mode=payload.get("reasoning_mode", "standard"),
            )
            session.add_all([user, assistant])
            await session.flush()
            if metrics:
                session.add(
                    AnalysisRun(
                        message_id=assistant_id,
                        conversation_id=conversation_id,
                        started_at=metrics.started_at,
                        status="preparing",
                        reasoning_mode=assistant.reasoning_mode,
                        **run_info,
                    )
                )
            return Turn(conversation_id, user.id, assistant, metrics=metrics)

    async def renew(self, turn: Turn, lease_seconds: float):
        async with self.database.sessions.begin() as session:
            result = await session.execute(
                update(Conversation)
                .where(
                    Conversation.id == turn.conversation_id,
                    Conversation.active_message_id == turn.assistant.id,
                )
                .values(lease_expires_at=utcnow() + timedelta(seconds=lease_seconds + 30))
            )
            if not result.rowcount:
                raise HTTPException(409, "Время подготовки ответа истекло; отправьте новый запрос")

    async def checkpoint(self, turn: Turn, text: str):
        async with self.database.sessions.begin() as session:
            await session.execute(
                update(Message)
                .where(Message.id == turn.assistant.id, Message.status == "streaming")
                .values(text=text)
            )

    async def finish(self, turn: Turn, text: str, status: str):
        measurements = turn.metrics.finish(text, status) if turn.metrics else None
        async with self.database.sessions.begin() as session:
            result = await session.execute(
                update(Conversation)
                .where(
                    Conversation.id == turn.conversation_id,
                    Conversation.active_message_id == turn.assistant.id,
                )
                .values(active_message_id=None, lease_expires_at=None, updated_at=utcnow())
            )
            if result.rowcount:
                await session.execute(
                    update(Message)
                    .where(Message.id == turn.assistant.id, Message.status == "streaming")
                    .values(text=text, status=status)
                )
                if turn.metrics:
                    run = await session.get(AnalysisRun, turn.assistant.id)
                    if run:
                        for key, value in measurements.items():
                            setattr(run, key, value)
                        await session.flush()
                        turn.diagnostics = AnalysisRunOut.model_validate(run).model_dump(
                            mode="json"
                        )
