from flask import jsonify
from app.models.event import Event
from app.config.firebase import db
from datetime import datetime

def create_event(data, ngo_id):
    """Create a new event"""
    try:
        # Add NGO ID and creation timestamp
        event_data = {
            **data,
            'ngo_id': ngo_id,
            'created_at': datetime.now(),
            'status': 'active'
        }
        
        # Create event document
        doc_ref = db.collection('events').document()
        doc_ref.set(event_data)
        
        return {
            'message': 'Event created successfully',
            'event_id': doc_ref.id
        }, 201
        
    except Exception as e:
        print(f"Error creating event: {str(e)}")
        return {'error': 'Internal server error'}, 500

def get_event(event_id):
    """Get event by ID"""
    try:
        event = Event.find_by_id(event_id)
        if not event:
            return jsonify({'error': 'Event not found'}), 404
            
        return jsonify(event.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_event(event_id, data, ngo_id):
    """Update an existing event"""
    try:
        # Get event document
        event_doc = db.collection('events').document(event_id).get()
        if not event_doc.exists:
            return {'error': 'Event not found'}, 404
        
        event_data = event_doc.to_dict()
        
        # Check if NGO owns the event
        if event_data.get('ngo_id') != ngo_id:
            return {'error': 'Unauthorized'}, 403
        
        # Update event
        event_data.update(data)
        event_data['updated_at'] = datetime.now()
        
        db.collection('events').document(event_id).update(event_data)
        
        return {'message': 'Event updated successfully'}, 200
        
    except Exception as e:
        print(f"Error updating event: {str(e)}")
        return {'error': 'Internal server error'}, 500

def delete_event(event_id, ngo_id):
    """Delete an event"""
    try:
        # Get event document
        event_doc = db.collection('events').document(event_id).get()
        if not event_doc.exists:
            return {'error': 'Event not found'}, 404
        
        event_data = event_doc.to_dict()
        
        # Check if NGO owns the event
        if event_data.get('ngo_id') != ngo_id:
            return {'error': 'Unauthorized'}, 403
        
        # Delete event
        db.collection('events').document(event_id).delete()
        
        return {'message': 'Event deleted successfully'}, 200
        
    except Exception as e:
        print(f"Error deleting event: {str(e)}")
        return {'error': 'Internal server error'}, 500

def get_ngo_events(ngo_id):
    """Get all events for an NGO"""
    try:
        # Get events
        events_ref = db.collection('events')
        events = events_ref.where('ngo_id', '==', ngo_id).get()
        
        # Format events
        event_list = []
        for doc in events:
            event = doc.to_dict()
            event['id'] = doc.id
            event_list.append(event)
        
        # Sort by date
        event_list.sort(key=lambda x: x.get('date', ''))
        
        return {'events': event_list}, 200
        
    except Exception as e:
        print(f"Error getting NGO events: {str(e)}")
        return {'error': 'Internal server error'}, 500

def get_event_volunteers(event_id, ngo_id):
    """Get all volunteers registered for an event"""
    try:
        # Get event document
        event_doc = db.collection('events').document(event_id).get()
        if not event_doc.exists:
            return {'error': 'Event not found'}, 404
        
        event_data = event_doc.to_dict()
        
        # Check if NGO owns the event
        if event_data.get('ngo_id') != ngo_id:
            return {'error': 'Unauthorized'}, 403
        
        # Get registrations
        registrations_ref = db.collection('registrations')
        registrations = registrations_ref.where('event_id', '==', event_id).get()
        
        # Get volunteer details
        volunteers = []
        for doc in registrations:
            reg_data = doc.to_dict()
            user_doc = db.collection('users').document(reg_data['user_id']).get()
            if user_doc.exists:
                user_data = user_doc.to_dict()
                volunteer = {
                    'id': user_doc.id,
                    'name': user_data.get('name', ''),
                    'email': user_data.get('email', ''),
                    'registration_date': reg_data.get('registration_date', ''),
                    'status': reg_data.get('status', 'registered')
                }
                volunteers.append(volunteer)
        
        # Sort by registration date
        volunteers.sort(key=lambda x: x.get('registration_date', ''))
        
        return {'volunteers': volunteers}, 200
        
    except Exception as e:
        print(f"Error getting event volunteers: {str(e)}")
        return {'error': 'Internal server error'}, 500

def get_upcoming_events():
    """Get upcoming events"""
    try:
        events = Event.find_upcoming()
        return jsonify([event.to_dict() for event in events]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_suggested_events(user_id, limit=10):
    """Get suggested events for a user based on their interests and skills"""
    try:
        # Get user profile
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return {'error': 'User not found'}, 404
        
        user_data = user_doc.to_dict()
        user_interests = user_data.get('interests', [])
        user_skills = user_data.get('skills', [])
        
        # Get all upcoming events
        events_ref = db.collection('events')
        now = datetime.now()
        events = events_ref.where('date', '>=', now).get()
        
        # Calculate scores for each event
        scored_events = []
        for event in events:
            event_data = event.to_dict()
            event_data['id'] = event.id
            
            # Calculate match score
            score = calculate_event_match_score(event_data, user_interests, user_skills)
            scored_events.append((score, event_data))
        
        # Sort by score and get top events
        scored_events.sort(reverse=True, key=lambda x: x[0])
        top_events = [event for score, event in scored_events[:limit]]
        
        return {'events': top_events}, 200
        
    except Exception as e:
        print(f"Error getting suggested events: {str(e)}")
        return {'error': 'Internal server error'}, 500

def calculate_event_match_score(event, user_interests, user_skills):
    """Calculate how well an event matches a user's interests and skills"""
    score = 0
    
    # Match interests
    event_interests = event.get('interests', [])
    for interest in user_interests:
        if interest in event_interests:
            score += 1
    
    # Match skills
    event_skills = event.get('required_skills', [])
    for skill in user_skills:
        if skill in event_skills:
            score += 1
    
    # Consider location preference if available
    if 'location' in event and event['location'].lower() == user_interests.get('preferred_location', '').lower():
        score += 0.5
    
    # Consider time preference if available
    event_time = event.get('time', '')
    preferred_time = user_interests.get('preferred_time', '')
    if event_time and preferred_time and event_time.lower() == preferred_time.lower():
        score += 0.5
    
    return score 