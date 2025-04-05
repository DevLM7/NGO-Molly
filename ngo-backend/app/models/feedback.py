from app.models.base import BaseModel
from datetime import datetime

class Feedback(BaseModel):
    collection_name = 'feedback'

    def __init__(self, id=None, user_id=None, event_id=None, rating=None, 
                 comment=None, type=None, status=None, metadata=None, 
                 created_at=None, updated_at=None):
        super().__init__(id, created_at, updated_at)
        self.user_id = user_id
        self.event_id = event_id
        self.rating = rating
        self.comment = comment
        self.type = type or 'event'
        self.status = status or 'pending'
        self.metadata = metadata or {}

    @classmethod
    def find_by_event(cls, event_id):
        """Find feedback by event ID"""
        return cls.find({'event_id': event_id})

    @classmethod
    def find_by_user(cls, user_id):
        """Find feedback by user ID"""
        return cls.find({'user_id': user_id})

    @classmethod
    def get_average_rating(cls, event_id):
        """Get average rating for an event"""
        feedback_list = cls.find({'event_id': event_id})
        
        if not feedback_list:
            return 0
            
        total_rating = sum(feedback.rating for feedback in feedback_list)
        return total_rating / len(feedback_list)

    @classmethod
    def update_feedback_status(cls, feedback_id, status):
        """Update feedback status"""
        feedback = cls.find_by_id(feedback_id)
        if not feedback:
            return None
            
        feedback.status = status
        feedback.save()
        return feedback

    def to_dict(self):
        """Convert feedback to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'rating': self.rating,
            'comment': self.comment,
            'type': self.type,
            'status': self.status,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 