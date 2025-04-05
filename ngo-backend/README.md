# NGO-Volunteer Platform Backend

This is the backend for the NGO-Volunteer platform, built with Flask and Firebase.

## Features

- User Authentication (NGO and Volunteer)
- Event Management
- Attendance Tracking
- Feedback System
- Report Management
- Role-based Access Control

## Prerequisites

- Python 3.8+
- Firebase Account
- Firebase Admin SDK

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ngo-volunteer-platform.git
cd ngo-volunteer-platform/ngo-backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file based on `.env.example` and fill in your Firebase configuration.

5. Run the application:
```bash
python run.py
```

## API Endpoints

### Authentication
- POST `/api/auth/register`: Register a new user
- POST `/api/auth/login`: Login user
- GET `/api/auth/me`: Get current user profile
- GET `/api/auth/profile/<user_id>`: Get user profile by ID
- PUT `/api/auth/profile`: Update user profile

### Events
- POST `/api/events`: Create a new event
- GET `/api/events/<event_id>`: Get event by ID
- PUT `/api/events/<event_id>`: Update event
- DELETE `/api/events/<event_id>`: Delete event
- GET `/api/events/ngo`: Get NGO's events
- GET `/api/events/upcoming`: Get upcoming events

### Attendance
- POST `/api/attendance`: Mark attendance
- PUT `/api/attendance/<attendance_id>`: Update attendance
- GET `/api/attendance`: Get attendance logs

### Feedback
- POST `/api/feedback`: Create a new feedback
- GET `/api/feedback/<feedback_id>`: Get feedback by ID
- PUT `/api/feedback/<feedback_id>`: Update feedback
- DELETE `/api/feedback/<feedback_id>`: Delete feedback
- GET `/api/feedback/event/<event_id>`: Get event feedback
- GET `/api/feedback/user/<user_id>`: Get user feedback
- GET `/api/feedback/event/<event_id>/rating`: Get event rating

### Reports
- POST `/api/reports`: Create a new report
- GET `/api/reports/<report_id>`: Get report by ID
- PUT `/api/reports/<report_id>`: Update report
- DELETE `/api/reports/<report_id>`: Delete report
- GET `/api/reports/event/<event_id>`: Get event reports
- GET `/api/reports/user/<user_id>`: Get user reports
- GET `/api/reports/assigned`: Get assigned reports
- PUT `/api/reports/<report_id>/status`: Update report status
- PUT `/api/reports/<report_id>/assign`: Assign report
- GET `/api/reports/stats/<ngo_id>`: Get report statistics

## Project Structure

```
ngo-backend/
├── app/
│   ├── config/
│   │   └── firebase.py
│   ├── controllers/
│   │   ├── auth_controller.py
│   │   ├── event_controller.py
│   │   ├── attendance_controller.py
│   │   ├── feedback_controller.py
│   │   └── report_controller.py
│   ├── models/
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── event.py
│   │   ├── attendance.py
│   │   ├── feedback.py
│   │   └── report.py
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── event_routes.py
│   │   ├── attendance_routes.py
│   │   ├── feedback_routes.py
│   │   └── report_routes.py
│   ├── utils/
│   │   └── auth_middleware.py
│   └── __init__.py
├── .env
├── .env.example
├── .gitignore
├── README.md
├── requirements.txt
└── run.py
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 