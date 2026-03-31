"""
Database abstraction layer
- Development: SQLite
- Production: Can be configured for other databases
"""

import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Generator

from .env import is_dev

# Database file path
DB_PATH = Path(__file__).parent.parent.parent / "dev.db"

_connection: sqlite3.Connection | None = None


def get_connection() -> sqlite3.Connection:
    """Get database connection (singleton for dev)"""
    global _connection
    if _connection is None:
        _connection = sqlite3.connect(str(DB_PATH), check_same_thread=False)
        _connection.row_factory = sqlite3.Row
    return _connection


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager for database connection"""
    conn = get_connection()
    try:
        yield conn
    finally:
        conn.commit()


def query(sql: str, params: tuple = ()) -> list[dict[str, Any]]:
    """Execute SELECT query and return results as list of dicts"""
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def query_one(sql: str, params: tuple = ()) -> dict[str, Any] | None:
    """Execute SELECT query and return single result"""
    results = query(sql, params)
    return results[0] if results else None


def execute(sql: str, params: tuple = ()) -> tuple[int, int]:
    """Execute INSERT/UPDATE/DELETE and return (lastrowid, rowcount)"""
    with get_db() as conn:
        cursor = conn.execute(sql, params)
        return cursor.lastrowid or 0, cursor.rowcount


def init_db(schema_path: Path | None = None) -> None:
    """Initialize database with schema"""
    if schema_path is None:
        schema_path = Path(__file__).parent.parent.parent / "schema.sql"

    if schema_path.exists():
        with get_db() as conn:
            conn.executescript(schema_path.read_text())
