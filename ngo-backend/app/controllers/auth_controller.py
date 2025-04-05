from flask import jsonify
from app.models.user import User
import firebase_admin
from firebase_admin import auth
import jwt
import os
from datetime import datetime, timedelta

def register_user(data):
    """Register a new user"""
    try:
        # Validate required fields
        required_fields = ['email', 'password', 'name', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if user already exists
        if User.find_by_email(data['email']):
            return jsonify({'error': 'Email already registered'}), 400
        
        # Create user in Firebase Auth
        firebase_uid = User.create_firebase_user(
            data['email'],
            data['password'],
            data['name']
        )
        
        # Create user profile in Firestore
        user = User(
            uid=firebase_uid,
            email=data['email'],
            name=data['name'],
            role=data['role'],
            phone=data.get('phone'),
            address=data.get('address'),
            skills=data.get('skills', []),
            interests=data.get('interests', [])
        )
        user.save()
        
        # Generate JWT token
        token = generate_token(firebase_uid, data['role'])
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def login_user(data):
    """Login user"""
    try:
        # Validate required fields
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Note: Email/password verification should be handled client-side using Firebase Auth SDK
        # This endpoint is for server-side token verification
        
        # Get user from Firestore
        user = User.find_by_email(data['email'])
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        token = generate_token(user.uid, user.role)
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_current_user(user_data):
    """Get current user profile"""
    try:
        user = User.find_by_id(user_data['uid'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_user_profile(user_id):
    """Get user profile by ID"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
            
        # Return only public information
        public_data = {
            'uid': user.uid,
            'name': user.name,
            'role': user.role,
            'skills': user.skills,
            'interests': user.interests,
            'profile_image': user.profile_image,
            'bio': user.bio
        }
        
        return jsonify(public_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_user_profile(user_data, update_data):
    """Update user profile"""
    try:
        user = User.find_by_id(user_data['uid'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update user fields
        for field in ['name', 'phone', 'address', 'skills', 'interests', 'profile_image', 'bio']:
            if field in update_data:
                setattr(user, field, update_data[field])
        
        # Update display name in Firebase Auth if name changed
        if 'name' in update_data:
            auth.update_user(user.uid, display_name=update_data['name'])
        
        user.save()
        return jsonify(user.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def generate_token(uid, role):
    """Generate JWT token"""
    payload = {
        'uid': uid,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=int(os.getenv('JWT_EXPIRE', '30').rstrip('d')))
    }
    return jwt.encode(payload, os.getenv('JWT_SECRET'), algorithm='HS256') 