from app.models.base import BaseModel
from datetime import datetime

class Attendance(BaseModel):
    collection_name = 'attendance'

    def __init__(self, id=None, event_id=None, volunteer_id=None, 
                 check_in=None, check_out=None, status=None, 
                 hours_worked=None, notes=None, created_at=None, updated_at=None):
        super().__init__(id, created_at, updated_at)
        self.event_id = event_id
        self.volunteer_id = volunteer_id
        self.check_in = check_in
        self.check_out = check_out
        self.status = status or 'present'
        self.hours_worked = hours_worked
        self.notes = notes

    @classmethod
    def find_by_event(cls, event_id):
        """Find attendance records by event ID"""
        return cls.find({'event_id': event_id})

    @classmethod
    def find_by_volunteer(cls, volunteer_id):
        """Find attendance records by volunteer ID"""
        return cls.find({'volunteer_id': volunteer_id})

    @classmethod
    def find_by_date_range(cls, start_date, end_date):
        """Find attendance records within a date range"""
        return cls.find({
            'check_in': {'>=': start_date},
            'check_in': {'<=': end_date}
        })

    def calculate_hours_worked(self):
        """Calculate hours worked if check-in and check-out times are available"""
        if self.check_in and self.check_out:
            duration = self.check_out - self.check_in
            self.hours_worked = duration.total_seconds() / 3600
            return self.hours_worked
        return None

    def save(self):
        """Save or update attendance record"""
        attendance_data = {
            'event_id': self.event_id,
            'volunteer_id': self.volunteer_id,
            'check_in': self.check_in,
            'check_out': self.check_out,
            'status': self.status,
            'hours_worked': self.hours_worked,
            'notes': self.notes,
            'updated_at': datetime.now()
        }
        
        if not self.id:
            # Create new attendance record
            attendance_data['created_at'] = datetime.now()
            attendance_ref = db.collection('attendance').document()
            self.id = attendance_ref.id
        else:
            # Update existing attendance record
            attendance_ref = db.collection('attendance').document(self.id)
            
        attendance_ref.set(attendance_data, merge=True)
        return self

    def delete(self):
        """Delete attendance record"""
        if not self.id:
            raise ValueError("Attendance ID is required for deletion")
            
        db.collection('attendance').document(self.id).delete()
        return True

    def to_dict(self):
        """Convert attendance to dictionary"""
        return {
            'id': self.id,
            'event_id': self.event_id,
            'volunteer_id': self.volunteer_id,
            'check_in': self.check_in.isoformat() if self.check_in else None,
            'check_out': self.check_out.isoformat() if self.check_out else None,
            'status': self.status,
            'hours_worked': self.hours_worked,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        } 