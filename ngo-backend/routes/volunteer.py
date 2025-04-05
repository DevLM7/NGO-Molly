from flask import Blueprint, request, jsonify
from utils.firebase import db
from middleware.auth import require_auth, require_role
from app.controllers.event_controller import get_suggested_events
from app.controllers.attendance_controller import get_volunteer_attendance
from app.controllers.badge_controller import get_volunteer_badges
from app.controllers.social_controller import get_social_feed

volunteer_bp = Blueprint('volunteer', __name__)

@volunteer_bp.route('/suggestions', methods=['GET'])
@require_auth
@require_role('volunteer')
def get_suggestions():
    """Get suggested events for the volunteer"""
    try:
        user_id = request.user['uid']
        events = get_suggested_events(user_id)
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@volunteer_bp.route('/events', methods=['GET'])
@require_auth
@require_role('volunteer')
def get_registered_events():
    """Get events registered by the volunteer"""
    try:
        user_id = request.user['uid']
        events = get_volunteer_attendance(user_id)
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@volunteer_bp.route('/badges/<user_id>', methods=['GET'])
@require_auth
def get_badges(user_id):
    """Get badges for a volunteer"""
    try:
        badges = get_volunteer_badges(user_id)
        return jsonify(badges), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@volunteer_bp.route('/social-feed', methods=['GET'])
@require_auth
def get_feed():
    """Get social feed for the volunteer"""
    try:
        user_id = request.user['uid']
        feed = get_social_feed(user_id)
        return jsonify(feed), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 