from flask import Blueprint, jsonify, request
from ..models import AuditLog
from ..rbac import require_roles

audit_bp = Blueprint("audit", __name__)


@audit_bp.get('/audit-logs')
@require_roles('Admin', 'Doctor')
def get_audit_logs():
    limit = min(int(request.args.get('limit', 100)), 500)
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(limit).all()
    return jsonify({'logs': [log.to_dict() for log in logs]})
