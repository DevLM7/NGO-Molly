import os
from dotenv import load_dotenv
from utils.firebase import initialize_firebase, db, storage, bucket, auth

# Load environment variables
load_dotenv()

# Initialize Firebase (will use mock in development)
initialize_firebase()

# Export the db, storage, bucket, and auth instances
__all__ = ['db', 'storage', 'bucket', 'auth']