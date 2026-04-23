from sqlalchemy import inspect, text
from .extensions import db


def ensure_schema() -> None:
    db.create_all()
    inspector = inspect(db.engine)
    if 'user' in inspector.get_table_names():
        _ensure_columns('user', {
            'mfa_enrolled_at': 'DATETIME',
            'failed_login_attempts': 'INTEGER NOT NULL DEFAULT 0',
            'locked_until': 'DATETIME',
            'must_change_password': 'BOOLEAN NOT NULL DEFAULT 0',
        })
    if 'patient' in inspector.get_table_names():
        _ensure_columns('patient', {
            'assigned_nurse': 'VARCHAR(120)',
            'portal_user_id': 'INTEGER',
        })


def _ensure_columns(table_name: str, columns: dict[str, str]) -> None:
    inspector = inspect(db.engine)
    existing = {col['name'] for col in inspector.get_columns(table_name)}
    for column_name, column_type in columns.items():
        if column_name in existing:
            continue
        db.session.execute(text(f'ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}'))
    db.session.commit()
