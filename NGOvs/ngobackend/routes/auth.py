from flask import Blueprint, request, jsonify
from firebase_admin import auth, firestore
from utils.firebase import db
from middleware.auth import require_auth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=data['email'],
            password=data['password'],
            display_name=data.get('name', '')
        )
        
        # Set custom claims for role
        auth.set_custom_user_claims(user.uid, {'role': data['role']})
        
        # Create user profile in Firestore
        user_data = {
            'uid': user.uid,
            'name': data.get('name', ''),
            'email': data['email'],
            'role': data['role'],
            'skills': data.get('skills', []),
            'interests': data.get('interests', []),
            'totalHours': 0,
            'badges': [],
            'milestones': [],
            'createdAt': firestore.SERVER_TIMESTAMP
        }
        
        db.collection('users').document(user.uid).set(user_data)
        
        return jsonify({
            'message': 'User registered successfully',
            'uid': user.uid
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    # Note: Actual login should be handled client-side with Firebase Auth SDK
    # This endpoint is for server-side token verification
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({'message': 'Token is required'}), 400
            
        decoded_token = auth.verify_id_token(token)
        return jsonify({'user': decoded_token}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    try:
        user_id = request.user['uid']
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return jsonify({'message': 'User profile not found'}), 404
            
        return jsonify(user_doc.to_dict()), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400

@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    try:
        user_id = request.user['uid']
        data = request.get_json()
        
        # Update user profile in Firestore
        db.collection('users').document(user_id).update(data)
        
        # Update display name in Firebase Auth if provided
        if 'name' in data:
            auth.update_user(user_id, display_name=data['name'])
        
        return jsonify({'message': 'Profile updated successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 400 