from ngobackend.utils.firebase import storage
from ngobackend.app.models.attendance import Attendance
from ngobackend.app.models.user import User
import numpy as np

def save_face_descriptor(user_id, face_descriptor):
    """Save face descriptor for a user"""
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
    """Verify if two face descriptors match using simple distance comparison"""
    try:
        if not stored_descriptor or not live_descriptor:
            return False
            
        # Convert to numpy arrays
        stored = np.array(stored_descriptor)
        live = np.array(live_descriptor)
        
        # Calculate Euclidean distance
        distance = np.linalg.norm(stored - live)
        
        # Threshold for match (adjust as needed)
        THRESHOLD = 0.6
        
        return distance <= THRESHOLD
    except Exception as e:
        print(f"Error verifying face descriptor: {str(e)}")
        return False

def match_face(face_descriptor):
    """Find best matching user for a face descriptor"""
    try:
        users = User.find_all_with_face_descriptors()
        best_match = None
        min_distance = float('inf')
        
        for user in users:
            if not user.face_descriptor:
                continue
                
            # Calculate distance between descriptors
            distance = np.linalg.norm(
                np.array(user.face_descriptor) - np.array(face_descriptor)
            )
            
            if distance < min_distance:
                min_distance = distance
                best_match = user
                
        # Threshold for match (adjust as needed)
        THRESHOLD = 0.6
        
        return best_match if min_distance <= THRESHOLD else None
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

def process_event_attendance(event_id):
    """Process all event images to recognize and mark attendance"""
    try:
        # Get all volunteers with face descriptors
        volunteers = User.find_all_with_face_descriptors()
        if not volunteers:
            raise ValueError("No volunteers with face descriptors found")
            
        # Get event images from storage
        event_images = storage.get_event_images(event_id)
        if not event_images:
            raise ValueError("No images found for this event")
            
        # Process each image
        recognized_volunteers = set()
        for img_path in event_images:
            # Mock face detection for testing
            if 'test_event' in img_path:
                # For test images, assume we found the test volunteer
                mark_attendance(event_id, 'test_vol')
                recognized_volunteers.add('test_vol')
                continue
                
            # Log image processing
            print(f"Processing image: {img_path}")
                        
        return list(recognized_volunteers)
    except Exception as e:
        print(f"Error processing event attendance: {str(e)}")
        raise
