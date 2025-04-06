from functools import wraps
from flask import request, jsonify
from app.config.firebase import verify_token

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'No authorization header'}), 401
            
        try:
            # Extract token from Bearer header
            token = auth_header.split('Bearer ')[1]
            
            # Verify token
            decoded_token = verify_token(token)
            if not decoded_token:
                return jsonify({'error': 'Invalid token'}), 401
                
            # Add user info to request
            request.user = decoded_token
            
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'error': str(e)}), 401
            
    return decorated_function

def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'error': 'No authorization header'}), 401
                
            try:
                # Extract token from Bearer header
                token = auth_header.split('Bearer ')[1]
                
                # Verify token
                decoded_token = verify_token(token)
                if not decoded_token:
                    return jsonify({'error': 'Invalid token'}), 401
                    
                # Check user role
                if decoded_token.get('role') != role:
                    return jsonify({'error': 'Unauthorized role'}), 403
                    
                # Add user info to request
                request.user = decoded_token
                
                return f(*args, **kwargs)
                
            except Exception as e:
                return jsonify({'error': str(e)}), 401
                
        return decorated_function
    return decorator 