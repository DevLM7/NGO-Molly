from app.config.firebase import db
from datetime import datetime

class Badge:
    def __init__(self, id=None, user_id=None, type=None, title=None, description=None, 
                 date_earned=None, event_id=None):
        self.id = id
        self.user_id = user_id
        self.type = type
        self.title = title
        self.description = description
        self.date_earned = date_earned or datetime.now()
        self.event_id = event_id
    
    @staticmethod
    def from_dict(data, id=None):
        """Create a Badge instance from a dictionary"""
        badge = Badge(
            id=id,
            user_id=data.get('user_id'),
            type=data.get('type'),
            title=data.get('title'),
            description=data.get('description'),
            date_earned=data.get('date_earned'),
            event_id=data.get('event_id')
        )
        return badge
    
    def to_dict(self):
        """Convert badge to dictionary"""
        return {
            'user_id': self.user_id,
            'type': self.type,
            'title': self.title,
            'description': self.description,
            'date_earned': self.date_earned,
            'event_id': self.event_id
        }
    
    def save(self):
        """Save badge to Firestore"""
        if self.id:
            # Update existing badge
            db.collection('badges').document(self.id).update(self.to_dict())
        else:
            # Create new badge
            doc_ref = db.collection('badges').document()
            self.id = doc_ref.id
            doc_ref.set(self.to_dict())
    
    def delete(self):
        """Delete badge from Firestore"""
        if self.id:
            db.collection('badges').document(self.id).delete()
    
    @staticmethod
    def find_by_id(badge_id):
        """Find badge by ID"""
        doc = db.collection('badges').document(badge_id).get()
        if doc.exists:
            return Badge.from_dict(doc.to_dict(), doc.id)
        return None
    
    @staticmethod
    def find_by_user(user_id):
        """Find all badges for a user"""
        badges = []
        docs = db.collection('badges').where('user_id', '==', user_id).get()
        for doc in docs:
            badges.append(Badge.from_dict(doc.to_dict(), doc.id))
        return badges
    
    @staticmethod
    def find_by_type(badge_type):
        """Find all badges of a specific type"""
        badges = []
        docs = db.collection('badges').where('type', '==', badge_type).get()
        for doc in docs:
            badges.append(Badge.from_dict(doc.to_dict(), doc.id))
        return badges 