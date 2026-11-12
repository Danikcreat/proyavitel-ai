from datetime import UTC, datetime
from uuid import uuid4

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
    false,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy.types import TypeDecorator


def utcnow() -> datetime:
    return datetime.now(UTC)


def new_id() -> str:
    return str(uuid4())


class Base(DeclarativeBase):
    pass


class UTCDateTime(TypeDecorator):
    """Postgres returns aware UTC datetimes; restore the same semantics in SQLite tests."""

    impl = DateTime(timezone=True)
    cache_ok = True

    def process_result_value(self, value, dialect):
        if value is not None and value.tzinfo is None:
            return value.replace(tzinfo=UTC)
        return value.astimezone(UTC) if value is not None else None


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        UniqueConstraint("owner_id", "create_key", name="uq_conversation_create_key"),
        Index("ix_conversation_owner_updated", "owner_id", "updated_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(String(200))
    title: Mapped[str] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    next_sequence: Mapped[int] = mapped_column(Integer, default=0)
    active_message_id: Mapped[str | None] = mapped_column(String(36))
    lease_expires_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    create_key: Mapped[str | None] = mapped_column(String(128))
    create_hash: Mapped[str | None] = mapped_column(String(64))


class GenerationGuard(Base):
    __tablename__ = "generation_guards"
    owner_id: Mapped[str] = mapped_column(String(200), primary_key=True)
    touched_at: Mapped[datetime] = mapped_column(UTCDateTime())


class GlobalGenerationGuard(Base):
    __tablename__ = "global_generation_guard"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    touched_at: Mapped[datetime] = mapped_column(UTCDateTime())


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        UniqueConstraint("conversation_id", "sequence", name="uq_message_sequence"),
        UniqueConstraint("conversation_id", "request_key", name="uq_message_request_key"),
        Index("ix_messages_conversation_created", "conversation_id", "created_at"),
        Index("ix_messages_role_created", "role", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    sequence: Mapped[int] = mapped_column(Integer)
    role: Mapped[str] = mapped_column(String(16))
    text: Mapped[str] = mapped_column(Text, default="")
    context: Mapped[dict | None] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String(16), default="completed")
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    request_key: Mapped[str | None] = mapped_column(String(128))
    request_hash: Mapped[str | None] = mapped_column(String(64))
    reasoning_mode: Mapped[str] = mapped_column(
        String(16), default="standard", server_default="standard"
    )
    sources: Mapped[list | None] = mapped_column(JSON)
    reset_context: Mapped[bool] = mapped_column(Boolean, default=False, server_default=false())
    effective_context: Mapped[dict | None] = mapped_column(JSON)


class ToolCall(Base):
    __tablename__ = "tool_calls"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    message_id: Mapped[str] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"), index=True
    )
    call_id: Mapped[str] = mapped_column(String(200))
    tool: Mapped[str] = mapped_column(String(100))
    permission: Mapped[str] = mapped_column(String(100))
    department_scope: Mapped[list] = mapped_column(JSON)
    arguments: Mapped[dict] = mapped_column(JSON)
    result: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    message_id: Mapped[str] = mapped_column(
        ForeignKey("messages.id", ondelete="CASCADE"), primary_key=True
    )
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    trace_id: Mapped[str] = mapped_column(String(36))
    mode: Mapped[str] = mapped_column(String(16))
    provider: Mapped[str | None] = mapped_column(String(32))
    model: Mapped[str | None] = mapped_column(String(200))
    reasoning_mode: Mapped[str] = mapped_column(String(16))
    status: Mapped[str] = mapped_column(String(16))
    started_at: Mapped[datetime] = mapped_column(UTCDateTime())
    finished_at: Mapped[datetime | None] = mapped_column(UTCDateTime())
    preparation_ms: Mapped[int | None] = mapped_column(Integer)
    first_text_ms: Mapped[int | None] = mapped_column(Integer)
    total_ms: Mapped[int | None] = mapped_column(Integer)
    provider_calls: Mapped[int | None] = mapped_column(Integer)
    provider_retries: Mapped[int | None] = mapped_column(Integer)
    provider_time_ms: Mapped[int | None] = mapped_column(Integer)
    tool_calls: Mapped[int | None] = mapped_column(Integer)
    tool_time_ms: Mapped[int | None] = mapped_column(Integer)
    output_chars: Mapped[int | None] = mapped_column(Integer)
    reported_prompt_tokens: Mapped[int | None] = mapped_column(BigInteger)
    reported_completion_tokens: Mapped[int | None] = mapped_column(BigInteger)
    reported_total_tokens: Mapped[int | None] = mapped_column(BigInteger)
    usage_status: Mapped[str] = mapped_column(String(16), default="unknown")
    error_code: Mapped[str | None] = mapped_column(String(80))


class AuditEvent(Base):
    __tablename__ = "assistant_audit"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    at_utc: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    actor_id: Mapped[str] = mapped_column(String(200))
    trace_id: Mapped[str] = mapped_column(String(36))
    action: Mapped[str] = mapped_column(String(40))
    result: Mapped[str] = mapped_column(String(16))
    object_id: Mapped[str | None] = mapped_column(String(36))


class TaskProposal(Base):
    __tablename__ = "task_proposals"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    owner_id: Mapped[str] = mapped_column(String(200), index=True)
    conversation_id: Mapped[str] = mapped_column(
        ForeignKey("conversations.id", ondelete="CASCADE"), index=True
    )
    message_id: Mapped[str] = mapped_column(ForeignKey("messages.id", ondelete="CASCADE"))
    call_id: Mapped[str] = mapped_column(String(200))
    payload: Mapped[dict] = mapped_column(JSON)
    reason: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
    expires_at: Mapped[datetime] = mapped_column(UTCDateTime())
    result: Mapped[dict | None] = mapped_column(JSON)
    __table_args__ = (UniqueConstraint("message_id", "call_id", name="uq_proposal_call"),)


class SyntheticTask(Base):
    __tablename__ = "synthetic_tasks"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    proposal_id: Mapped[str] = mapped_column(ForeignKey("task_proposals.id"), unique=True)
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(UTCDateTime(), default=utcnow)
