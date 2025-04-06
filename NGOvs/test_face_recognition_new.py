import cv2
import numpy as np
from deepface import DeepFace
from ngo_backend.app.models.user import User
from ngo_backend.app.models.event import Event
from ngo_backend.app.models.attendance import Attendance
from werkzeug.datastructures import FileStorage

def test_face_recognition():
    print("Testing face recognition implementation...")
    
    # 1. Create test image path (replace with actual path)
    test_image_path = "test_volunteer.jpg"
    
    # 2. Generate face embedding
    try:
        test_image = cv2.imread(test_image_path)
        test_encoding = DeepFace.represent(
            img_path=test_image,
            model_name='Facenet',
            enforce_detection=False
        )[0]['embedding']
        print("Successfully generated face embedding")
    except Exception as e:
        print(f"Error generating embedding: {str(e)}")
        return

    # 3. Create test volunteer
    volunteer = User(
        name="Test Volunteer",
        email="test@example.com",
        role="volunteer",
        face_descriptor=test_encoding
    )
    volunteer.save()
    print("Created test volunteer")

    # 4. Verify face matching
    from ngo_backend.app.controllers.face_recognition_controller import verify_face_descriptor
    result = verify_face_descriptor(test_encoding, test_encoding)
    print(f"Verification result (should be True): {result}")

    print("Test completed")

if __name__ == "__main__":
    test_face_recognition()
