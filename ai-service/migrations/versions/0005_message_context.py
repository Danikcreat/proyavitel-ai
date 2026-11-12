"""Persist explicit context resets and per-answer context snapshots."""

import sqlalchemy as sa
from alembic import op

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "messages",
        sa.Column("reset_context", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("messages", sa.Column("effective_context", sa.JSON()))


def downgrade():
    op.drop_column("messages", "effective_context")
    op.drop_column("messages", "reset_context")
