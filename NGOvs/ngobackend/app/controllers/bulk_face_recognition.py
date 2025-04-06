import numpy as np
import os
import sys
import subprocess
import json
import tempfile
from concurrent.futures import ThreadPoolExecutor
from ngobackend.app.models.user import User
from ngobackend.app.models.attendance import Attendance
from ngobackend.app.models.event import Event
from ngobackend.utils.firebase import storage
import time
import os
import cv2
import numpy as np
#from app.utils.face_recognition import extract_faces  # Import the extract_faces function
def extract_faces(image_path):
    """
    Extract face descriptors using OpenCV

    Args:
        image_path (str): Path to the image file.

    Returns:
        list: A list of dictionaries containing face locations and descriptors.
    """
    # Load the image in grayscale
    image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return []
    
    # Initialize face detector
    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
    )
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        image,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    # Convert faces to descriptors using LBPH
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    face_data = []
    for (x, y, w, h) in faces:
        face_roi = image[y:y+h, x:x+w]
        # Resize to consistent size
        face_roi = cv2.resize(face_roi, (100, 100))
        # Train with dummy label to get descriptor
        recognizer.train([face_roi], np.array([0]))
        # Get histogram (descriptor)
        hist = recognizer.getHistograms()[0][0]
        
        face_data.append({
            "location": (int(y), int(x+w), int(y+h), int(x)),  # (top, right, bottom, left)
            "descriptor": hist.tolist()
        })
    
    return face_data
def process_bulk_attendance(event_id, photo_file, threshold=0.6):
    try:
        # Get event and registered volunteers
        event = Event.find_by_id(event_id)
        if not event:
            raise ValueError('Event not found')
            
        volunteers = event.get_registered_volunteers()
        if not volunteers:
            return {'error': 'No volunteers registered for this event'}, 400
            
        # Validate and save uploaded photo
        if not photo_file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            return {'error': 'Only JPG/JPEG/PNG files are allowed'}, 400
            
        photo_path = f"/tmp/{int(time.time())}_{photo_file.filename}"
        photo_file.save(photo_path)
        
        try:
            # Process event photo
            event_faces = extract_faces(photo_path)
        except Exception as e:
            return {'error': f'Failed to process image: {str(e)}'}, 400
        finally:
            # Clean up temp file
            try:
                os.remove(photo_path)
            except:
                pass
        
        if not event_faces:
            return {'error': 'No faces detected in the photo'}, 400
            
        # Match each face against volunteer profiles
        results = []
        with ThreadPoolExecutor() as executor:
            futures = []
            for face in event_faces:
                future = executor.submit(
                    match_against_volunteers,
                    face['descriptor'],
                    volunteers,
                    threshold
                )
                futures.append(future)
            
            for future in futures:
                match = future.result()
                if match:
                    results.append(match)
                    
        # Mark attendance for matched volunteers
        marked = []
        for result in results:
            attendance = Attendance(
                event_id=event_id,
                volunteer_id=result['volunteer_id'],
                status='attended',
                verification_method='bulk_face_recognition',
                confidence_score=result['confidence']
            )
            attendance.save()
            marked.append(attendance.to_dict())
            
        return {
            'total_faces': len(event_faces),
            'matches_found': len(results),
            'attendance_marked': marked
        }
        
    except Exception as e:
        return {'error': str(e)}, 500

def match_against_volunteers(face_descriptor, volunteers, threshold):
    try:
        if not isinstance(face_descriptor, list) or len(face_descriptor) == 0:
            return None
            
        best_match = None
        best_confidence = float('inf')
        
        # Create LBPH recognizer
        recognizer = cv2.face.LBPHFaceRecognizer_create()
        
        for volunteer in volunteers:
            if not volunteer.face_descriptor:
                continue
                
            try:
                # Convert descriptors to numpy arrays
                face_arr = np.array(face_descriptor, dtype=np.uint8)
                volunteer_arr = np.array(volunteer.face_descriptor, dtype=np.uint8)
                
                # Train with volunteer's descriptor
                recognizer.train([volunteer_arr], np.array([0]))
                
                # Predict confidence
                label, confidence = recognizer.predict(face_arr)
                
                if confidence < best_confidence:
                    best_confidence = confidence
                    best_match = volunteer
                    
            except Exception as e:
                print(f"Error matching volunteer {volunteer.id}: {str(e)}")
                continue
                
        if best_match and best_confidence <= threshold:
            return {
                'volunteer_id': best_match.id,
                'confidence': 1 - (best_confidence / 100)  # Convert to 0-1 scale
            }
        return None
    except Exception as e:
        print(f"Error in match_against_volunteers: {str(e)}")
        return None
