from collections import Counter, defaultdict
from datetime import datetime, timedelta
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt
from ..models import AuditLog, Patient
from ..rbac import require_roles

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.get('/dashboard/summary')
@require_roles('Admin', 'Doctor', 'Nurse', 'Patient')
def summary():
    claims = get_jwt()
    if claims.get('role') == 'Patient':
        return jsonify({
            'stats': {
                'totalPatients': 1,
                'activeRecords': 1,
                'recentUpdates': 0,
                'failedAccessAttempts': 0,
            },
            'activityData': [],
        })

    patients = Patient.query.all()
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).all()
    failed = sum(1 for l in logs if l.status in ['Failed', 'Suspicious'])
    recent_updates = sum(1 for p in patients if p.last_updated >= datetime.utcnow() - timedelta(days=2))
    daily = defaultdict(lambda: {'logins': 0, 'records': 0})
    for offset in range(6, -1, -1):
        day = (datetime.utcnow() - timedelta(days=offset)).date().isoformat()
        daily[day]
    for log in logs:
        day = log.timestamp.date().isoformat()
        if day in daily:
            if log.action == 'Login' and log.status == 'Success':
                daily[day]['logins'] += 1
            if 'Patient' in log.resource or 'History' in log.resource:
                daily[day]['records'] += 1
    activity = [{'date': key, **value} for key, value in sorted(daily.items())]
    return jsonify({
        'stats': {
            'totalPatients': len(patients),
            'activeRecords': sum(1 for p in patients if p.status == 'Active'),
            'recentUpdates': recent_updates,
            'failedAccessAttempts': failed,
        },
        'activityData': activity,
    })
