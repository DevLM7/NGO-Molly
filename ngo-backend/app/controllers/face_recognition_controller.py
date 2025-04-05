from utils.firebase import db, storage
from app.models.attendance import Attendance
import numpy as np
import json
import uuid
from datetime import datetime
from app.models.user import User

def save_face_descriptor(user_id, face_descriptor):
    try:
        user = User.find_by_id(user_id)
        if not user:
            raise ValueError('User not found')
            
        user.face_descriptor = face_descriptor
        user.save()
        
        return True
    except Exception as e:
        print(f"Error saving face descriptor: {str(e)}")
        raise

def verify_face_descriptor(stored_descriptor, live_descriptor):
    try:
        if not stored_descriptor or not live_descriptor:
            return False
            
        # Convert descriptors to numpy arrays
        stored = np.array(stored_descriptor)
        live = np.array(live_descriptor)
        
        # Calculate Euclidean distance
        distance = np.linalg.norm(stored - live)
        
        # Define threshold for matching (adjust based on your requirements)
        THRESHOLD = 0.6
        
        return distance <= THRESHOLD
    except Exception as e:
        print(f"Error verifying face descriptor: {str(e)}")
        return False

def match_face(face_descriptor):
    try:
        # Get all users with face descriptors
        users = User.find_all_with_face_descriptors()
        
        best_match = None
        best_distance = float('inf')
        
        for user in users:
            if not user.face_descriptor:
                continue
                
            # Calculate distance between descriptors
            distance = np.linalg.norm(
                np.array(user.face_descriptor) - np.array(face_descriptor)
            )
            
            if distance < best_distance:
                best_distance = distance
                best_match = user
                
        # Define threshold for matching
        THRESHOLD = 0.6
        
        if best_distance <= THRESHOLD:
            return best_match
        return None
    except Exception as e:
        print(f"Error matching face: {str(e)}")
        return None

def mark_attendance(event_id, user_id):
    try:
        # Check if attendance already exists
        existing = Attendance.find_by_event_and_volunteer(event_id, user_id)
        if existing:
            return existing
            
        # Create new attendance record
        attendance = Attendance(
            event_id=event_id,
            volunteer_id=user_id,
            status='attended',
            verification_method='face_recognition'
        )
        attendance.save()
        
        return attendance
    except Exception as e:
        print(f"Error marking attendance: {str(e)}")
        raise 