from .extensions import db
from .models import AuditLog


def seed_data():
    db.create_all()

    if not AuditLog.query.filter_by(action='Seed', resource='Database').first():
        db.session.add(AuditLog(user='system', role='System', action='Seed', resource='Database', status='Success', ip='127.0.0.1', details='Database initialized without default demo user accounts'))
        db.session.commit()
