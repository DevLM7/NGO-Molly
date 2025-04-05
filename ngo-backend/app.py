from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from routes.auth import auth_bp
from routes.volunteer import volunteer_bp
from routes.ngo import ngo_bp
from routes.face_recognition import face_recognition_bp
from routes.badge import badge_bp
from routes.certificate import certificate_bp
from routes.report import report_bp
from routes.social import social_bp
from routes.notification import notification_bp
from utils.firebase import initialize_firebase

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
    app.config['FIREBASE_CONFIG'] = {
        'apiKey': os.getenv('FIREBASE_API_KEY'),
        'authDomain': os.getenv('FIREBASE_AUTH_DOMAIN'),
        'projectId': os.getenv('FIREBASE_PROJECT_ID'),
        'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET'),
        'messagingSenderId': os.getenv('FIREBASE_MESSAGING_SENDER_ID'),
        'appId': os.getenv('FIREBASE_APP_ID'),
        'measurementId': os.getenv('FIREBASE_MEASUREMENT_ID')
    }

    # Initialize Firebase
    initialize_firebase()

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(volunteer_bp, url_prefix='/api/volunteer')
    app.register_blueprint(ngo_bp, url_prefix='/api/ngo')
    app.register_blueprint(face_recognition_bp, url_prefix='/api/face-recognition')
    app.register_blueprint(badge_bp, url_prefix='/api/badges')
    app.register_blueprint(certificate_bp, url_prefix='/api/certificates')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    app.register_blueprint(social_bp, url_prefix='/api/social')
    app.register_blueprint(notification_bp, url_prefix='/api/notifications')

    @app.route('/')
    def index():
        return {
            'message': 'Welcome to the NGO-Volunteer Platform API',
            'status': 'running',
            'endpoints': {
                'auth': '/api/auth',
                'volunteer': '/api/volunteer',
                'ngo': '/api/ngo',
                'face-recognition': '/api/face-recognition',
                'badges': '/api/badges',
                'certificates': '/api/certificates',
                'reports': '/api/reports',
                'social': '/api/social',
                'notifications': '/api/notifications',
                'health': '/health'
            }
        }

    @app.route('/health')
    def health_check():
        return {'status': 'healthy'}, 200

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=int(os.getenv('PORT', 5000))) 