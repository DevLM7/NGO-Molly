from app.config.firebase import db
from app.models.base import BaseModel
from datetime import datetime
from firebase_admin import firestore

class Event(BaseModel):
    collection_name = 'events'

    def __init__(self, id=None, ngo_id=None, title=None, description=None, 
                 location=None, start_date=None, end_date=None, 
                 max_volunteers=None, skills_required=None, 
                 status=None, created_at=None, updated_at=None):
        super().__init__(id, created_at, updated_at)
        self.ngo_id = ngo_id
        self.title = title
        self.description = description
        self.location = location
        self.start_date = start_date
        self.end_date = end_date
        self.max_volunteers = max_volunteers
        self.skills_required = skills_required or []
        self.status = status or 'upcoming'

    @classmethod
    def find_by_ngo(cls, ngo_id):
        """Find events by NGO ID"""
        return cls.find({'ngo_id': ngo_id})

    @classmethod
    def find_upcoming(cls):
        """Find upcoming events"""
        now = datetime.now()
        events = cls.find({'status': 'upcoming', 'start_date': {'>': now}})
        return sorted(events, key=lambda x: x.start_date)

    def register_volunteer(self, volunteer_id):
        """Register a volunteer for the event"""
        if self.status != 'upcoming':
            raise ValueError("Event is not open for registration")
            
        # Add volunteer to event's volunteers list
        event_ref = db.collection('events').document(self.id)
        event_ref.update({
            'volunteers': firestore.ArrayUnion([volunteer_id])
        })
        
        return True

    def unregister_volunteer(self, volunteer_id):
        """Unregister a volunteer from the event"""
        event_ref = db.collection('events').document(self.id)
        event_ref.update({
            'volunteers': firestore.ArrayRemove([volunteer_id])
        })
        
        return True

    def save(self):
        """Save or update event"""
        event_data = {
            'ngo_id': self.ngo_id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'max_volunteers': self.max_volunteers,
            'skills_required': self.skills_required,
            'status': self.status,
            'updated_at': datetime.now()
        }
        
        if not self.id:
            # Create new event
            event_data['created_at'] = datetime.now()
            event_ref = db.collection('events').document()
            self.id = event_ref.id
        else:
            # Update existing event
            event_ref = db.collection('events').document(self.id)
            
        event_ref.set(event_data, merge=True)
        return self

    def delete(self):
        """Delete event"""
        if not self.id:
            raise ValueError("Event ID is required for deletion")
            
        db.collection('events').document(self.id).delete()
        return True

    def to_dict(self):
        """Convert event to dictionary"""
        return {
            'id': self.id,
            'ngo_id': self.ngo_id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'max_volunteers': self.max_volunteers,
            'skills_required': self.skills_required,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 