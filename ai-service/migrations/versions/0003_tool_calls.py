"""Persist tool executions and message sources."""

import sqlalchemy as sa
from alembic import op

revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("messages", sa.Column("sources", sa.JSON(), nullable=True))
    op.create_table(
        "tool_calls",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "conversation_id",
            sa.String(36),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "message_id",
            sa.String(36),
            sa.ForeignKey("messages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("call_id", sa.String(200), nullable=False),
        sa.Column("tool", sa.String(100), nullable=False),
        sa.Column("permission", sa.String(100), nullable=False),
        sa.Column("department_scope", sa.JSON(), nullable=False),
        sa.Column("arguments", sa.JSON(), nullable=False),
        sa.Column("result", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_tool_calls_conversation_id", "tool_calls", ["conversation_id"])
    op.create_index("ix_tool_calls_message_id", "tool_calls", ["message_id"])


def downgrade():
    op.drop_table("tool_calls")
    op.drop_column("messages", "sources")
