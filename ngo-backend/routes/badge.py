from flask import Blueprint, jsonify, request
from app.controllers.badge_controller import check_and_award_badges, get_user_badges, get_badge_progress
from utils.auth import require_auth, require_role

badge_bp = Blueprint('badge', __name__)

@badge_bp.route('/check', methods=['POST'])
@require_auth
def check_badges():
    """Check and award new badges for the authenticated user"""
    user_id = request.user_id
    result, status_code = check_and_award_badges(user_id)
    return jsonify(result), status_code

@badge_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def user_badges(user_id):
    """Get all badges for a specific user"""
    result, status_code = get_user_badges(user_id)
    return jsonify(result), status_code

@badge_bp.route('/progress/<user_id>', methods=['GET'])
@require_auth
def badge_progress(user_id):
    """Get progress towards next badges for a user"""
    result, status_code = get_badge_progress(user_id)
    return jsonify(result), status_code 