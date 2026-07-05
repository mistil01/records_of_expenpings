alembic
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

.
revision: str = 'a0c5a35bf645'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    pass
