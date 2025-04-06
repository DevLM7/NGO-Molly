from flask import Blueprint, jsonify, request
from app.controllers.notification_controller import (
    get_user_notifications, mark_notification_read,
    mark_all_notifications_read, delete_notification
)
from utils.auth import require_auth

notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/', methods=['GET'])
@require_auth
def get_notifications():
    """Get notifications for the authenticated user"""
    user_id = request.user_id
    limit = request.args.get('limit', default=20, type=int)
    unread_only = request.args.get('unread_only', default=False, type=bool)
    
    result, status_code = get_user_notifications(user_id, limit, unread_only)
    return jsonify(result), status_code

@notification_bp.route('/<notification_id>/read', methods=['PUT'])
@require_auth
def mark_read(notification_id):
    """Mark a notification as read"""
    user_id = request.user_id
    result, status_code = mark_notification_read(notification_id, user_id)
    return jsonify(result), status_code

@notification_bp.route('/read-all', methods=['PUT'])
@require_auth
def mark_all_read():
    """Mark all notifications as read"""
    user_id = request.user_id
    result, status_code = mark_all_notifications_read(user_id)
    return jsonify(result), status_code

@notification_bp.route('/<notification_id>', methods=['DELETE'])
@require_auth
def remove_notification(notification_id):
    """Delete a notification"""
    user_id = request.user_id
    result, status_code = delete_notification(notification_id, user_id)
    return jsonify(result), status_code 