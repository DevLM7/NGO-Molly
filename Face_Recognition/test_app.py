import requests
import os
import shutil
from PIL import Image
import io
import base64
import time

def cleanup_data():
    """Clean up all data directories"""
    data_dir = "data"
    if os.path.exists(data_dir):
        shutil.rmtree(data_dir)
    os.makedirs(os.path.join(data_dir, "volunteers", "faces"), exist_ok=True)
    os.makedirs(os.path.join(data_dir, "events"), exist_ok=True)

def save_response_image(image_base64: str, filename: str):
    """Save a base64 image to a file"""
    try:
        image_data = base64.b64decode(image_base64)
        with open(filename, 'wb') as f:
            f.write(image_data)
        print(f"Saved response image to {filename}")
    except Exception as e:
        print(f"Error saving image: {str(e)}")

def test_register_face():
    print("\nTesting face registration...")
    url = 'http://localhost:5000/register_face'
    
    # Use the Harry Potter image for testing
    with open('harry.jpg', 'rb') as f:
        image_data = f.read()

    files = {'image': ('harry.jpg', image_data, 'image/jpeg')}
    data = {
        'volunteer_id': '1',
        'name': 'Harry Potter',
        'email': 'harry@hogwarts.edu'
    }

    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")

        # Save the response image showing face detection
        if 'image' in result:
            save_response_image(result['image'], 'registration_result.jpg')
            print("Registration successful! Check registration_result.jpg to see the detected face.")

    except Exception as e:
        print(f"Error: {str(e)}")

def test_mark_attendance():
    print("\nTesting attendance marking...")
    url = 'http://localhost:5000/mark_attendance'
    
    # Use the same image for attendance testing
    with open('harry.jpg', 'rb') as f:
        image_data = f.read()

    files = {'image': ('harry.jpg', image_data, 'image/jpeg')}
    data = {'event_id': '1'}

    try:
        response = requests.post(url, files=files, data=data)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print(f"Response: {result}")

        # Save the response image showing face recognition
        if 'image' in result:
            save_response_image(result['image'], 'attendance_result.jpg')
            print("Attendance marked! Check attendance_result.jpg to see the recognized face.")

    except Exception as e:
        print(f"Error: {str(e)}")

def test_attendance_logs():
    print("\nTesting attendance logs retrieval...")
    url = 'http://localhost:5000/attendance_logs'
    params = {'event_id': '1'}

    try:
        response = requests.get(url, params=params)
        print(f"Status Code: {response.status_code}")
        result = response.json()
        print("\nAttendance Logs:")
        for log in result:
            print(f"\nVolunteer: {log['volunteer_name']}")
            print(f"Time: {log['timestamp']}")
            print(f"Confidence: {log['confidence_score']}%")
            
            # Save the volunteer's photo if available
            if 'photo' in log:
                photo_filename = f"volunteer_{log['volunteer_id']}_photo.jpg"
                save_response_image(log['photo'], photo_filename)
                print(f"Saved volunteer photo to {photo_filename}")

    except Exception as e:
        print(f"Error: {str(e)}")

def cleanup_test_files():
    """Clean up test image files"""
    files_to_remove = [
        'registration_result.jpg',
        'attendance_result.jpg'
    ]
    
    for file in files_to_remove:
        if os.path.exists(file):
            try:
                os.remove(file)
            except Exception as e:
                print(f"Error removing {file}: {str(e)}")

if __name__ == "__main__":
    print("Testing Face Recognition Attendance System")
    print("========================================")
    
    # Clean up everything first
    print("Cleaning up previous data...")
    cleanup_test_files()
    cleanup_data()
    
    # Run tests
    test_register_face()
    
    # Wait a moment to simulate real usage
    print("\nWaiting 2 seconds before marking attendance...")
    time.sleep(2)
    
    test_mark_attendance()
    test_attendance_logs()
    
    print("\nTest complete! Check the generated images to see the results.") 