import re
from datetime import datetime, timedelta
import pyotp
from flask import current_app
from flask_jwt_extended import create_access_token, get_jwt
from .extensions import db
from .models import MfaEnrollment, RevokedToken, User, Patient

PASSWORD_PATTERN = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$")


def validate_password_strength(password: str) -> str | None:
    if not PASSWORD_PATTERN.match(password):
        return "Password must be at least 10 characters and include uppercase, lowercase, number, and symbol."
    return None


def revoke_current_token(reason: str = "logout") -> None:
    claims = get_jwt()
    jti = claims.get("jti")
    if not jti:
        return
    if RevokedToken.query.filter_by(jti=jti).first() is None:
        db.session.add(RevokedToken(jti=jti, user_id=_safe_int(claims.get("sub")), reason=reason))
        db.session.commit()


def issue_access_token(user: User) -> str:
    expires = timedelta(minutes=max(5, int(user.session_timeout_minutes or 30)))
    return create_access_token(
        identity=str(user.id),
        additional_claims={"role": user.role, "username": user.username},
        expires_delta=expires,
    )


def register_failed_login(user: User | None) -> None:
    if not user:
        return
    user.failed_login_attempts = (user.failed_login_attempts or 0) + 1
    threshold = current_app.config["LOCKOUT_THRESHOLD"]
    if user.failed_login_attempts >= threshold:
        user.locked_until = datetime.utcnow() + timedelta(minutes=current_app.config["LOCKOUT_MINUTES"])
        user.failed_login_attempts = 0
    db.session.commit()


def clear_login_failures(user: User) -> None:
    user.failed_login_attempts = 0
    user.locked_until = None
    db.session.commit()


def begin_mfa_enrollment(user: User, purpose: str = "enrollment") -> tuple[MfaEnrollment, str]:
    MfaEnrollment.query.filter_by(user_id=user.id, purpose=purpose, used_at=None).delete()
    secret = pyotp.random_base32()
    enrollment = MfaEnrollment(
        user_id=user.id,
        secret=secret,
        purpose=purpose,
        expires_at=datetime.utcnow() + timedelta(minutes=current_app.config["MFA_ENROLLMENT_MINUTES"]),
    )
    db.session.add(enrollment)
    db.session.commit()
    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=current_app.config["MFA_ISSUER_NAME"])
    return enrollment, uri


def consume_mfa_enrollment(token: str, code: str) -> User | None:
    enrollment = MfaEnrollment.query.filter_by(token=token).first()
    if not enrollment or not enrollment.is_valid():
        return None
    if not pyotp.TOTP(enrollment.secret).verify(code, valid_window=1):
        return None
    user = User.query.get(enrollment.user_id)
    if not user:
        return None
    user.mfa_secret = enrollment.secret
    user.mfa_enabled = True
    user.mfa_enrolled_at = datetime.utcnow()
    enrollment.used_at = datetime.utcnow()
    db.session.commit()
    return user




def get_latest_pending_enrollment(user: User) -> MfaEnrollment | None:
    return (
        MfaEnrollment.query
        .filter_by(user_id=user.id, used_at=None)
        .order_by(MfaEnrollment.expires_at.desc())
        .first()
    )


def get_mfa_provisioning_uri(user: User) -> str | None:
    secret = user.mfa_secret
    if not secret:
        pending = get_latest_pending_enrollment(user)
        if pending and pending.is_valid():
            secret = pending.secret
    if not secret:
        return None
    return pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name=current_app.config["MFA_ISSUER_NAME"])


def complete_pending_mfa_for_user(user: User, code: str) -> bool:
    pending = get_latest_pending_enrollment(user)
    if not pending or not pending.is_valid():
        return False
    if not pyotp.TOTP(pending.secret).verify(code, valid_window=1):
        return False
    user.mfa_secret = pending.secret
    user.mfa_enabled = True
    if not user.mfa_enrolled_at:
        user.mfa_enrolled_at = datetime.utcnow()
    pending.used_at = datetime.utcnow()
    db.session.commit()
    return True

def can_access_patient(user: User, patient: Patient) -> bool:
    if user.role == 'Admin':
        return True
    if user.role == 'Patient':
        return patient.portal_user_id == user.id
    identifiers = {user.username.lower(), user.email.lower(), user.full_name().lower()}
    if user.role == 'Doctor':
        return (patient.assigned_doctor or '').strip().lower() in identifiers
    if user.role == 'Nurse':
        return (patient.assigned_nurse or '').strip().lower() in identifiers
    return False


def _safe_int(value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return None
