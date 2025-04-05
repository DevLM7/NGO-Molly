import os
import json
from dotenv import load_dotenv

load_dotenv()

# Mock Firebase for development
class MockFirestore:
    def __init__(self):
        self.collections = {}
    
    def collection(self, name):
        if name not in self.collections:
            self.collections[name] = MockCollection()
        return self.collections[name]

class MockCollection:
    def __init__(self):
        self.documents = {}
    
    def document(self, id=None):
        if id is None:
            id = f"doc_{len(self.documents)}"
        if id not in self.documents:
            self.documents[id] = MockDocument(id)
        return self.documents[id]
    
    def get(self):
        return [doc for doc in self.documents.values()]
    
    def where(self, field, op, value):
        # Mock where clause
        return self

    def order_by(self, field, direction=None):
        # Mock order by
        return self
    
    def limit(self, n):
        # Mock limit
        return self

class MockDocument:
    def __init__(self, id):
        self.id = id
        self.data = {}
        self.exists = True
    
    def set(self, data):
        self.data = data
        return self
    
    def update(self, data):
        self.data.update(data)
        return self
    
    def get(self):
        return self
    
    def to_dict(self):
        return self.data
    
    def delete(self):
        self.exists = False
        return self

class MockStorage:
    def __init__(self):
        self.files = {}
    
    def bucket(self):
        return self
    
    def blob(self, name):
        if name not in self.files:
            self.files[name] = MockBlob(name)
        return self.files[name]

class MockBlob:
    def __init__(self, name):
        self.name = name
        self.data = None
    
    def upload_from_string(self, data, content_type=None):
        self.data = data
        return self
    
    def download_as_bytes(self):
        return self.data.encode() if isinstance(self.data, str) else self.data

class MockAuth:
    def __init__(self):
        self.users = {}
    
    def create_user(self, email, password):
        user_id = f"user_{len(self.users)}"
        self.users[user_id] = {
            'uid': user_id,
            'email': email,
            'password': password
        }
        return self.users[user_id]
    
    def get_user(self, uid):
        if uid not in self.users:
            raise ValueError('User not found')
        return self.users[uid]
    
    def update_user(self, uid, **kwargs):
        if uid not in self.users:
            raise ValueError('User not found')
        self.users[uid].update(kwargs)
        return self.users[uid]
    
    def delete_user(self, uid):
        if uid not in self.users:
            raise ValueError('User not found')
        del self.users[uid]
    
    def verify_id_token(self, token):
        # Mock token verification
        return {
            'uid': 'mock-user-id',
            'email': 'mock@example.com'
        }

# Initialize mock Firebase for development
db = MockFirestore()
storage = MockStorage()
bucket = storage.bucket()
auth = MockAuth()

def verify_token(token):
    """Mock token verification for development"""
    return {
        "uid": "mock-user-id",
        "email": "mock@example.com",
        "role": "volunteer"
    }

def initialize_firebase():
    """Initialize Firebase (mock version for development)"""
    global db, storage, bucket, auth
    
    # Always use mock Firebase in development
    if os.getenv('FLASK_ENV') == 'development':
        print("Initializing mock Firebase for development")
        db = MockFirestore()
        storage = MockStorage()
        bucket = storage.bucket()
        auth = MockAuth()
        return
    
    # Production initialization
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore, storage as firebase_storage, auth as firebase_auth
        
        # Check if already initialized
        if len(firebase_admin._apps) > 0:
            print("Firebase already initialized")
            return
        
        # Initialize Firebase Admin
        cred = credentials.Certificate({
            "type": "service_account",
            "project_id": os.getenv('FIREBASE_PROJECT_ID'),
            "private_key_id": os.getenv('FIREBASE_PRIVATE_KEY_ID'),
            "private_key": os.getenv('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
            "client_email": os.getenv('FIREBASE_CLIENT_EMAIL'),
            "client_id": os.getenv('FIREBASE_CLIENT_ID'),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": os.getenv('FIREBASE_CLIENT_X509_CERT_URL')
        })
        
        firebase_admin.initialize_app(cred, {
            'storageBucket': os.getenv('FIREBASE_STORAGE_BUCKET')
        })
        
        # Initialize Firestore and Storage
        db = firestore.client()
        storage = firebase_storage.bucket()
        bucket = storage
        auth = firebase_auth
        print("Initialized real Firebase successfully")
        
    except Exception as e:
        print(f"Error initializing Firebase: {str(e)}")
        print("Falling back to mock Firebase")
        db = MockFirestore()
        storage = MockStorage()
        bucket = storage.bucket()
        auth = MockAuth() 