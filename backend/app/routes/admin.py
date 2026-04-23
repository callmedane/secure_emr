from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity
from ..audit import write_audit_log
from ..extensions import db, limiter
from ..models import User
from ..rbac import require_roles
from ..security import begin_mfa_enrollment, validate_password_strength

admin_bp = Blueprint("admin", __name__)

STAFF_ROLES = {'Doctor', 'Nurse'}
ALLOWED_EDIT_ROLES = {'Admin', 'Doctor', 'Nurse', 'Patient'}


def _build_provisioning_package(user: User) -> dict:
    enrollment, uri = begin_mfa_enrollment(user, purpose=f'{user.role.lower()}-provisioning')
    return {
        'mfaEnrollmentToken': enrollment.token,
        'mfaProvisioningUri': uri,
    }


def _serialize_admin_user(user: User) -> dict:
    return user.to_dict()


def _current_actor() -> tuple[str, str, int | None]:
    claims = get_jwt()
    actor_username = claims.get('username', 'unknown')
    actor_role = claims.get('role', 'Unknown')
    actor_id_raw = get_jwt_identity()
    try:
        actor_id = int(actor_id_raw) if actor_id_raw is not None else None
    except (TypeError, ValueError):
        actor_id = None
    return actor_username, actor_role, actor_id


@admin_bp.post('/users/staff')
@limiter.limit("10 per minute")
@require_roles('Admin')
def create_staff_account():
    actor_username, actor_role, _ = _current_actor()
    payload = request.get_json() or {}

    first_name = (payload.get('firstName') or '').strip()
    last_name = (payload.get('lastName') or '').strip()
    username = (payload.get('username') or '').strip()
    email = (payload.get('email') or '').strip().lower()
    role = (payload.get('role') or '').strip()
    password = payload.get('password') or ''
    confirm_password = payload.get('confirmPassword') or ''

    if role not in STAFF_ROLES:
        return jsonify({'message': 'Only Doctor and Nurse accounts can be created here'}), 400
    if not all([first_name, last_name, username, email, password, confirm_password]):
        return jsonify({'message': 'All staff registration fields are required'}), 400
    if password != confirm_password:
        return jsonify({'message': 'Passwords do not match'}), 400
    password_error = validate_password_strength(password)
    if password_error:
        return jsonify({'message': password_error}), 400
    if len(username) < 4 or ' ' in username:
        return jsonify({'message': 'Username must be at least 4 characters and contain no spaces'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'message': 'Username or email already exists'}), 409

    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_active=True,
        mfa_enabled=False,
        mfa_secret=None,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    enrollment_payload = _build_provisioning_package(user)

    write_audit_log(
        actor_username,
        actor_role,
        'Create Staff Account',
        'User Management',
        'Success',
        f'Created {role} account for {username} with one-time MFA enrollment package'
    )

    return jsonify({
        'message': f'{role} account created successfully',
        'user': _serialize_admin_user(user),
        **enrollment_payload,
        'securityNotice': 'Provide the one-time MFA enrollment package to the staff member securely. The code seed is not exposed again after this response.'
    }), 201


@admin_bp.put('/users/<int:user_id>')
@limiter.limit("20 per minute")
@require_roles('Admin')
def update_user(user_id: int):
    actor_username, actor_role, actor_id = _current_actor()
    payload = request.get_json() or {}
    user = User.query.get_or_404(user_id)

    first_name = (payload.get('firstName') or '').strip()
    last_name = (payload.get('lastName') or '').strip()
    username = (payload.get('username') or '').strip()
    email = (payload.get('email') or '').strip().lower()
    role = (payload.get('role') or '').strip()
    is_active = payload.get('isActive')

    if not all([first_name, last_name, username, email, role]):
        return jsonify({'message': 'First name, last name, username, email, and role are required'}), 400
    if len(username) < 4 or ' ' in username:
        return jsonify({'message': 'Username must be at least 4 characters and contain no spaces'}), 400
    if role not in ALLOWED_EDIT_ROLES:
        return jsonify({'message': 'Invalid role'}), 400
    if not isinstance(is_active, bool):
        return jsonify({'message': 'isActive must be true or false'}), 400

    duplicate = User.query.filter(((User.username == username) | (User.email == email)) & (User.id != user.id)).first()
    if duplicate:
        return jsonify({'message': 'Username or email already exists'}), 409

    if actor_id == user.id and role != 'Admin':
        return jsonify({'message': 'You cannot remove your own Admin role'}), 400
    if actor_id == user.id and not is_active:
        return jsonify({'message': 'You cannot disable your own account'}), 400

    if user.role == 'Admin' and (role != 'Admin' or not is_active):
        active_admins = User.query.filter(User.role == 'Admin', User.is_active.is_(True), User.id != user.id).count()
        if active_admins == 0:
            return jsonify({'message': 'At least one active Admin account must remain'}), 400

    user.first_name = first_name
    user.last_name = last_name
    user.username = username
    user.email = email
    user.role = role
    user.is_active = is_active
    db.session.commit()

    write_audit_log(actor_username, actor_role, 'Update User', 'User Management', 'Success', f'Updated user {user.username} (ID {user.id})')
    return jsonify({'message': 'User updated successfully', 'user': _serialize_admin_user(user)}), 200


@admin_bp.delete('/users/<int:user_id>')
@limiter.limit("10 per minute")
@require_roles('Admin')
def delete_user(user_id: int):
    actor_username, actor_role, actor_id = _current_actor()
    user = User.query.get_or_404(user_id)

    if actor_id == user.id:
        return jsonify({'message': 'You cannot delete your own account'}), 400

    if user.role == 'Admin':
        active_admins = User.query.filter(User.role == 'Admin', User.is_active.is_(True), User.id != user.id).count()
        if active_admins == 0:
            return jsonify({'message': 'At least one active Admin account must remain'}), 400

    username = user.username
    role = user.role
    db.session.delete(user)
    db.session.commit()

    write_audit_log(actor_username, actor_role, 'Delete User', 'User Management', 'Success', f'Deleted {role} account {username} (ID {user_id})')
    return jsonify({'message': 'User deleted successfully'}), 200
