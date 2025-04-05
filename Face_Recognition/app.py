from flask import Flask, request, jsonify, Response, render_template
from face_utils import (
    process_registration_image, process_attendance_image,
    compare_faces, draw_face_box, FaceRecognitionError
)
import numpy as np
from datetime import datetime
import base64
from io import BytesIO
from PIL import Image
import cv2
from data_manager import DataManager
import os

app = Flask(__name__)
data_manager = DataManager()

# Create required directories
os.makedirs('static', exist_ok=True)
os.makedirs('templates', exist_ok=True)

@app.route('/')
def index():
    """Redirect to dashboard"""
    return render_template('dashboard.html')

@app.route('/live_attendance_page')
def live_attendance_page():
    """Render the live attendance page"""
    return render_template('live_attendance.html')

def generate_frames(event_id):
    """Generate frames from webcam with face recognition"""
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam")
        return
        
    # Set webcam resolution
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
    
    while True:
        success, frame = cap.read()
        if not success:
            print("Error: Could not read frame")
            break
        
        try:
            # Get all registered volunteers with their profile photos
            volunteers = data_manager.get_all_volunteers()
            if not volunteers:
                # If no volunteers, just show the frame with a message
                cv2.putText(frame, "No registered volunteers", (10, 30), 
                          cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            else:
                # Convert frame to RGB (face_recognition uses RGB)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                
                # Detect faces in the frame
                face_encodings, face_locations = process_attendance_image(rgb_frame)
                
                # Check each detected face
                for face_encoding, face_location in zip(face_encodings, face_locations):
                    best_match = None
                    highest_confidence = 0
                    
                    # Compare with registered faces
                    for volunteer_id, volunteer in volunteers:
                        confidence = compare_faces(volunteer["face_encoding"], face_encoding)
                        if confidence > highest_confidence and confidence >= 90:
                            highest_confidence = confidence
                            best_match = (volunteer_id, volunteer)
                    
                    if best_match:
                        volunteer_id, volunteer = best_match
                        # Mark attendance
                        if data_manager.mark_attendance(event_id, volunteer_id, highest_confidence):
                            # Draw green box for successful attendance
                            color = (0, 255, 0)  # Green
                            label = f"{volunteer['name']} ({highest_confidence:.1f}%) - Marked!"
                        else:
                            # Draw orange box for already marked attendance
                            color = (0, 165, 255)  # Orange in BGR
                            label = f"{volunteer['name']} - Already Marked"
                    else:
                        # Draw red box for unknown face
                        color = (0, 0, 255)  # Red
                        label = "Unknown"
                    
                    # Draw box and label on frame
                    top, right, bottom, left = face_location
                    cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                    cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
                    cv2.putText(frame, label, (left + 6, bottom - 6), 
                              cv2.FONT_HERSHEY_DUPLEX, 0.6, (255, 255, 255), 1)
        
        except Exception as e:
            print(f"Error processing frame: {str(e)}")
            # Add error message to frame
            cv2.putText(frame, f"Error: {str(e)}", (10, 30), 
                      cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        
        try:
            # Convert frame to JPEG
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                print("Error: Could not encode frame")
                continue
                
            frame_bytes = buffer.tobytes()
            
            # Yield frame for streaming
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        
        except Exception as e:
            print(f"Error streaming frame: {str(e)}")
            continue
    
    # Release webcam
    cap.release()

@app.route('/live_attendance')
def live_attendance():
    """Stream webcam feed with face recognition"""
    event_id = request.args.get('event_id', '1')
    return Response(generate_frames(event_id),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/register_face', methods=['POST'])
def register_face():
    """Register a new volunteer with their profile photo"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        image_file = request.files['image']
        image_data = image_file.read()
        
        # Get volunteer details
        volunteer_id = request.form.get('volunteer_id')
        name = request.form.get('name')
        email = request.form.get('email')
        
        if not all([volunteer_id, name, email]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Process the image for face recognition
        face_encoding, face_location = process_registration_image(image_data)
        
        # Store in local storage
        if not data_manager.register_volunteer(volunteer_id, name, email, face_encoding, image_data):
            return jsonify({'error': 'Volunteer ID already exists'}), 400
        
        # Create response image with face box
        image_array = np.array(Image.open(BytesIO(image_data)))
        response_image = draw_face_box(image_array, face_location, name)
        
        # Convert response image to base64
        buffered = BytesIO()
        Image.fromarray(response_image).save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return jsonify({
            'message': 'Registration successful',
            'image': img_str
        })
    
    except FaceRecognitionError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/attendance_logs')
def get_attendance_logs():
    """Get attendance logs for an event"""
    event_id = request.args.get('event_id', '1')
    logs = data_manager.get_attendance_logs(event_id)
    return jsonify(logs)

if __name__ == '__main__':
    app.run(debug=True) 