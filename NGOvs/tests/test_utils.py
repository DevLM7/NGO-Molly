import os
import cv2
import numpy as np
from unittest.mock import MagicMock

class TestStorage:
    def __init__(self):
        self.files = {}
        
    def upload_event_image(self, event_id, file_path):
        """Mock upload event image"""
        with open(file_path, 'rb') as f:
            self.files[f'events/{event_id}/{os.path.basename(file_path)}'] = f.read()
        return f'gs://mock-bucket/events/{event_id}/{os.path.basename(file_path)}'
        
    def get_event_images(self, event_id):
        """Mock get event images"""
        return [f'tests/test_data/{k.split("/")[-1]}' 
               for k in self.files.keys() 
               if k.startswith(f'events/{event_id}/')]

# Patch the storage module for testing
def setup_test_environment():
    import ngobackend.utils.firebase as firebase_utils
    firebase_utils.storage = TestStorage()
    return firebase_utils.storage

def create_test_image(file_path):
    """Create a test image with a simple face rectangle"""
    img = np.zeros((300,300,3), np.uint8)
    cv2.rectangle(img, (100,100), (200,200), (255,255,255), -1)
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    cv2.imwrite(file_path, img)
