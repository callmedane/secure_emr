from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from ..audit import write_audit_log
from ..extensions import db
from ..models import User
from ..security import begin_mfa_enrollment, revoke_current_token, validate_password_strength

settings_bp = Blueprint("settings", __name__)


@settings_bp.get('/settings/me')
@jwt_required()
def get_settings():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify({'settings': {
        'mfaEnabled': user.mfa_enabled,
        'mfaEnrolled': bool(user.mfa_enrolled_at),
        'emailNotifications': user.email_notifications,
        'sessionTimeout': str(user.session_timeout_minutes),
    }})


@settings_bp.put('/settings/me')
@jwt_required()
def update_settings():
    user = User.query.get_or_404(int(get_jwt_identity()))
    payload = request.get_json() or {}
    user.email_notifications = bool(payload.get('emailNotifications', user.email_notifications))
    timeout = int(payload.get('sessionTimeout', user.session_timeout_minutes))
    user.session_timeout_minutes = timeout if timeout in {15, 30, 60, 120} else user.session_timeout_minutes
    if 'mfaEnabled' in payload and not payload.get('mfaEnabled'):
        return jsonify({'message': 'MFA cannot be disabled from the settings page for security reasons.'}), 400
    db.session.commit()
    claims = get_jwt()
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'Update Settings', 'Account Settings', 'Success')
    return jsonify({'message': 'Settings updated'})


@settings_bp.post('/settings/password')
@jwt_required()
def update_password():
    user = User.query.get_or_404(int(get_jwt_identity()))
    payload = request.get_json() or {}
    current_password = payload.get('currentPassword') or ''
    new_password = payload.get('newPassword') or ''
    if not user.check_password(current_password):
        return jsonify({'message': 'Current password is incorrect'}), 400
    password_error = validate_password_strength(new_password)
    if password_error:
        return jsonify({'message': password_error}), 400
    user.set_password(new_password)
    db.session.commit()
    revoke_current_token('password_changed')
    claims = get_jwt()
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'Change Password', 'Account Settings', 'Success')
    return jsonify({'message': 'Password updated. Please log in again.'})


@settings_bp.post('/settings/mfa/enroll')
@jwt_required()
def begin_mfa_setup():
    user = User.query.get_or_404(int(get_jwt_identity()))
    enrollment, provisioning_uri = begin_mfa_enrollment(user, purpose='settings-enrollment')
    claims = get_jwt()
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'Begin MFA Enrollment', 'Account Settings', 'Success')
    return jsonify({'mfaEnrollmentToken': enrollment.token, 'mfaProvisioningUri': provisioning_uri, 'message': 'One-time MFA enrollment package generated.'})
