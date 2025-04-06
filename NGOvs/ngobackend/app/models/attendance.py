from ngobackend.app.models.base import BaseModel
from datetime import datetime
from ngobackend.app.config.firebase import db

class Attendance(BaseModel):
    collection_name = 'attendance'

    def __init__(self, id=None, event_id=None, volunteer_id=None, 
                 check_in=None, check_out=None, status=None, 
                 hours_worked=None, notes=None, created_at=None, updated_at=None, verification_method=None):
        super().__init__(id, created_at, updated_at)
        self.event_id = event_id
        self.volunteer_id = volunteer_id
        self.check_in = check_in
        self.check_out = check_out
        self.status = status or 'present'
        self.hours_worked = hours_worked
        self.notes = notes
        self.verification_method = verification_method

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
        try:
            if not hasattr(self, '_mock_data'):
                self._mock_data = {}
                
            attendance_data = {
                'id': self.id,
                'event_id': self.event_id,
                'volunteer_id': self.volunteer_id,
                'check_in': self.check_in,
                'check_out': self.check_out,
                'status': self.status,
                'hours_worked': self.hours_worked,
                'notes': self.notes,
                'verification_method': self.verification_method,
                'updated_at': datetime.now().isoformat()
            }
            
            if not self.id:
                attendance_data['created_at'] = datetime.now().isoformat()
                self.id = f'attendance_{len(self._mock_data)}'
                
            self._mock_data[self.id] = attendance_data
            return True
        except Exception as e:
            print(f"Error saving attendance: {str(e)}")
            return False

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
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'verification_method': self.verification_method
        }

    @staticmethod
    def find_by_event_and_volunteer(event_id, volunteer_id):
        try:
            docs = db.collection('attendance').where('event_id', '==', event_id).where('volunteer_id', '==', volunteer_id).get()
            if docs:
                doc = docs[0]
                data = doc.to_dict()
                return Attendance(
                    id=doc.id,
                    event_id=data.get('event_id'),
                    volunteer_id=data.get('volunteer_id'),
                    status=data.get('status'),
                    verification_method=data.get('verification_method')
                )
            return None
        except Exception as e:
            print(f"Error finding attendance: {str(e)}")
            return None

    @staticmethod
    def find_by_event(event_id):
        try:
            docs = db.collection('attendance').where('event_id', '==', event_id).get()
            attendances = []
            for doc in docs:
                data = doc.to_dict()
                attendances.append(Attendance(
                    id=doc.id,
                    event_id=data.get('event_id'),
                    volunteer_id=data.get('volunteer_id'),
                    status=data.get('status'),
                    verification_method=data.get('verification_method')
                ))
            return attendances
        except Exception as e:
            print(f"Error finding attendances by event: {str(e)}")
            return []

    @staticmethod
    def find_by_volunteer(volunteer_id):
        try:
            docs = db.collection('attendance').where('volunteer_id', '==', volunteer_id).get()
            attendances = []
            for doc in docs:
                data = doc.to_dict()
                attendances.append(Attendance(
                    id=doc.id,
                    event_id=data.get('event_id'),
                    volunteer_id=data.get('volunteer_id'),
                    status=data.get('status'),
                    verification_method=data.get('verification_method')
                ))
            return attendances
        except Exception as e:
            print(f"Error finding attendances by volunteer: {str(e)}")
            return [] 