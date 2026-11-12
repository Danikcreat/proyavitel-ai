"""Global generation admission shared across users and workers."""

import sqlalchemy as sa
from alembic import op

revision = "0008"
down_revision = "0007"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "global_generation_guard",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("touched_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_messages_role_created", "messages", ["role", "created_at"])


def downgrade():
    op.drop_index("ix_messages_role_created", table_name="messages")
    op.drop_table("global_generation_guard")
