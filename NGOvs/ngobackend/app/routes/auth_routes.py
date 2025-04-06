from flask import Blueprint, request, jsonify
from app.controllers.auth_controller import (
    register_user, login_user, get_current_user,
    get_user_profile, update_user_profile
)
from app.utils.auth_middleware import require_auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    return register_user(data)

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    data = request.get_json()
    return login_user(data)

@auth_bp.route('/me', methods=['GET'])
@require_auth
def me():
    """Get current user profile"""
    return get_current_user(request.user)

@auth_bp.route('/profile/<user_id>', methods=['GET'])
@require_auth
def profile(user_id):
    """Get user profile by ID"""
    return get_user_profile(user_id)

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update user profile"""
    data = request.get_json()
    return update_user_profile(request.user, data) 