from flask import jsonify
from app.models.report import Report
from app.models.event import Event
from datetime import datetime

def create_report(data, user_id):
    """Create a new report"""
    try:
        # Validate required fields
        required_fields = ['event_id', 'title', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        # Verify event exists
        event = Event.find_by_id(data['event_id'])
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        # Create report
        report = Report(
            user_id=user_id,
            event_id=data['event_id'],
            title=data['title'],
            description=data['description'],
            type=data.get('type', 'issue'),
            priority=data.get('priority', 'medium'),
            metadata=data.get('metadata', {})
        )
        report.save()
        
        return jsonify(report.to_dict()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_report(report_id):
    """Get report by ID"""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_report(report_id, data, user_id):
    """Update report"""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        # Check if user owns the report or is assigned to it
        if report.user_id != user_id and report.assigned_to != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Update report fields
        if 'title' in data:
            report.title = data['title']
        if 'description' in data:
            report.description = data['description']
        if 'type' in data:
            report.type = data['type']
        if 'priority' in data:
            report.priority = data['priority']
        if 'status' in data:
            report.status = data['status']
        if 'resolution' in data:
            report.resolution = data['resolution']
        if 'metadata' in data:
            report.metadata = data['metadata']
        
        report.save()
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def delete_report(report_id, user_id):
    """Delete report"""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        # Check if user owns the report
        if report.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        report.delete()
        return jsonify({'message': 'Report deleted successfully'}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_event_reports(event_id):
    """Get reports for an event"""
    try:
        report_list = Report.find({'event_id': event_id})
        return jsonify([report.to_dict() for report in report_list]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_user_reports(user_id):
    """Get reports by user"""
    try:
        report_list = Report.find({'user_id': user_id})
        return jsonify([report.to_dict() for report in report_list]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_assigned_reports(user_id):
    """Get reports assigned to user"""
    try:
        report_list = Report.find({'assigned_to': user_id})
        return jsonify([report.to_dict() for report in report_list]), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def update_report_status(report_id, status, user_id):
    """Update report status"""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        # Check if user is assigned to the report
        if report.assigned_to != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        report = Report.update_report_status(report_id, status)
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def assign_report(report_id, assignee_id, user_id):
    """Assign report to a user"""
    try:
        report = Report.find_by_id(report_id)
        if not report:
            return jsonify({'error': 'Report not found'}), 404
            
        # Check if user owns the report
        if report.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        report = Report.assign_report(report_id, assignee_id)
        return jsonify(report.to_dict()), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_report_stats(ngo_id):
    """Get report statistics for an NGO"""
    try:
        stats = Report.get_report_stats(ngo_id)
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500 