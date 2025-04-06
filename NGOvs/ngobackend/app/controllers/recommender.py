from utils.firebase import db
from app.models.event import Event
from app.models.user import User
from app.models.attendance import Attendance
import numpy as np
from datetime import datetime

def get_suggested_events(user_id):
    """Get suggested events for a volunteer based on their profile and history"""
    try:
        # Get user profile
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
            
        # Get user's interests and skills
        user_interests = user.interests
        user_skills = user.skills
        
        # Get user's past events
        past_events = Attendance.find_by_volunteer(user_id)
        past_event_ids = [event.event_id for event in past_events]
        
        # Get all upcoming events
        upcoming_events = Event.find_upcoming()
        
        # Filter out events the user has already registered for
        available_events = [event for event in upcoming_events if event.id not in past_event_ids]
        
        # Calculate similarity scores
        scored_events = []
        for event in available_events:
            score = calculate_similarity_score(event, user_interests, user_skills)
            scored_events.append({
                'event': event.to_dict(),
                'score': score
            })
        
        # Sort by score (highest first)
        scored_events.sort(key=lambda x: x['score'], reverse=True)
        
        # Return top 10 events
        return [item['event'] for item in scored_events[:10]], 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def calculate_similarity_score(event, user_interests, user_skills):
    """Calculate similarity score between event and user profile"""
    score = 0
    
    # Match interests
    if event.tags:
        for tag in event.tags:
            if tag in user_interests:
                score += 2
    
    # Match skills
    if event.required_skills:
        for skill in event.required_skills:
            if skill in user_skills:
                score += 3
    
    # Location preference (if available)
    if event.location and hasattr(event, 'city'):
        if event.city == user.city:
            score += 1
    
    # Time preference (if available)
    if event.start_date:
        event_hour = datetime.fromisoformat(event.start_date).hour
        if 9 <= event_hour <= 17:  # Prefer daytime events
            score += 1
    
    return score

def get_event_recommendations(user_id, limit=10):
    """Get personalized event recommendations for a user"""
    try:
        # Get user profile
        user = User.find_by_id(user_id)
        if not user:
            return {'error': 'User not found'}, 404
        
        # Get all upcoming events
        upcoming_events = Event.find_upcoming()
        
        # Calculate recommendations
        recommendations = []
        for event in upcoming_events:
            # Skip events the user has already registered for
            if Attendance.find_by_event_and_volunteer(event.id, user_id):
                continue
                
            # Calculate recommendation score
            score = calculate_recommendation_score(event, user)
            
            if score > 0:
                recommendations.append({
                    'event': event.to_dict(),
                    'score': score
                })
        
        # Sort by score and limit results
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return [item['event'] for item in recommendations[:limit]], 200
        
    except Exception as e:
        return {'error': str(e)}, 500

def calculate_recommendation_score(event, user):
    """Calculate recommendation score based on user preferences and event attributes"""
    score = 0
    
    # Interest matching
    if event.tags and user.interests:
        matching_interests = set(event.tags) & set(user.interests)
        score += len(matching_interests) * 2
    
    # Skill matching
    if event.required_skills and user.skills:
        matching_skills = set(event.required_skills) & set(user.skills)
        score += len(matching_skills) * 3
    
    # Location preference
    if event.location and hasattr(user, 'city') and user.city:
        if event.city == user.city:
            score += 5
    
    # Time preference
    if event.start_date and hasattr(user, 'availability'):
        event_date = datetime.fromisoformat(event.start_date)
        event_day = event_date.strftime('%A').lower()
        
        if event_day in user.availability:
            score += 3
    
    return score 