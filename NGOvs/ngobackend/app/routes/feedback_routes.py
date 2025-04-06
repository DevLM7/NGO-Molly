from flask import Blueprint, request, jsonify
from app.controllers.feedback_controller import (
    create_feedback, get_feedback, update_feedback, delete_feedback,
    get_event_feedback, get_user_feedback, get_event_rating
)
from app.utils.auth_middleware import require_auth

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('', methods=['POST'])
@require_auth
def create():
    """Create a new feedback"""
    data = request.get_json()
    return create_feedback(data, request.user['uid'])

@feedback_bp.route('/<feedback_id>', methods=['GET'])
@require_auth
def get(feedback_id):
    """Get feedback by ID"""
    return get_feedback(feedback_id)

@feedback_bp.route('/<feedback_id>', methods=['PUT'])
@require_auth
def update(feedback_id):
    """Update feedback"""
    data = request.get_json()
    return update_feedback(feedback_id, data, request.user['uid'])

@feedback_bp.route('/<feedback_id>', methods=['DELETE'])
@require_auth
def delete(feedback_id):
    """Delete feedback"""
    return delete_feedback(feedback_id, request.user['uid'])

@feedback_bp.route('/event/<event_id>', methods=['GET'])
@require_auth
def event_feedback(event_id):
    """Get feedback for an event"""
    return get_event_feedback(event_id)

@feedback_bp.route('/user/<user_id>', methods=['GET'])
@require_auth
def user_feedback(user_id):
    """Get feedback by user"""
    return get_user_feedback(user_id)

@feedback_bp.route('/event/<event_id>/rating', methods=['GET'])
@require_auth
def event_rating(event_id):
    """Get average rating for an event"""
    return get_event_rating(event_id) 