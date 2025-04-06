from flask import Blueprint, request, jsonify
from utils.firebase import db, storage
from middleware.auth import require_auth
from app.controllers.face_recognition_controller import (
    save_face_descriptor, match_face, mark_attendance, verify_face_descriptor
)
from app.controllers.bulk_face_recognition import process_bulk_attendance
from app.models.attendance import Attendance
from app.models.event import Event
from app.models.user import User
import base64
import numpy as np

face_recognition_bp = Blueprint('face_recognition', __name__)

@face_recognition_bp.route('/upload-descriptor', methods=['POST'])
@require_auth
def upload_descriptor():
    """Upload face descriptor for a user"""
    try:
        data = request.get_json()
        user_id = request.user['uid']
        descriptor = data.get('descriptor')
        
        if not descriptor:
            return jsonify({'error': 'Face descriptor is required'}), 400
            
        result = save_face_descriptor(user_id, descriptor)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@face_recognition_bp.route('/match', methods=['POST'])
@require_auth
def match_face_descriptor():
    """Match face descriptor with stored descriptors"""
    try:
        data = request.get_json()
        descriptor = data.get('descriptor')
        event_id = data.get('event_id')
        
        if not descriptor or not event_id:
            return jsonify({'error': 'Face descriptor and event ID are required'}), 400
            
        match = match_face(descriptor, event_id)
        return jsonify(match), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@face_recognition_bp.route('/mark-attendance', methods=['POST'])
@require_auth
def mark_face_attendance():
    """Mark attendance using face recognition"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        event_id = data.get('event_id')
        
        if not user_id or not event_id:
            return jsonify({'error': 'User ID and event ID are required'}), 400
            
        attendance = mark_attendance(user_id, event_id)
        return jsonify(attendance), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@face_recognition_bp.route('/bulk-process', methods=['POST'])
@require_auth
def bulk_process_attendance():
    """Process event photo to mark attendance for multiple volunteers"""
    try:
        if not request.user.get('is_ngo_admin'):
            return jsonify({'error': 'Unauthorized'}), 403
            
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo uploaded'}), 400
            
        photo = request.files['photo']
        if photo.filename == '':
            return jsonify({'error': 'No selected photo'}), 400
            
        event_id = request.form.get('eventId')
        threshold = float(request.form.get('threshold', 0.6))
        
        if not event_id:
            return jsonify({'error': 'Event ID is required'}), 400
            
        result = process_bulk_attendance(event_id, photo, threshold)
        if 'error' in result:
            return jsonify(result), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@face_recognition_bp.route('/verify', methods=['POST'])
@require_auth
def verify_attendance():
    try:
        data = request.get_json()
        event_id = data.get('eventId')
        face_descriptor = data.get('faceDescriptor')
        
        if not event_id or not face_descriptor:
            return jsonify({
                'success': False,
                'message': 'Missing required fields'
            }), 400
            
        # Get the event
        event = Event.find_by_id(event_id)
        if not event:
            return jsonify({
                'success': False,
                'message': 'Event not found'
            }), 404
            
        # Get the user
        user = User.find_by_id(request.user_id)
        if not user:
            return jsonify({
                'success': False,
                'message': 'User not found'
            }), 404
            
        # Check if user is registered for the event
        if not event.is_registered(user.id):
            return jsonify({
                'success': False,
                'message': 'You are not registered for this event'
            }), 400
            
        # Check if attendance already marked
        existing_attendance = Attendance.find_by_event_and_volunteer(event_id, user.id)
        if existing_attendance:
            return jsonify({
                'success': False,
                'message': 'Attendance already marked for this event'
            }), 400
            
        # Verify face descriptor
        match_found = verify_face_descriptor(user.face_descriptor, face_descriptor)
        
        if not match_found:
            return jsonify({
                'success': False,
                'message': 'Face verification failed. Please try again.'
            }), 400
            
        # Create attendance record
        attendance = Attendance(
            event_id=event_id,
            volunteer_id=user.id,
            status='attended',
            verification_method='face_recognition'
        )
        attendance.save()
        
        return jsonify({
            'success': True,
            'message': 'Attendance marked successfully',
            'attendance': attendance.to_dict()
        })
        
    except Exception as e:
        print(f"Error in face recognition verification: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'An error occurred while verifying attendance'
        }), 500 