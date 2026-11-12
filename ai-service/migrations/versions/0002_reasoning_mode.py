"""Persist the mode selected independently for each turn."""

import sqlalchemy as sa
from alembic import op

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "messages",
        sa.Column("reasoning_mode", sa.String(16), nullable=False, server_default="standard"),
    )


def downgrade():
    op.drop_column("messages", "reasoning_mode")
