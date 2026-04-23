from flask import request
from .extensions import db
from .models import AuditLog


def write_audit_log(user: str, role: str, action: str, resource: str, status: str, details: str | None = None):
    ip = request.headers.get("X-Forwarded-For", request.remote_addr or "unknown")
    log = AuditLog(user=user, role=role, action=action, resource=resource, status=status, ip=ip, details=details)
    db.session.add(log)
    db.session.commit()
    return log
