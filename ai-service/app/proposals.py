from datetime import date, timedelta

from fastapi import HTTPException
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from sqlalchemy import select, update

from app.models import AuditEvent, Message, SyntheticTask, TaskProposal, new_id, utcnow
from app.schemas import EntityContext, ModuleContext, TaskProposalOut
from app.tools import ToolError, ToolResult


class TaskDraft(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=5, max_length=120, pattern=r"\S")
    description: str = Field(min_length=20, max_length=2000, pattern=r"\S")
    reason: str = Field(min_length=10, max_length=1000, pattern=r"\S")
    station_id: str = Field(min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_.:-]+$")
    deadline: date | None = None


class ProposalService:
    def __init__(self, database, settings, access):
        self.database, self.settings, self.access = database, settings, access

    def definitions(self, user):
        if self.settings.auth_mode != "demo" or not {
            "assistant:use",
            "tasks:create",
            "production:read",
        }.issubset(user.permissions):
            return []
        return [
            {
                "type": "function",
                "function": {
                    "name": "propose_task",
                    "description": "Предложить тестовую задачу по станку для подтверждения пользователем. Ничего не выполняет. Исполнитель фиксирован сервером: Технолог (демо). Не придумывай срок: deadline=null, если пользователь его не задал.",
                    "parameters": TaskDraft.model_json_schema(),
                },
            }
        ]

    async def _authorize(self, user, station_id):
        if self.settings.auth_mode != "demo":
            raise HTTPException(503, "Создание задач в основном backend ещё не подключено")
        if not {"assistant:use", "tasks:create", "production:read"}.issubset(user.permissions):
            raise HTTPException(403, "Нет права создавать задачи по производству")
        await self.access.validate(
            user,
            ModuleContext(module="production", entity=EntityContext(type="station", id=station_id)),
        )

    @staticmethod
    def _audit(session, user, proposal_id, action, trace="agent"):
        session.add(
            AuditEvent(
                actor_id=user.id,
                trace_id=trace,
                action=action,
                result="success",
                object_id=proposal_id,
            )
        )

    async def prepare(self, turn, user, arguments, call_id):
        try:
            draft = TaskDraft.model_validate(arguments)
            await self._authorize(user, draft.station_id)
        except ValidationError:
            raise ToolError("invalid_proposal_arguments") from None
        except HTTPException:
            raise ToolError("proposal_access_denied") from None
        payload = draft.model_dump(mode="json", exclude={"reason"})
        payload.update(
            owner_id="demo-technologist", owner_name="Технолог (демо)", source="assistant"
        )
        async with self.database.sessions.begin() as session:
            proposal = await session.scalar(
                select(TaskProposal).where(TaskProposal.message_id == turn.assistant.id)
            )
            if proposal is None:
                proposal = TaskProposal(
                    id=new_id(),
                    owner_id=user.id,
                    conversation_id=turn.conversation_id,
                    message_id=turn.assistant.id,
                    call_id=call_id,
                    payload=payload,
                    reason=draft.reason,
                    status="pending",
                    expires_at=utcnow() + timedelta(hours=1),
                )
                session.add(proposal)
                self._audit(session, user, proposal.id, "proposal.created")
                await session.flush()
            return ToolResult(
                tool="propose_task",
                status="ok",
                data={
                    "proposal": TaskProposalOut.model_validate(proposal).model_dump(mode="json"),
                    "executed": False,
                },
            )

    async def list(self, user, conversation_id=None, topic_start_message_id=None):
        async with self.database.sessions() as session:
            query = select(TaskProposal).where(TaskProposal.owner_id == user.id)
            if conversation_id:
                query = query.where(TaskProposal.conversation_id == conversation_id)
            if topic_start_message_id:
                boundary = (
                    select(Message.sequence)
                    .where(
                        Message.id == topic_start_message_id,
                        Message.conversation_id == conversation_id,
                    )
                    .scalar_subquery()
                )
                query = query.where(
                    TaskProposal.message_id.in_(
                        select(Message.id).where(
                            Message.conversation_id == conversation_id, Message.sequence >= boundary
                        )
                    )
                )
            proposals = (
                await session.scalars(query.order_by(TaskProposal.created_at.desc()).limit(100))
            ).all()
            visible = []
            for proposal in proposals:
                try:
                    await self._authorize(user, proposal.payload["station_id"])
                except HTTPException:
                    continue
                visible.append(TaskProposalOut.model_validate(proposal))
            return visible

    async def decide(self, user, proposal_id, accept, trace):
        async with self.database.sessions() as session:
            proposal = await session.scalar(
                select(TaskProposal).where(
                    TaskProposal.id == proposal_id, TaskProposal.owner_id == user.id
                )
            )
            if proposal is None:
                raise HTTPException(404, "Предложение не найдено")
            station_id = proposal.payload["station_id"]
        try:
            await self._authorize(user, station_id)
        except HTTPException:
            async with self.database.sessions.begin() as session:
                session.add(
                    AuditEvent(
                        actor_id=user.id,
                        trace_id=trace,
                        action="proposal.confirm_denied" if accept else "proposal.reject_denied",
                        result="denied",
                        object_id=proposal_id,
                    )
                )
            raise
        async with self.database.sessions.begin() as session:
            # A single conditional update serializes confirm/reject across processes.
            changed = await session.execute(
                update(TaskProposal)
                .where(
                    TaskProposal.id == proposal_id,
                    TaskProposal.owner_id == user.id,
                    TaskProposal.status == "pending",
                    TaskProposal.expires_at > utcnow(),
                )
                .values(status="confirmed" if accept else "rejected")
            )
            proposal = await session.scalar(
                select(TaskProposal).where(TaskProposal.id == proposal_id)
            )
            if not changed.rowcount:
                if (
                    accept
                    and proposal.status == "executed"
                    or not accept
                    and proposal.status == "rejected"
                ):
                    return TaskProposalOut.model_validate(proposal)
                raise HTTPException(409, "Предложение уже обработано или срок подтверждения истёк")
            self._audit(
                session,
                user,
                proposal_id,
                "proposal.confirmed" if accept else "proposal.rejected",
                trace,
            )
            if accept:
                task_id = new_id()
                session.add(
                    SyntheticTask(id=task_id, proposal_id=proposal_id, payload=proposal.payload)
                )
                proposal.status = "executed"
                proposal.result = {
                    "id": task_id,
                    "synthetic": True,
                    "title": proposal.payload["title"],
                    "note": "Тестовая задача сохранена в AI-сервисе; основной backend не изменён",
                }
                self._audit(session, user, proposal_id, "synthetic_task.created", trace)
            await session.flush()
            return TaskProposalOut.model_validate(proposal)
