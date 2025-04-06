from utils.firebase import db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.event import Event
from datetime import datetime
import uuid

def check_and_award_badges(user_id):
    """Check and award badges based on user's achievements"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Get user's attendance records
        attendances = Attendance.find_by_user(user_id)
        
        # Calculate total hours
        total_hours = sum(att.hours_worked or 0 for att in attendances)
        
        # Get unique events attended
        unique_events = len(set(att.event_id for att in attendances))
        
        # Get user's current badges
        current_badges = user.badges or []
        
        new_badges = []
        
        # Hours-based badges
        if total_hours >= 100 and not any(b['type'] == 'hours_100' for b in current_badges):
            new_badges.append({
                'id': str(uuid.uuid4()),
                'type': 'hours_100',
                'name': 'Century Volunteer',
                'description': 'Completed 100 hours of volunteering',
                'awarded_at': datetime.now().isoformat()
            })
            
        if total_hours >= 50 and not any(b['type'] == 'hours_50' for b in current_badges):
            new_badges.append({
                'id': str(uuid.uuid4()),
                'type': 'hours_50',
                'name': 'Half Century Volunteer',
                'description': 'Completed 50 hours of volunteering',
                'awarded_at': datetime.now().isoformat()
            })
            
        # Events-based badges
        if unique_events >= 10 and not any(b['type'] == 'events_10' for b in current_badges):
            new_badges.append({
                'id': str(uuid.uuid4()),
                'type': 'events_10',
                'name': 'Event Explorer',
                'description': 'Participated in 10 different events',
                'awarded_at': datetime.now().isoformat()
            })
            
        if unique_events >= 5 and not any(b['type'] == 'events_5' for b in current_badges):
            new_badges.append({
                'id': str(uuid.uuid4()),
                'type': 'events_5',
                'name': 'Event Enthusiast',
                'description': 'Participated in 5 different events',
                'awarded_at': datetime.now().isoformat()
            })
            
        # Consistency badge
        if len(attendances) >= 3 and not any(b['type'] == 'consistency' for b in current_badges):
            # Check if attended events in last 3 months
            recent_events = [att for att in attendances if 
                           (datetime.now() - datetime.fromisoformat(att.created_at)).days <= 90]
            if len(recent_events) >= 3:
                new_badges.append({
                    'id': str(uuid.uuid4()),
                    'type': 'consistency',
                    'name': 'Consistent Contributor',
                    'description': 'Attended 3 events in the last 3 months',
                    'awarded_at': datetime.now().isoformat()
                })
        
        if new_badges:
            # Update user's badges
            user.badges = current_badges + new_badges
            user.save()
            
            # Save badge records in Firestore
            for badge in new_badges:
                db.collection('badges').document(badge['id']).set(badge)
        
        return {
            'new_badges': new_badges,
            'total_badges': len(current_badges) + len(new_badges),
            'total_hours': total_hours,
            'unique_events': unique_events
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def get_user_badges(user_id):
    """Get all badges for a user"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        return {
            'badges': user.badges or [],
            'total_badges': len(user.badges or []),
            'user_name': user.name
        }, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def get_badge_progress(user_id):
    """Get progress towards next badges"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Get user's attendance records
        attendances = Attendance.find_by_user(user_id)
        
        # Calculate metrics
        total_hours = sum(att.hours_worked or 0 for att in attendances)
        unique_events = len(set(att.event_id for att in attendances))
        
        # Get recent events for consistency
        recent_events = [att for att in attendances if 
                        (datetime.now() - datetime.fromisoformat(att.created_at)).days <= 90]
        
        # Calculate progress
        progress = {
            'hours': {
                'current': total_hours,
                'next_badge': {
                    'type': 'hours_50' if total_hours < 50 else 'hours_100',
                    'name': 'Half Century Volunteer' if total_hours < 50 else 'Century Volunteer',
                    'target': 50 if total_hours < 50 else 100,
                    'progress': (total_hours / 50) * 100 if total_hours < 50 else (total_hours / 100) * 100
                }
            },
            'events': {
                'current': unique_events,
                'next_badge': {
                    'type': 'events_5' if unique_events < 5 else 'events_10',
                    'name': 'Event Enthusiast' if unique_events < 5 else 'Event Explorer',
                    'target': 5 if unique_events < 5 else 10,
                    'progress': (unique_events / 5) * 100 if unique_events < 5 else (unique_events / 10) * 100
                }
            },
            'consistency': {
                'current': len(recent_events),
                'next_badge': {
                    'type': 'consistency',
                    'name': 'Consistent Contributor',
                    'target': 3,
                    'progress': (len(recent_events) / 3) * 100
                }
            }
        }
        
        return {'progress': progress}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def get_volunteer_badges(user_id):
    """Get badges earned by a volunteer"""
    try:
        # Get user's badges
        badges_ref = db.collection('badges')
        badges_docs = badges_ref.where('user_id', '==', user_id).get()
        
        # Format badge records
        badges = []
        for doc in badges_docs:
            badge = doc.to_dict()
            badge['id'] = doc.id
            badges.append(badge)
        
        # Sort by date earned
        badges.sort(key=lambda x: x.get('date_earned', ''), reverse=True)
        
        return {'badges': badges}, 200
        
    except Exception as e:
        print(f"Error getting volunteer badges: {str(e)}")
        return {'error': 'Internal server error'}, 500

def award_badge(user_id, badge_type, event_id=None):
    """Award a badge to a volunteer"""
    try:
        # Check if user exists
        user_doc = db.collection('users').document(user_id).get()
        if not user_doc.exists:
            return {'error': 'User not found'}, 404
        
        # Check if badge already exists
        badges_ref = db.collection('badges')
        existing = badges_ref.where('user_id', '==', user_id).where('type', '==', badge_type).get()
        if len(list(existing)) > 0:
            return {'error': 'Badge already awarded'}, 400
        
        # Create badge
        badge_data = {
            'user_id': user_id,
            'type': badge_type,
            'date_earned': datetime.now(),
            'event_id': event_id
        }
        
        # Add badge-specific data
        if badge_type == 'first_event':
            badge_data['title'] = 'First Event'
            badge_data['description'] = 'Completed your first volunteer event'
        elif badge_type == 'super_volunteer':
            badge_data['title'] = 'Super Volunteer'
            badge_data['description'] = 'Completed 10 volunteer events'
        elif badge_type == 'skill_master':
            badge_data['title'] = 'Skill Master'
            badge_data['description'] = 'Mastered a required skill'
        else:
            badge_data['title'] = badge_type.replace('_', ' ').title()
            badge_data['description'] = f'Awarded for {badge_type.replace("_", " ")}'
        
        doc_ref = badges_ref.document()
        doc_ref.set(badge_data)
        
        return {
            'message': 'Badge awarded successfully',
            'badge_id': doc_ref.id
        }, 200
        
    except Exception as e:
        print(f"Error awarding badge: {str(e)}")
        return {'error': 'Internal server error'}, 500 