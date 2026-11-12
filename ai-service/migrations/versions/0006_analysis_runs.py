"""Persist safe per-answer diagnostics without duplicating message content."""

import sqlalchemy as sa
from alembic import op

revision = "0006"
down_revision = "0005"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "analysis_runs",
        sa.Column(
            "message_id",
            sa.String(36),
            sa.ForeignKey("messages.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column(
            "conversation_id",
            sa.String(36),
            sa.ForeignKey("conversations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("trace_id", sa.String(36), nullable=False),
        sa.Column("mode", sa.String(16), nullable=False),
        sa.Column("provider", sa.String(32)),
        sa.Column("model", sa.String(200)),
        sa.Column("reasoning_mode", sa.String(16), nullable=False),
        sa.Column("status", sa.String(16), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("finished_at", sa.DateTime(timezone=True)),
        *[
            sa.Column(name, sa.Integer())
            for name in (
                "preparation_ms",
                "first_text_ms",
                "total_ms",
                "provider_calls",
                "provider_retries",
                "provider_time_ms",
                "tool_calls",
                "tool_time_ms",
                "output_chars",
            )
        ],
        *[
            sa.Column(name, sa.BigInteger())
            for name in (
                "reported_prompt_tokens",
                "reported_completion_tokens",
                "reported_total_tokens",
            )
        ],
        sa.Column("usage_status", sa.String(16), nullable=False),
        sa.Column("error_code", sa.String(80)),
    )
    op.create_index("ix_analysis_runs_conversation_id", "analysis_runs", ["conversation_id"])


def downgrade():
    op.drop_index("ix_analysis_runs_conversation_id", table_name="analysis_runs")
    op.drop_table("analysis_runs")
