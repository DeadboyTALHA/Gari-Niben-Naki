import sys
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# ── Add the backend/ directory to Python path ──────────
# This lets Alembic find 'app.database', 'app.models', etc.
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ── Import your app's Base and ALL models ──────────────
# Every model must be imported here so Alembic detects its table.
from app.database import Base
from app.models import (  # noqa: F401 — imports needed for side effects
    User, Vehicle, VehicleImage, Booking, Payment,
    Review, UserDocument, Dispute, Notification,
)

# ── Alembic Config object ───────────────────────────────
config = context.config

# ── Set up Python logging from alembic.ini ─────────────
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# ── Point Alembic at YOUR models' metadata ─────────────
# This is what 'autogenerate' uses to detect schema changes.
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    '''
    Run migrations without a live database connection.
    Used when you want to generate SQL scripts instead of
    applying changes directly.
    '''
    url = config.get_main_option('sqlalchemy.url')
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={'paramstyle': 'named'},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    '''
    Run migrations against a live database connection.
    This is the mode used when you run 'alembic upgrade head'.
    '''
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix='sqlalchemy.',
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()


# ── Entry point ────────────────────────────────────────
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
