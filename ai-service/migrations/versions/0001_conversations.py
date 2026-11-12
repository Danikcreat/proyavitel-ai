"""Conversations, messages, durable generation leases and denied-access audit."""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "conversations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_id", sa.String(200), nullable=False),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("next_sequence", sa.Integer(), nullable=False),
        sa.Column("active_message_id", sa.String(36)),
        sa.Column("lease_expires_at", sa.DateTime(timezone=True)),
        sa.Column("create_key", sa.String(128)),
        sa.Column("create_hash", sa.String(64)),
        sa.UniqueConstraint("owner_id", "create_key", name="uq_conversation_create_key"),
    )
    op.create_index("ix_conversation_owner_updated", "conversations", ["owner_id", "updated_at"])
    op.create_table(
        "messages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "conversation_id",
            sa.String(36),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("sequence", sa.Integer(), nullable=False),
        sa.Column("role", sa.String(16), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("context", sa.JSON()),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("request_key", sa.String(128)),
        sa.Column("request_hash", sa.String(64)),
        sa.UniqueConstraint("conversation_id", "sequence", name="uq_message_sequence"),
        sa.UniqueConstraint("conversation_id", "request_key", name="uq_message_request_key"),
    )
    op.create_index("ix_messages_conversation_id", "messages", ["conversation_id"])
    op.create_table(
        "assistant_audit",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("at_utc", sa.DateTime(timezone=True), nullable=False),
        sa.Column("actor_id", sa.String(200), nullable=False),
        sa.Column("trace_id", sa.String(36), nullable=False),
        sa.Column("action", sa.String(40), nullable=False),
        sa.Column("result", sa.String(16), nullable=False),
    )


def downgrade():
    op.drop_table("assistant_audit")
    op.drop_table("messages")
    op.drop_table("conversations")
