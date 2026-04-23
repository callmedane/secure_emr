from flask import Blueprint, jsonify
from ..models import User
from ..rbac import require_roles

users_bp = Blueprint("users", __name__)


@users_bp.get('/users')
@require_roles('Admin')
def list_users():
    users = User.query.order_by(User.role, User.last_name, User.first_name).all()
    return jsonify({'users': [u.to_dict(include_mfa_uri=True) for u in users]})
