from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from ..audit import write_audit_log
from ..extensions import limiter, db
from ..models import User
from ..security import (
    begin_mfa_enrollment,
    clear_login_failures,
    complete_pending_mfa_for_user,
    consume_mfa_enrollment,
    issue_access_token,
    register_failed_login,
    revoke_current_token,
    validate_password_strength,
)

auth_bp = Blueprint("auth", __name__)


def _normalize_role(requested_role: str) -> str:
    role = (requested_role or 'Patient').strip()
    return 'Patient' if role in ['User', 'Patient'] else role


def _validate_registration_payload(payload: dict) -> tuple[dict, str | None]:
    data = {
        'first_name': (payload.get('firstName') or '').strip(),
        'last_name': (payload.get('lastName') or '').strip(),
        'username': (payload.get('username') or '').strip(),
        'email': (payload.get('email') or '').strip().lower(),
        'password': payload.get('password') or '',
        'confirm_password': payload.get('confirmPassword') or '',
    }
    if not all(data.values()):
        return data, 'All fields are required'
    if data['password'] != data['confirm_password']:
        return data, 'Passwords do not match'
    password_error = validate_password_strength(data['password'])
    if password_error:
        return data, password_error
    if len(data['username']) < 4 or ' ' in data['username']:
        return data, 'Username must be at least 4 characters and contain no spaces'
    if User.query.filter((User.username == data['username']) | (User.email == data['email'])).first():
        return data, 'Username or email already exists'
    return data, None


def _build_user(data: dict, role: str) -> User:
    user = User(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        role=role,
        is_active=True,
        mfa_enabled=False,
        mfa_secret=None,
    )
    user.set_password(data['password'])
    return user


@auth_bp.post('/login')
@limiter.limit("10 per minute")
def login():
    payload = request.get_json() or {}
    username = (payload.get('username') or '').strip()
    password = payload.get('password') or ''
    mfa_code = (payload.get('mfaCode') or '').strip()

    user = User.query.filter((User.username == username) | (User.email == username)).first()
    if not user or not user.check_password(password) or not user.is_active:
        register_failed_login(user)
        write_audit_log(username or 'unknown', getattr(user, 'role', 'Unknown'), 'Login', 'Authentication', 'Failed', 'Invalid credentials')
        return jsonify({'message': 'Invalid credentials'}), 401

    if user.is_locked():
        write_audit_log(user.username, user.role, 'Login', 'Authentication', 'Suspicious', 'Account temporarily locked due to repeated failures')
        return jsonify({'message': 'Account temporarily locked. Please try again later.'}), 423

    if not user.mfa_enabled or not user.mfa_secret or not user.mfa_enrolled_at:
        if not mfa_code:
            write_audit_log(user.username, user.role, 'Login', 'Authentication', 'Failed', 'MFA enrollment incomplete')
            return jsonify({'message': 'MFA enrollment is incomplete for this account. Enter the current 6-digit authenticator code to finish setup and sign in.'}), 403
        if not complete_pending_mfa_for_user(user, mfa_code):
            register_failed_login(user)
            write_audit_log(user.username, user.role, 'Login', 'Authentication', 'Failed', 'Pending MFA enrollment verification failed during login')
            return jsonify({'message': 'Invalid MFA code or missing pending MFA enrollment'}), 401

    if not mfa_code:
        return jsonify({'message': 'MFA code is required'}), 401
    import pyotp
    if not pyotp.TOTP(user.mfa_secret).verify(mfa_code, valid_window=1):
        register_failed_login(user)
        write_audit_log(user.username, user.role, 'Login', 'Authentication', 'Failed', 'Invalid MFA code')
        return jsonify({'message': 'Invalid MFA code'}), 401

    clear_login_failures(user)
    user.last_login = datetime.utcnow()
    db.session.commit()

    token = issue_access_token(user)
    write_audit_log(user.username, user.role, 'Login', 'Authentication', 'Success')
    return jsonify({'accessToken': token, 'user': user.to_dict()}), 200


@auth_bp.get('/me')
@jwt_required()
def me():
    user = User.query.get_or_404(int(get_jwt_identity()))
    return jsonify({'user': user.to_dict()})


@auth_bp.post('/logout')
@jwt_required()
def logout():
    claims = get_jwt()
    revoke_current_token('logout')
    write_audit_log(claims.get('username', 'unknown'), claims.get('role', 'Unknown'), 'Logout', 'Authentication', 'Success')
    return jsonify({'message': 'Logged out'})


@auth_bp.post('/register')
@limiter.limit("5 per minute")
def register():
    payload = request.get_json() or {}
    role = _normalize_role(payload.get('role'))
    if role != 'Patient':
        return jsonify({'message': 'Only patient registration is allowed on this page'}), 403

    data, error = _validate_registration_payload(payload)
    if error:
        return jsonify({'message': error}), 400 if error != 'Username or email already exists' else 409

    user = _build_user(data, 'Patient')
    db.session.add(user)
    db.session.commit()
    enrollment, provisioning_uri = begin_mfa_enrollment(user, purpose='patient-enrollment')

    write_audit_log(user.username, user.role, 'Register', 'Authentication', 'Success', 'Patient self-service account registration')
    return jsonify({
        'message': 'Patient account created. Complete MFA enrollment before first login.',
        'user': user.to_dict(),
        'mfaEnrollmentToken': enrollment.token,
        'mfaProvisioningUri': provisioning_uri,
    }), 201


@auth_bp.post('/register-admin')
@limiter.limit("5 per minute")
def register_admin():
    payload = request.get_json() or {}
    data, error = _validate_registration_payload(payload)
    if error:
        return jsonify({'message': error}), 400 if error != 'Username or email already exists' else 409

    user = _build_user(data, 'Admin')
    db.session.add(user)
    db.session.commit()
    enrollment, provisioning_uri = begin_mfa_enrollment(user, purpose='admin-enrollment')
    write_audit_log(user.username, user.role, 'Register Admin', 'Authentication', 'Success', 'Administrator account created with MFA enrollment pending')
    return jsonify({
        'message': 'Administrator account created. Complete MFA enrollment before first login.',
        'user': user.to_dict(),
        'mfaEnrollmentToken': enrollment.token,
        'mfaProvisioningUri': provisioning_uri,
    }), 201


@auth_bp.post('/mfa/verify')
@limiter.limit("10 per minute")
def verify_mfa_setup():
    payload = request.get_json() or {}
    enrollment_token = (payload.get('mfaEnrollmentToken') or '').strip()
    code = (payload.get('code') or '').strip()
    if not enrollment_token or not code:
        return jsonify({'message': 'Enrollment token and code are required'}), 400
    user = consume_mfa_enrollment(enrollment_token, code)
    if not user:
        return jsonify({'message': 'Invalid or expired MFA enrollment'}), 400
    write_audit_log(user.username, user.role, 'Verify MFA Enrollment', 'Authentication', 'Success')
    return jsonify({'message': 'MFA enrolled successfully'})
