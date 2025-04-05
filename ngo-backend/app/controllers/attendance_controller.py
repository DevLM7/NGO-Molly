from flask import jsonify
from app.models.attendance import Attendance
from app.models.event import Event
from datetime import datetime
from app.config.firebase import db

def mark_attendance(data, ngo_id):
    """Mark attendance for a volunteer"""
    try:
        # Validate required fields
        required_fields = ['event_id', 'volunteer_id', 'check_in']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify event exists and belongs to NGO
        event = Event.find_by_id(data['event_id'])
        if not event:
            return jsonify({'error': 'Event not found'}), 404
            
        if event.ngo_id != ngo_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Create attendance record
        attendance = Attendance(
            event_id=data['event_id'],
            volunteer_id=data['volunteer_id'],
            check_in=datetime.fromisoformat(data['check_in']),
            check_out=datetime.fromisoformat(data['check_out']) if 'check_out' in data else None,
            status=data.get('status', 'present'),
            hours_worked=data.get('hours_worked'),
            notes=data.get('notes')
        )
        attendance.save()
        
        return jsonify(attendance.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_attendance(attendance_id, data, ngo_id):
    """Update attendance record"""
    try:
        attendance = Attendance.find_by_id(attendance_id)
        if not attendance:
            return jsonify({'error': 'Attendance record not found'}), 404
        
        # Verify event belongs to NGO
        event = Event.find_by_id(attendance.event_id)
        if event.ngo_id != ngo_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update attendance fields
        if 'check_in' in data:
            attendance.check_in = datetime.fromisoformat(data['check_in'])
        if 'check_out' in data:
            attendance.check_out = datetime.fromisoformat(data['check_out'])
        if 'status' in data:
            attendance.status = data['status']
        if 'hours_worked' in data:
            attendance.hours_worked = data['hours_worked']
        if 'notes' in data:
            attendance.notes = data['notes']
        
        attendance.save()
        return jsonify(attendance.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_attendance_logs(user, event_id=None, volunteer_id=None, start_date=None, end_date=None):
    """Get attendance logs"""
    try:
        # Build query based on user role and filters
        if user['role'] == 'ngo':
            # NGO can see all attendance for their events
            events = Event.find_by_ngo(user['uid'])
            event_ids = [event.id for event in events]
            
            attendance_ref = db.collection('attendance')
            query = attendance_ref.where('event_id', 'in', event_ids)
            
        else:
            # Volunteer can only see their own attendance
            attendance_ref = db.collection('attendance')
            query = attendance_ref.where('volunteer_id', '==', user['uid'])
        
        # Apply filters
        if event_id:
            query = query.where('event_id', '==', event_id)
        if volunteer_id:
            query = query.where('volunteer_id', '==', volunteer_id)
        if start_date:
            query = query.where('check_in', '>=', datetime.fromisoformat(start_date))
        if end_date:
            query = query.where('check_in', '<=', datetime.fromisoformat(end_date))
        
        # Execute query
        attendance_records = query.get()
        
        # Convert to Attendance objects
        attendance_list = [Attendance(**{**record.to_dict(), 'id': record.id}) 
                         for record in attendance_records]
        
        return jsonify([attendance.to_dict() for attendance in attendance_list]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_volunteer_attendance(user_id):
    """Get attendance records for a volunteer"""
    try:
        # Get all attendance records for the user
        attendance_ref = db.collection('attendance')
        attendance_docs = attendance_ref.where('user_id', '==', user_id).get()
        
        # Format attendance records
        attendance_records = []
        for doc in attendance_docs:
            record = doc.to_dict()
            record['id'] = doc.id
            
            # Get event details
            event_doc = db.collection('events').document(record['event_id']).get()
            if event_doc.exists:
                event_data = event_doc.to_dict()
                record['event'] = {
                    'id': event_doc.id,
                    'name': event_data.get('name', ''),
                    'date': event_data.get('date', ''),
                    'location': event_data.get('location', '')
                }
            
            attendance_records.append(record)
        
        # Sort by date
        attendance_records.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return {'attendance': attendance_records}, 200
        
    except Exception as e:
        print(f"Error getting volunteer attendance: {str(e)}")
        return {'error': 'Internal server error'}, 500

def mark_attendance(user_id, event_id):
    """Mark attendance for a volunteer at an event"""
    try:
        # Check if event exists
        event_doc = db.collection('events').document(event_id).get()
        if not event_doc.exists:
            return {'error': 'Event not found'}, 404
        
        # Check if user exists
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return {'error': 'User not found'}, 404
        
        # Check if already marked attendance
        attendance_ref = db.collection('attendance')
        existing = attendance_ref.where('user_id', '==', user_id).where('event_id', '==', event_id).get()
        if len(list(existing)) > 0:
            return {'error': 'Attendance already marked'}, 400
        
        # Mark attendance
        attendance_data = {
            'user_id': user_id,
            'event_id': event_id,
            'timestamp': datetime.now(),
            'method': 'manual'  # or 'face_recognition' if using face recognition
        }
        
        doc_ref = attendance_ref.document()
        doc_ref.set(attendance_data)
        
        return {
            'message': 'Attendance marked successfully',
            'attendance_id': doc_ref.id
        }, 200
        
    except Exception as e:
        print(f"Error marking attendance: {str(e)}")
        return {'error': 'Internal server error'}, 500 