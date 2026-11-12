"""Confirmed synthetic tasks; real platform writes remain disabled."""

import sqlalchemy as sa
from alembic import op

revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("assistant_audit", sa.Column("object_id", sa.String(36)))
    op.create_table(
        "task_proposals",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("owner_id", sa.String(200), nullable=False),
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
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("result", sa.JSON()),
        sa.UniqueConstraint("message_id", "call_id", name="uq_proposal_call"),
    )
    op.create_index("ix_task_proposals_owner_id", "task_proposals", ["owner_id"])
    op.create_index("ix_task_proposals_conversation_id", "task_proposals", ["conversation_id"])
    op.create_table(
        "synthetic_tasks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column(
            "proposal_id",
            sa.String(36),
            sa.ForeignKey("task_proposals.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("synthetic_tasks")
    op.drop_table("task_proposals")
    op.drop_column("assistant_audit", "object_id")
