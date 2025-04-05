from utils.firebase import db
from app.models.user import User
from app.models.event import Event
from app.models.attendance import Attendance
from app.models.badge import Badge
from datetime import datetime
import uuid

def create_notification(user_id, title, message, type, data=None):
    """Create a notification for a user"""
    try:
        # Generate notification ID
        notification_id = str(uuid.uuid4())
        
        # Create notification
        notification = {
            'id': notification_id,
            'user_id': user_id,
            'title': title,
            'message': message,
            'type': type,
            'data': data or {},
            'read': False,
            'created_at': datetime.now().isoformat()
        }
        
        # Save to Firestore
        db.collection('notifications').document(notification_id).set(notification)
        
        # Update user's unread notification count
        db.collection('users').document(user_id).update({
            'unread_notifications': db.FieldValue.increment(1)
        })
        
        return {'notification_id': notification_id}, 201
        
    except Exception as e:
        return {'error': str(e)}, 500

def get_user_notifications(user_id, limit=20, unread_only=False):
    """Get notifications for a user"""
    try:
        # Build query
        query = db.collection('notifications').where('user_id', '==', user_id)
        
        # Filter for unread only if requested
        if unread_only:
            query = query.where('read', '==', False)
            
        # Order by creation date (newest first) and limit
        query = query.order_by('created_at', direction='DESCENDING').limit(limit)
        
        # Execute query
        notifications_ref = query.get()
        
        # Convert to list
        notifications = []
        for doc in notifications_ref:
            notifications.append(doc.to_dict())
            
        return {'notifications': notifications}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def mark_notification_read(notification_id, user_id):
    """Mark a notification as read"""
    try:
        # Get notification
        notification_ref = db.collection('notifications').document(notification_id)
        notification = notification_ref.get()
        
        if not notification.exists:
            return {'error': 'Notification not found'}, 404
            
        # Check if notification belongs to user
        if notification.to_dict().get('user_id') != user_id:
            return {'error': 'Unauthorized'}, 403
            
        # Update notification
        notification_ref.update({
            'read': True
        })
        
        # Update user's unread notification count
        db.collection('users').document(user_id).update({
            'unread_notifications': db.FieldValue.increment(-1)
        })
        
        return {'message': 'Notification marked as read'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def mark_all_notifications_read(user_id):
    """Mark all notifications as read for a user"""
    try:
        # Get all unread notifications
        notifications_ref = db.collection('notifications').where('user_id', '==', user_id).where('read', '==', False).get()
        
        # Count unread notifications
        unread_count = 0
        
        # Update each notification
        for doc in notifications_ref:
            doc.reference.update({
                'read': True
            })
            unread_count += 1
            
        # Reset user's unread notification count
        db.collection('users').document(user_id).update({
            'unread_notifications': 0
        })
        
        return {'message': f'{unread_count} notifications marked as read'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def delete_notification(notification_id, user_id):
    """Delete a notification"""
    try:
        # Get notification
        notification_ref = db.collection('notifications').document(notification_id)
        notification = notification_ref.get()
        
        if not notification.exists:
            return {'error': 'Notification not found'}, 404
            
        # Check if notification belongs to user
        if notification.to_dict().get('user_id') != user_id:
            return {'error': 'Unauthorized'}, 403
            
        # Check if notification is unread
        if not notification.to_dict().get('read', True):
            # Update user's unread notification count
            db.collection('users').document(user_id).update({
                'unread_notifications': db.FieldValue.increment(-1)
            })
            
        # Delete notification
        notification_ref.delete()
        
        return {'message': 'Notification deleted'}, 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def create_event_notification(event_id, title, message, exclude_users=None):
    """Create notifications for all users registered for an event"""
    try:
        # Get event
        event = Event.find_by_id(event_id)
        if not event:
            return {'error': 'Event not found'}, 404
            
        # Get registered users
        attendances = Attendance.find_by_event(event_id)
        user_ids = [att.user_id for att in attendances]
        
        # Exclude specified users
        if exclude_users:
            user_ids = [uid for uid in user_ids if uid not in exclude_users]
            
        # Create notifications
        notification_ids = []
        for user_id in user_ids:
            result, _ = create_notification(
                user_id=user_id,
                title=title,
                message=message,
                type='event',
                data={'event_id': event_id}
            )
            if 'notification_id' in result:
                notification_ids.append(result['notification_id'])
                
        return {
            'message': f'Notifications created for {len(notification_ids)} users',
            'notification_ids': notification_ids
        }, 201
        
    except Exception as e:
        return {'error': str(e)}, 500

def create_badge_notification(user_id, badge):
    """Create a notification for earning a badge"""
    try:
        # Get user
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Create notification
        result, status_code = create_notification(
            user_id=user_id,
            title='New Badge Earned!',
            message=f'Congratulations! You earned the {badge.get("name")} badge.',
            type='badge',
            data={'badge_id': badge.get('id')}
        )
        
        return result, status_code
        
    except Exception as e:
        return {'error': str(e)}, 500 