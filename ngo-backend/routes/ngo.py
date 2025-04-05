from flask import Blueprint, request, jsonify
from utils.firebase import db
from middleware.auth import require_auth, require_role
from app.controllers.event_controller import (
    create_event, update_event, delete_event, 
    get_ngo_events, get_event_volunteers
)
from app.controllers.certificate_controller import generate_certificate

ngo_bp = Blueprint('ngo', __name__)

@ngo_bp.route('/events', methods=['POST'])
@require_auth
@require_role('ngo')
def add_event():
    """Create a new event"""
    try:
        data = request.get_json()
        data['ngo_id'] = request.user['uid']
        event = create_event(data)
        return jsonify(event), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ngo_bp.route('/events/<event_id>', methods=['PUT'])
@require_auth
@require_role('ngo')
def modify_event(event_id):
    """Update an event"""
    try:
        data = request.get_json()
        event = update_event(event_id, data)
        return jsonify(event), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ngo_bp.route('/events/<event_id>', methods=['DELETE'])
@require_auth
@require_role('ngo')
def remove_event(event_id):
    """Delete an event"""
    try:
        delete_event(event_id)
        return jsonify({'message': 'Event deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ngo_bp.route('/events', methods=['GET'])
@require_auth
@require_role('ngo')
def list_events():
    """Get all events for the NGO"""
    try:
        ngo_id = request.user['uid']
        events = get_ngo_events(ngo_id)
        return jsonify(events), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ngo_bp.route('/events/<event_id>/volunteers', methods=['GET'])
@require_auth
@require_role('ngo')
def list_volunteers(event_id):
    """Get all volunteers registered for an event"""
    try:
        volunteers = get_event_volunteers(event_id)
        return jsonify(volunteers), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ngo_bp.route('/events/<event_id>/certificates', methods=['POST'])
@require_auth
@require_role('ngo')
def create_certificates(event_id):
    """Generate certificates for event volunteers"""
    try:
        data = request.get_json()
        certificates = generate_certificate(event_id, data)
        return jsonify(certificates), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 