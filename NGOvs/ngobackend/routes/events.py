from flask import Blueprint, request, jsonify
from firebase_admin import firestore
from utils.firebase import db
from middleware.auth import require_auth, require_role

events_bp = Blueprint('events', __name__)

@events_bp.route('/', methods=['GET'])
def get_events():
    try:
        # Get query parameters for filtering
        status = request.args.get('status')
        category = request.args.get('category')
        ngo_id = request.args.get('ngoId')
        
        # Start with base query
        query = db.collection('events')
        
        # Apply filters if provided
        if status:
            query = query.where('status', '==', status)
        if category:
            query = query.where('category', '==', category)
        if ngo_id:
            query = query.where('ngoId', '==', ngo_id)
            
        # Execute query
        events_snapshot = query.order_by('date', 'asc').get()
        
        # Format response
        events = []
        for doc in events_snapshot:
            event_data = doc.to_dict()
            event_data['id'] = doc.id
            events.append(event_data)
            
        return jsonify(events), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@events_bp.route('/', methods=['POST'])
@require_role('ngo')
def create_event():
    try:
        data = request.get_json()
        ngo_id = request.user['uid']
        
        # Add NGO ID and creation timestamp
        event_data = {
            **data,
            'ngoId': ngo_id,
            'createdAt': firestore.SERVER_TIMESTAMP,
            'registeredVolunteers': [],
            'attendance': []
        }
        
        # Create event document
        doc_ref = db.collection('events').document()
        doc_ref.set(event_data)
        
        return jsonify({
            'message': 'Event created successfully',
            'id': doc_ref.id
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@events_bp.route('/<event_id>', methods=['GET'])
def get_event(event_id):
    try:
        event_doc = db.collection('events').document(event_id).get()
        
        if not event_doc.exists:
            return jsonify({'message': 'Event not found'}), 404
            
        event_data = event_doc.to_dict()
        event_data['id'] = event_id
        
        return jsonify(event_data), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@events_bp.route('/<event_id>', methods=['PUT'])
@require_role('ngo')
def update_event(event_id):
    try:
        event_doc = db.collection('events').document(event_id).get()
        
        if not event_doc.exists:
            return jsonify({'message': 'Event not found'}), 404
            
        # Check if the NGO owns this event
        if event_doc.to_dict()['ngoId'] != request.user['uid']:
            return jsonify({'message': 'Unauthorized to update this event'}), 403
            
        data = request.get_json()
        db.collection('events').document(event_id).update(data)
        
        return jsonify({'message': 'Event updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@events_bp.route('/<event_id>', methods=['DELETE'])
@require_role('ngo')
def delete_event(event_id):
    try:
        event_doc = db.collection('events').document(event_id).get()
        
        if not event_doc.exists:
            return jsonify({'message': 'Event not found'}), 404
            
        # Check if the NGO owns this event
        if event_doc.to_dict()['ngoId'] != request.user['uid']:
            return jsonify({'message': 'Unauthorized to delete this event'}), 403
            
        db.collection('events').document(event_id).delete()
        
        return jsonify({'message': 'Event deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@events_bp.route('/<event_id>/register', methods=['POST'])
@require_role('volunteer')
def register_for_event(event_id):
    try:
        volunteer_id = request.user['uid']
        
        # Get event document
        event_ref = db.collection('events').document(event_id)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            return jsonify({'message': 'Event not found'}), 404
            
        event_data = event_doc.to_dict()
        
        # Check if event is open for registration
        if event_data['status'] != 'upcoming':
            return jsonify({'message': 'Event is not open for registration'}), 400
            
        # Check if volunteer is already registered
        if volunteer_id in event_data.get('registeredVolunteers', []):
            return jsonify({'message': 'Already registered for this event'}), 400
            
        # Add volunteer to registered list
        event_ref.update({
            'registeredVolunteers': firestore.ArrayUnion([volunteer_id])
        })
        
        return jsonify({'message': 'Registered for event successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@events_bp.route('/<event_id>/attendance', methods=['POST'])
@require_role('ngo')
def mark_attendance(event_id):
    try:
        data = request.get_json()
        volunteer_id = data.get('volunteerId')
        status = data.get('status')  # 'present', 'absent', 'late'
        
        if not volunteer_id or not status:
            return jsonify({'message': 'Volunteer ID and status are required'}), 400
            
        # Get event document
        event_ref = db.collection('events').document(event_id)
        event_doc = event_ref.get()
        
        if not event_doc.exists:
            return jsonify({'message': 'Event not found'}), 404
            
        # Check if the NGO owns this event
        if event_doc.to_dict()['ngoId'] != request.user['uid']:
            return jsonify({'message': 'Unauthorized to mark attendance for this event'}), 403
            
        # Check if volunteer is registered
        if volunteer_id not in event_doc.to_dict().get('registeredVolunteers', []):
            return jsonify({'message': 'Volunteer is not registered for this event'}), 400
            
        # Create attendance record
        attendance_record = {
            'volunteerId': volunteer_id,
            'status': status,
            'checkInTime': firestore.SERVER_TIMESTAMP,
            'checkOutTime': None
        }
        
        # Add or update attendance record
        event_ref.update({
            'attendance': firestore.ArrayUnion([attendance_record])
        })
        
        return jsonify({'message': 'Attendance marked successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400 