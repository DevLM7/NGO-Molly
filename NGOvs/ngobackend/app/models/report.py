from app.models.base import BaseModel
from datetime import datetime

class Report(BaseModel):
    collection_name = 'reports'

    def __init__(self, id=None, user_id=None, event_id=None, type=None, 
                 title=None, description=None, status=None, priority=None, 
                 assigned_to=None, resolution=None, metadata=None, 
                 created_at=None, updated_at=None):
        super().__init__(id, created_at, updated_at)
        self.user_id = user_id
        self.event_id = event_id
        self.type = type or 'issue'
        self.title = title
        self.description = description
        self.status = status or 'open'
        self.priority = priority or 'medium'
        self.assigned_to = assigned_to
        self.resolution = resolution
        self.metadata = metadata or {}

    @classmethod
    def find_by_event(cls, event_id):
        """Find reports by event ID"""
        return cls.find({'event_id': event_id})

    @classmethod
    def find_by_user(cls, user_id):
        """Find reports by user ID"""
        return cls.find({'user_id': user_id})

    @classmethod
    def find_by_assigned(cls, user_id):
        """Find reports assigned to user"""
        return cls.find({'assigned_to': user_id})

    @classmethod
    def update_report_status(cls, report_id, status):
        """Update report status"""
        report = cls.find_by_id(report_id)
        if not report:
            return None
            
        report.status = status
        report.save()
        return report

    @classmethod
    def assign_report(cls, report_id, user_id):
        """Assign report to a user"""
        report = cls.find_by_id(report_id)
        if not report:
            return None
            
        report.assigned_to = user_id
        report.save()
        return report

    @classmethod
    def get_report_stats(cls, ngo_id):
        """Get report statistics for an NGO"""
        reports = cls.find({'event_id': ngo_id})
        
        stats = {
            'total': len(reports),
            'by_status': {},
            'by_priority': {},
            'by_type': {}
        }
        
        for report in reports:
            # Count by status
            stats['by_status'][report.status] = stats['by_status'].get(report.status, 0) + 1
            
            # Count by priority
            stats['by_priority'][report.priority] = stats['by_priority'].get(report.priority, 0) + 1
            
            # Count by type
            stats['by_type'][report.type] = stats['by_type'].get(report.type, 0) + 1
        
        return stats

    def to_dict(self):
        """Convert report to dictionary"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'type': self.type,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'assigned_to': self.assigned_to,
            'resolution': self.resolution,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 