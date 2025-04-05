import face_recognition
import numpy as np
import cv2
from PIL import Image
import io
from typing import Tuple, List, Optional
import base64

class FaceRecognitionError(Exception):
    """Custom exception for face recognition errors"""
    pass

def image_to_array(image_data: bytes) -> np.ndarray:
    """Convert image bytes to numpy array"""
    try:
        image = Image.open(io.BytesIO(image_data))
        return np.array(image)
    except Exception as e:
        raise FaceRecognitionError(f"Failed to process image: {str(e)}")

def detect_faces(image_array: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """Detect faces in the image and return their locations"""
    face_locations = face_recognition.face_locations(image_array)
    if not face_locations:
        raise FaceRecognitionError("No face detected in the image")
    if len(face_locations) > 1:
        raise FaceRecognitionError("Multiple faces detected. Please provide an image with only one face")
    return face_locations

def get_face_encoding(image_array: np.ndarray, face_location: Tuple[int, int, int, int]) -> np.ndarray:
    """Get face encoding for a specific face location"""
    face_encodings = face_recognition.face_encodings(image_array, [face_location])
    if not face_encodings:
        raise FaceRecognitionError("Failed to encode face")
    return face_encodings[0]

def compare_faces(known_encoding: np.ndarray, face_encoding: np.ndarray, tolerance: float = 0.6) -> float:
    """Compare two face encodings and return confidence score"""
    distance = face_recognition.face_distance([known_encoding], face_encoding)[0]
    confidence = (1 - distance) * 100
    return confidence

def draw_face_box(image_array: np.ndarray, face_location: Tuple[int, int, int, int], name: str = None) -> np.ndarray:
    """Draw bounding box and name label on the image"""
    top, right, bottom, left = face_location
    cv2.rectangle(image_array, (left, top), (right, bottom), (0, 255, 0), 2)
    
    if name:
        cv2.rectangle(image_array, (left, bottom - 35), (right, bottom), (0, 255, 0), cv2.FILLED)
        font = cv2.FONT_HERSHEY_DUPLEX
        cv2.putText(image_array, name, (left + 6, bottom - 6), font, 0.6, (255, 255, 255), 1)
    
    return image_array

def encode_to_bytes(encoding: np.ndarray) -> bytes:
    """Convert numpy array to bytes for database storage"""
    return base64.b64encode(encoding.tobytes())

def bytes_to_encoding(encoded_bytes: bytes) -> np.ndarray:
    """Convert bytes from database back to numpy array"""
    return np.frombuffer(base64.b64decode(encoded_bytes), dtype=np.float64)

def process_registration_image(image_data: bytes) -> Tuple[np.ndarray, Tuple[int, int, int, int]]:
    """Process image for registration, ensuring single face"""
    image_array = image_to_array(image_data)
    face_location = detect_faces(image_array)[0]
    face_encoding = get_face_encoding(image_array, face_location)
    return face_encoding, face_location

def process_attendance_image(image_data) -> Tuple[List[np.ndarray], List[Tuple[int, int, int, int]]]:
    """Process image for attendance, allowing multiple faces"""
    # If input is bytes, convert to numpy array
    if isinstance(image_data, bytes):
        image_array = image_to_array(image_data)
    else:
        image_array = image_data  # Already a numpy array
        
    face_locations = face_recognition.face_locations(image_array)
    if not face_locations:
        raise FaceRecognitionError("No faces detected in the image")
    
    face_encodings = face_recognition.face_encodings(image_array, face_locations)
    return face_encodings, face_locations