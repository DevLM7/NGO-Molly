from functools import wraps
from flask import request, jsonify
from utils.firebase import verify_token

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'message': 'No authorization header'}), 401
        
        try:
            # Remove 'Bearer ' from token
            token = auth_header.split(' ')[1]
            decoded_token = verify_token(token)
            
            if not decoded_token:
                return jsonify({'message': 'Invalid token'}), 401
            
            # Add user info to request context
            request.user = decoded_token
            return f(*args, **kwargs)
            
        except Exception as e:
            return jsonify({'message': 'Invalid token'}), 401
            
    return decorated_function

def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header:
                return jsonify({'message': 'No authorization header'}), 401
            
            try:
                token = auth_header.split(' ')[1]
                decoded_token = verify_token(token)
                
                if not decoded_token:
                    return jsonify({'message': 'Invalid token'}), 401
                
                # Check if user has the required role
                if decoded_token.get('role') != role:
                    return jsonify({'message': 'Insufficient permissions'}), 403
                
                request.user = decoded_token
                return f(*args, **kwargs)
                
            except Exception as e:
                return jsonify({'message': 'Invalid token'}), 401
                
        return decorated_function
    return decorator 