from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
import os
from utils.firebase import initialize_firebase

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key')
    
    # Initialize extensions
    CORS(app)
    limiter = Limiter(
        get_remote_address,
        app=app,
        default_limits=["200 per day", "50 per hour"],
        storage_uri="memory://"
    )
    
    # Initialize Firebase
    initialize_firebase()
    
    # Import routes here to avoid circular imports
    from routes.auth import auth_bp
    from routes.volunteer import volunteer_bp
    from routes.ngo import ngo_bp
    from routes.face_recognition import face_recognition_bp
    from routes.badge import badge_bp
    from routes.certificate import certificate_bp
    from routes.report import report_bp
    from routes.social import social_bp
    from routes.notification import notification_bp
    
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
    
    # Add security headers
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'SAMEORIGIN'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        return response
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app 