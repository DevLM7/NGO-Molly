from flask import Blueprint, request, jsonify
from app.controllers.event_controller import (
    create_event, get_event, update_event, delete_event,
    get_ngo_events, get_upcoming_events
)
from app.utils.auth_middleware import require_auth, require_role

event_bp = Blueprint('events', __name__)

@event_bp.route('', methods=['POST'])
@require_auth
@require_role('ngo')
def create():
    """Create a new event"""
    data = request.get_json()
    data['ngo_id'] = request.user['uid']
    return create_event(data)

@event_bp.route('/<event_id>', methods=['GET'])
@require_auth
def get(event_id):
    """Get event by ID"""
    return get_event(event_id)

@event_bp.route('/<event_id>', methods=['PUT'])
@require_auth
@require_role('ngo')
def update(event_id):
    """Update event"""
    data = request.get_json()
    return update_event(event_id, data, request.user['uid'])

@event_bp.route('/<event_id>', methods=['DELETE'])
@require_auth
@require_role('ngo')
def delete(event_id):
    """Delete event"""
    return delete_event(event_id, request.user['uid'])

@event_bp.route('/ngo', methods=['GET'])
@require_auth
@require_role('ngo')
def ngo_events():
    """Get NGO's events"""
    return get_ngo_events(request.user['uid'])

@event_bp.route('/upcoming', methods=['GET'])
@require_auth
def upcoming():
    """Get upcoming events"""
    return get_upcoming_events() 