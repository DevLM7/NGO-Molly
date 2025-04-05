from flask import Blueprint, request, jsonify
from utils.firebase import db, storage
from middleware.auth import require_auth
from app.controllers.face_recognition_controller import (
    save_face_descriptor, match_face, mark_attendance
)
import base64

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