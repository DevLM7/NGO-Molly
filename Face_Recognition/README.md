# Facial Recognition Attendance System

A full-stack facial recognition attendance system for NGOs and Volunteers. This system provides face registration during volunteer onboarding and real-time attendance detection using facial recognition at NGO events.

## Features

- Face Registration during volunteer onboarding
- Real-time Attendance Detection using facial recognition
- PostgreSQL database for storing facial encodings and attendance records
- RESTful API endpoints for face registration and attendance marking
- Support for multiple face detection in attendance images
- Confidence score tracking for attendance verification
- Image processing with bounding boxes and name labels

## Prerequisites

- Python 3.8+
- PostgreSQL
- Visual Studio 2022 with C++ development tools (for dlib installation)
- Webcam (for real-time attendance)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Set up the PostgreSQL database and create a `.env` file:
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
```

5. Initialize the database:
```bash
python -c "from models import init_db; init_db()"
```

## API Endpoints

### 1. Register Face
```
POST /register_face
```
Registers a volunteer's face encoding in the database.

**Request:**
- Form data:
  - `volunteer_id`: ID of the volunteer
  - `image`: Image file containing the volunteer's face

**Response:**
```json
{
    "message": "Face registered successfully",
    "image": "base64_encoded_image_with_face_box"
}
```

### 2. Mark Attendance
```
POST /mark_attendance
```
Marks attendance for recognized volunteers in an event.

**Request:**
- Form data:
  - `event_id`: ID of the event
  - `image`: Image file containing volunteer faces

**Response:**
```json
{
    "message": "Attendance marked successfully",
    "recognized_faces": ["John Doe", "Jane Smith"],
    "new_attendance": ["John Doe"],
    "image": "base64_encoded_image_with_face_boxes"
}
```

### 3. Get Attendance Logs
```
GET /attendance_logs?event_id=xxx
```
Retrieves attendance records for a specific event.

**Response:**
```json
[
    {
        "volunteer_id": 1,
        "volunteer_name": "John Doe",
        "timestamp": "2024-04-05T10:30:00",
        "confidence_score": 95
    }
]
```

## Usage Examples

### Registering a Volunteer's Face
```python
import requests

url = 'http://localhost:5000/register_face'
files = {'image': open('volunteer_photo.jpg', 'rb')}
data = {'volunteer_id': 1}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### Marking Attendance
```python
import requests

url = 'http://localhost:5000/mark_attendance'
files = {'image': open('event_photo.jpg', 'rb')}
data = {'event_id': 1}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### Getting Attendance Logs
```python
import requests

url = 'http://localhost:5000/attendance_logs'
params = {'event_id': 1}

response = requests.get(url, params=params)
print(response.json())
```

## Error Handling

The system handles various error cases:
- No face detected in image
- Multiple faces in registration image
- Face not recognized (confidence < 90%)
- Invalid volunteer/event IDs
- Database connection issues

## Security Considerations

- Face encodings are stored securely in the database
- Confidence threshold of 90% for attendance verification
- Input validation for all API endpoints
- Error messages don't expose sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 