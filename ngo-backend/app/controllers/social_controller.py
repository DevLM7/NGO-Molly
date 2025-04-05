from utils.firebase import db
from app.models.event import Event
from app.models.user import User
from app.models.attendance import Attendance
from app.models.feedback import Feedback
from datetime import datetime, timedelta
import uuid

def get_social_feed(user_id, limit=20):
    """Get social feed for a user"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Get user's interests and skills
        user_interests = user.interests or []
        user_skills = user.skills or []
        
        # Get events the user has attended
        user_events = Attendance.find_by_user(user_id)
        user_event_ids = [att.event_id for att in user_events]
        
        # Get recent events (last 30 days)
        recent_events = Event.find_recent(days=30)
        
        # Get feedback for these events
        event_feedbacks = {}
        for event in recent_events:
            feedbacks = Feedback.find_by_event(event.id)
            if feedbacks:
                event_feedbacks[event.id] = feedbacks
        
        # Create feed items
        feed_items = []
        
        # Add event completion items
        for attendance in user_events:
            if attendance.hours_worked and attendance.hours_worked > 0:
                event = Event.find_by_id(attendance.event_id)
                if event:
                    feed_items.append({
                        'id': str(uuid.uuid4()),
                        'type': 'event_completion',
                        'user_id': user_id,
                        'user_name': user.name,
                        'event_id': event.id,
                        'event_name': event.title,
                        'hours_worked': attendance.hours_worked,
                        'timestamp': attendance.updated_at or attendance.created_at,
                        'content': f"{user.name} completed {attendance.hours_worked} hours at {event.title}"
                    })
        
        # Add badge earning items
        if user.badges:
            for badge in user.badges:
                feed_items.append({
                    'id': str(uuid.uuid4()),
                    'type': 'badge_earned',
                    'user_id': user_id,
                    'user_name': user.name,
                    'badge_id': badge.get('id'),
                    'badge_name': badge.get('name'),
                    'badge_description': badge.get('description'),
                    'timestamp': badge.get('awarded_at'),
                    'content': f"{user.name} earned the {badge.get('name')} badge!"
                })
        
        # Add event feedback items
        for event_id, feedbacks in event_feedbacks.items():
            for feedback in feedbacks:
                if feedback.user_id != user_id:  # Don't show user's own feedback
                    feedback_user = User.find_by_id(feedback.user_id)
                    if feedback_user:
                        feed_items.append({
                            'id': str(uuid.uuid4()),
                            'type': 'event_feedback',
                            'user_id': feedback.user_id,
                            'user_name': feedback_user.name,
                            'event_id': event_id,
                            'event_name': Event.find_by_id(event_id).title if Event.find_by_id(event_id) else "Unknown Event",
                            'rating': feedback.rating,
                            'comment': feedback.comment,
                            'timestamp': feedback.created_at,
                            'content': f"{feedback_user.name} rated {feedback.rating} stars for {Event.find_by_id(event_id).title if Event.find_by_id(event_id) else 'an event'}"
                        })
        
        # Add recommended events based on interests
        for event in recent_events:
            if event.id not in user_event_ids:
                # Check if event matches user interests
                if event.tags and any(tag in user_interests for tag in event.tags):
                    feed_items.append({
                        'id': str(uuid.uuid4()),
                        'type': 'event_recommendation',
                        'event_id': event.id,
                        'event_name': event.title,
                        'event_description': event.description,
                        'event_date': event.start_date,
                        'event_location': event.location,
                        'timestamp': event.created_at,
                        'content': f"Recommended for you: {event.title} - matches your interests"
                    })
        
        # Sort feed items by timestamp (newest first)
        feed_items.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Limit the number of items
        return {'feed_items': feed_items[:limit]}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def create_social_post(user_id, data):
    """Create a social post"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Validate required fields
        if 'content' not in data:
            return {'error': 'Content is required'}, 400
            
        # Create post
        post_id = str(uuid.uuid4())
        post = {
            'id': post_id,
            'user_id': user_id,
            'user_name': user.name,
            'content': data['content'],
            'media_url': data.get('media_url'),
            'event_id': data.get('event_id'),
            'likes': 0,
            'comments': [],
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Save to Firestore
        db.collection('social_posts').document(post_id).set(post)
        
        return {'post': post}, 201
        
    except Exception as e:
        return {'error': str(e)}, 500

def get_user_posts(user_id, limit=10):
    """Get posts by a user"""
    try:
        # Get posts from Firestore
        posts_ref = db.collection('social_posts').where('user_id', '==', user_id).order_by('created_at', direction='DESCENDING').limit(limit).get()
        
        posts = []
        for doc in posts_ref:
            post = doc.to_dict()
            posts.append(post)
            
        return {'posts': posts}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def like_post(post_id, user_id):
    """Like a post"""
    try:
        # Get post from Firestore
        post_ref = db.collection('social_posts').document(post_id)
        post = post_ref.get()
        
        if not post.exists:
            return {'error': 'Post not found'}, 404
            
        # Update likes count
        post_ref.update({
            'likes': post.to_dict().get('likes', 0) + 1
        })
        
        # Add to user's liked posts
        db.collection('users').document(user_id).update({
            'liked_posts': db.FieldValue.array_union([post_id])
        })
        
        return {'message': 'Post liked successfully'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def comment_on_post(post_id, user_id, comment):
    """Add a comment to a post"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Create comment
        comment_id = str(uuid.uuid4())
        comment_data = {
            'id': comment_id,
            'user_id': user_id,
            'user_name': user.name,
            'content': comment,
            'created_at': datetime.now().isoformat()
        }
        
        # Add comment to post
        db.collection('social_posts').document(post_id).update({
            'comments': db.FieldValue.array_union([comment_data])
        })
        
        return {'comment': comment_data}, 201
        
    except Exception as e:
        return {'error': str(e)}, 500 