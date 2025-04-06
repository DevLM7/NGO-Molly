from flask import jsonify
from app.models.feedback import Feedback
from app.models.event import Event
from datetime import datetime

def create_feedback(data, user_id):
    """Create a new feedback"""
    try:
        # Validate required fields
        required_fields = ['event_id', 'rating']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify event exists
        event = Event.find_by_id(data['event_id'])
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Create feedback
        feedback = Feedback(
            user_id=user_id,
            event_id=data['event_id'],
            rating=data['rating'],
            comment=data.get('comment'),
            type=data.get('type', 'event'),
            metadata=data.get('metadata', {})
        )
        feedback.save()
        
        return jsonify(feedback.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_feedback(feedback_id):
    """Get feedback by ID"""
    try:
        feedback = Feedback.find_by_id(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        return jsonify(feedback.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_feedback(feedback_id, data, user_id):
    """Update feedback"""
    try:
        feedback = Feedback.find_by_id(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        # Check if user owns the feedback
        if feedback.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update feedback fields
        if 'rating' in data:
            feedback.rating = data['rating']
        if 'comment' in data:
            feedback.comment = data['comment']
        if 'type' in data:
            feedback.type = data['type']
        if 'metadata' in data:
            feedback.metadata = data['metadata']
        
        feedback.save()
        return jsonify(feedback.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def delete_feedback(feedback_id, user_id):
    """Delete feedback"""
    try:
        feedback = Feedback.find_by_id(feedback_id)
        if not feedback:
            return jsonify({'error': 'Feedback not found'}), 404
            
        # Check if user owns the feedback
        if feedback.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        feedback.delete()
        return jsonify({'message': 'Feedback deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_event_feedback(event_id):
    """Get feedback for an event"""
    try:
        feedback_list = Feedback.find({'event_id': event_id})
        return jsonify([feedback.to_dict() for feedback in feedback_list]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_user_feedback(user_id):
    """Get feedback by user"""
    try:
        feedback_list = Feedback.find({'user_id': user_id})
        return jsonify([feedback.to_dict() for feedback in feedback_list]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_event_rating(event_id):
    """Get average rating for an event"""
    try:
        average_rating = Feedback.get_average_rating(event_id)
        return jsonify({'average_rating': average_rating}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 