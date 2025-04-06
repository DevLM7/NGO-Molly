from functools import wraps
from flask import request, jsonify
from app.config.firebase import auth
from app.config.firebase import db

def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
            else:
                token = auth_header
            
            # Verify token
            decoded_token = auth.verify_id_token(token)
            request.user = decoded_token
            return f(*args, **kwargs)
            
        except Exception as e:
            print(f"Authentication error: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

def require_role(role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'error': 'No authorization header'}), 401
            
            try:
                # Remove 'Bearer ' prefix if present
                if auth_header.startswith('Bearer '):
                    token = auth_header[7:]
                else:
                    token = auth_header
                
                # Verify token
                decoded_token = auth.verify_id_token(token)
                
                # Check role
                user_doc = db.collection('users').document(decoded_token['uid']).get()
                if not user_doc.exists:
                    return jsonify({'error': 'User not found'}), 404
                
                user_data = user_doc.to_dict()
                if user_data.get('role') != role:
                    return jsonify({'error': 'Unauthorized role'}), 403
                
                request.user = decoded_token
                return f(*args, **kwargs)
                
            except Exception as e:
                print(f"Role verification error: {str(e)}")
                return jsonify({'error': 'Invalid token'}), 401
        
        return decorated_function
    return decorator 