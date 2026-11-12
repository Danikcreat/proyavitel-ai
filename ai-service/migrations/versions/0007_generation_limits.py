"""Serialize admission per user across workers using the shared database."""

import sqlalchemy as sa
from alembic import op

revision = "0007"
down_revision = "0006"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "generation_guards",
        sa.Column("owner_id", sa.String(200), primary_key=True),
        sa.Column("touched_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index(
        "ix_messages_conversation_created", "messages", ["conversation_id", "created_at"]
    )


def downgrade():
    op.drop_index("ix_messages_conversation_created", table_name="messages")
    op.drop_table("generation_guards")
