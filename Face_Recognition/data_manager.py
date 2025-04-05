import json
import os
import base64
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import numpy as np
from face_utils import encode_to_bytes, bytes_to_encoding
import shutil

class DataManager:
    def __init__(self):
        self.data_dir = "data"
        self.volunteers_dir = os.path.join(self.data_dir, "volunteers")
        self.faces_dir = os.path.join(self.volunteers_dir, "faces")
        self.events_dir = os.path.join(self.data_dir, "events")
        self.volunteers_file = os.path.join(self.volunteers_dir, "volunteers.json")
        self.attendance_file = os.path.join(self.events_dir, "attendance.json")
        
        # Create directories if they don't exist
        os.makedirs(self.faces_dir, exist_ok=True)
        os.makedirs(self.events_dir, exist_ok=True)
        
        # Initialize JSON files if they don't exist
        self._init_json_files()
    
    def _init_json_files(self):
        """Initialize JSON files with empty data structures if they don't exist"""
        if not os.path.exists(self.volunteers_file):
            os.makedirs(os.path.dirname(self.volunteers_file), exist_ok=True)
            with open(self.volunteers_file, 'w') as f:
                json.dump({"volunteers": {}}, f)
        
        if not os.path.exists(self.attendance_file):
            with open(self.attendance_file, 'w') as f:
                json.dump({"events": {}}, f)
    
    def register_volunteer(self, volunteer_id: str, name: str, email: str, face_encoding: np.ndarray, image_data: bytes) -> bool:
        """Register a new volunteer with their face encoding and photo"""
        try:
            # Load existing volunteers
            with open(self.volunteers_file, 'r') as f:
                data = json.load(f)
            
            # Check if volunteer already exists
            if volunteer_id in data["volunteers"]:
                return False
            
            # Save face image
            image_path = os.path.join(self.faces_dir, f"{volunteer_id}.jpg")
            with open(image_path, 'wb') as f:
                f.write(image_data)
            
            # Add volunteer data with proper base64 padding
            encoding_bytes = face_encoding.tobytes()
            encoding_base64 = base64.b64encode(encoding_bytes).decode('utf-8')
            
            data["volunteers"][volunteer_id] = {
                "name": name,
                "email": email,
                "face_encoding": encoding_base64,
                "image_path": image_path,
                "created_at": datetime.utcnow().isoformat()
            }
            
            # Save updated data
            with open(self.volunteers_file, 'w') as f:
                json.dump(data, f, indent=4)
            
            return True
        
        except Exception as e:
            print(f"Error registering volunteer: {str(e)}")
            # Clean up any partially created files
            if 'image_path' in locals() and os.path.exists(image_path):
                os.remove(image_path)
            return False
    
    def get_volunteer(self, volunteer_id: str) -> Optional[Dict]:
        """Get volunteer information by ID"""
        try:
            with open(self.volunteers_file, 'r') as f:
                data = json.load(f)
            
            if volunteer_id in data["volunteers"]:
                volunteer = data["volunteers"][volunteer_id].copy()
                # Convert face encoding back to numpy array with proper padding
                encoding_base64 = volunteer["face_encoding"]
                encoding_bytes = base64.b64decode(encoding_base64.encode('utf-8'))
                volunteer["face_encoding"] = np.frombuffer(encoding_bytes, dtype=np.float64)
                
                # Read the image data
                with open(volunteer["image_path"], 'rb') as f:
                    volunteer["image_data"] = f.read()
                return volunteer
            return None
        
        except Exception as e:
            print(f"Error getting volunteer: {str(e)}")
            return None
    
    def get_all_volunteers(self) -> List[Tuple[str, Dict]]:
        """Get all volunteers with their face encodings"""
        try:
            with open(self.volunteers_file, 'r') as f:
                data = json.load(f)
            
            volunteers = []
            for volunteer_id, volunteer in data["volunteers"].items():
                volunteer_copy = volunteer.copy()
                # Convert face encoding back to numpy array with proper padding
                encoding_base64 = volunteer["face_encoding"]
                encoding_bytes = base64.b64decode(encoding_base64.encode('utf-8'))
                volunteer_copy["face_encoding"] = np.frombuffer(encoding_bytes, dtype=np.float64)
                
                # Read the image data
                with open(volunteer["image_path"], 'rb') as f:
                    volunteer_copy["image_data"] = f.read()
                volunteers.append((volunteer_id, volunteer_copy))
            
            return volunteers
        
        except Exception as e:
            print(f"Error getting all volunteers: {str(e)}")
            return []
    
    def mark_attendance(self, event_id: str, volunteer_id: str, confidence_score: float) -> bool:
        """Mark attendance for a volunteer at an event"""
        try:
            # Load existing attendance data
            with open(self.attendance_file, 'r') as f:
                data = json.load(f)
            
            # Initialize event if it doesn't exist
            if event_id not in data["events"]:
                data["events"][event_id] = []
            
            # Check if attendance already marked
            for attendance in data["events"][event_id]:
                if attendance["volunteer_id"] == volunteer_id:
                    # Update confidence score if new score is higher
                    if confidence_score > attendance["confidence_score"]:
                        attendance["confidence_score"] = confidence_score
                        attendance["timestamp"] = datetime.utcnow().isoformat()
                        with open(self.attendance_file, 'w') as f:
                            json.dump(data, f, indent=4)
                        return True
                    return False
            
            # Add attendance record
            attendance_record = {
                "volunteer_id": volunteer_id,
                "timestamp": datetime.utcnow().isoformat(),
                "confidence_score": confidence_score
            }
            
            data["events"][event_id].append(attendance_record)
            
            # Save updated data
            with open(self.attendance_file, 'w') as f:
                json.dump(data, f, indent=4)
            
            return True
        
        except Exception as e:
            print(f"Error marking attendance: {str(e)}")
            return False
    
    def get_attendance_logs(self, event_id: str) -> List[Dict]:
        """Get attendance logs for an event with volunteer photos"""
        try:
            with open(self.attendance_file, 'r') as f:
                data = json.load(f)
            
            if event_id not in data["events"]:
                return []
            
            # Load volunteer data to include names and photos
            with open(self.volunteers_file, 'r') as f:
                volunteers = json.load(f)["volunteers"]
            
            # Add volunteer names and photos to attendance records
            attendance_logs = []
            for record in data["events"][event_id]:
                volunteer = volunteers.get(record["volunteer_id"], {})
                log_entry = {
                    "volunteer_id": record["volunteer_id"],
                    "volunteer_name": volunteer.get("name", "Unknown"),
                    "timestamp": record["timestamp"],
                    "confidence_score": record["confidence_score"]
                }
                
                # Add volunteer photo if available
                if "image_path" in volunteer and os.path.exists(volunteer["image_path"]):
                    with open(volunteer["image_path"], 'rb') as f:
                        log_entry["photo"] = base64.b64encode(f.read()).decode('utf-8')
                
                attendance_logs.append(log_entry)
            
            return attendance_logs
        
        except Exception as e:
            print(f"Error getting attendance logs: {str(e)}")
            return []
    
    def cleanup(self):
        """Clean up all data (useful for testing)"""
        try:
            if os.path.exists(self.data_dir):
                shutil.rmtree(self.data_dir)
            os.makedirs(self.faces_dir, exist_ok=True)
            os.makedirs(self.events_dir, exist_ok=True)
            self._init_json_files()
            return True
        except Exception as e:
            print(f"Error cleaning up data: {str(e)}")
            return False 