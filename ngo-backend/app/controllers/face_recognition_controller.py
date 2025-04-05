from utils.firebase import db, storage
from app.models.attendance import Attendance
import numpy as np
import json
import uuid
from datetime import datetime

def save_face_descriptor(user_id, descriptor):
    """Save face descriptor for a user"""
    try:
        # Convert descriptor to list if it's a string
        if isinstance(descriptor, str):
            descriptor = json.loads(descriptor)
        
        # Save descriptor to Firestore
        db.collection('face_descriptors').document(user_id).set({
            'descriptor': descriptor,
            'updated_at': datetime.now().isoformat()
        })
        
        return {'message': 'Face descriptor saved successfully'}, 201
    except Exception as e:
        return {'error': str(e)}, 500

def match_face(descriptor, event_id):
    """Match face descriptor with stored descriptors"""
    try:
        # Convert descriptor to list if it's a string
        if isinstance(descriptor, str):
            descriptor = json.loads(descriptor)
        
        # Get all face descriptors
        descriptors_ref = db.collection('face_descriptors').get()
        
        # Find the best match
        best_match = None
        best_distance = float('inf')
        
        for doc in descriptors_ref:
            stored_descriptor = doc.to_dict().get('descriptor')
            if not stored_descriptor:
                continue
                
            # Calculate Euclidean distance
            distance = calculate_euclidean_distance(descriptor, stored_descriptor)
            
            if distance < best_distance:
                best_distance = distance
                best_match = doc.id
        
        # Check if the match is good enough (threshold can be adjusted)
        if best_distance < 0.6 and best_match:
            # Check if user is registered for the event
            event = db.collection('events').document(event_id).get()
            if not event.exists:
                return {'error': 'Event not found'}, 404
                
            event_data = event.to_dict()
            registered_volunteers = event_data.get('registered_volunteers', [])
            
            if best_match in registered_volunteers:
                return {
                    'user_id': best_match,
                    'distance': best_distance,
                    'match_found': True
                }, 200
            else:
                return {
                    'user_id': best_match,
                    'distance': best_distance,
                    'match_found': True,
                    'not_registered': True
                }, 200
        else:
            return {
                'match_found': False,
                'message': 'No matching face found'
            }, 200
            
    except Exception as e:
        return {'error': str(e)}, 500

def calculate_euclidean_distance(descriptor1, descriptor2):
    """Calculate Euclidean distance between two face descriptors"""
    try:
        # Convert to numpy arrays
        arr1 = np.array(descriptor1)
        arr2 = np.array(descriptor2)
        
        # Calculate Euclidean distance
        distance = np.linalg.norm(arr1 - arr2)
        
        return distance
    except Exception as e:
        print(f"Error calculating distance: {e}")
        return float('inf')

def mark_attendance(user_id, event_id):
    """Mark attendance for a user at an event"""
    try:
        # Check if event exists
        event = db.collection('events').document(event_id).get()
        if not event.exists:
            return {'error': 'Event not found'}, 404
            
        # Check if user is registered for the event
        event_data = event.to_dict()
        registered_volunteers = event_data.get('registered_volunteers', [])
        
        if user_id not in registered_volunteers:
            return {'error': 'User not registered for this event'}, 400
            
        # Check if attendance already exists
        attendance_ref = db.collection('attendance').where('user_id', '==', user_id).where('event_id', '==', event_id).get()
        
        if attendance_ref:
            # Update existing attendance
            attendance_id = attendance_ref[0].id
            db.collection('attendance').document(attendance_id).update({
                'check_in': datetime.now().isoformat(),
                'status': 'present',
                'updated_at': datetime.now().isoformat()
            })
            
            return {
                'attendance_id': attendance_id,
                'message': 'Attendance updated successfully'
            }, 200
        else:
            # Create new attendance record
            attendance_id = str(uuid.uuid4())
            db.collection('attendance').document(attendance_id).set({
                'id': attendance_id,
                'user_id': user_id,
                'event_id': event_id,
                'check_in': datetime.now().isoformat(),
                'status': 'present',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            })
            
            return {
                'attendance_id': attendance_id,
                'message': 'Attendance marked successfully'
            }, 201
            
    except Exception as e:
        return {'error': str(e)}, 500 