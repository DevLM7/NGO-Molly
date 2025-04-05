from app.models.base import BaseModel
from app.config.firebase import auth, db
from datetime import datetime

class User(BaseModel):
    collection_name = 'users'

    def __init__(self, id=None, email=None, name=None, role=None, 
                 phone=None, address=None, profile_image=None, 
                 skills=None, interests=None, availability=None, 
                 created_at=None, updated_at=None, bio=None, face_descriptor=None):
        super().__init__(id, created_at, updated_at)
        self.email = email
        self.name = name
        self.role = role
        self.phone = phone
        self.address = address
        self.profile_image = profile_image
        self.skills = skills or []
        self.interests = interests or []
        self.availability = availability or {}
        self.bio = bio
        self.face_descriptor = face_descriptor

    @classmethod
    def create_user(cls, email, password, name, role):
        """Create a new user in Firebase Auth and Firestore"""
        try:
            # Create user in Firebase Auth
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            
            # Set custom claims for role
            auth.set_custom_user_claims(user.uid, {'role': role})
            
            # Create user document in Firestore
            user_data = {
                'email': email,
                'name': name,
                'role': role,
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            db.collection('users').document(user.uid).set(user_data)
            
            return cls(id=user.uid, **user_data)
            
        except Exception as e:
            raise Exception(f"Error creating user: {str(e)}")

    @classmethod
    def get_by_email(cls, email):
        """Get user by email"""
        users = cls.find({'email': email})
        return users[0] if users else None

    def update_profile(self, data):
        """Update user profile"""
        # Update Firebase Auth display name if name is changed
        if 'name' in data and data['name'] != this.name:
            auth.update_user(this.id, display_name=data['name'])
        
        # Update Firestore document
        for key, value in data.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        this.save()
        return this

    @staticmethod
    def find_by_id(user_id):
        try:
            doc = db.collection('users').document(user_id).get()
            if doc.exists:
                data = doc.to_dict()
                return User(
                    id=doc.id,
                    name=data.get('name'),
                    email=data.get('email'),
                    role=data.get('role'),
                    phone=data.get('phone'),
                    address=data.get('address'),
                    skills=data.get('skills', []),
                    interests=data.get('interests', []),
                    bio=data.get('bio'),
                    profile_image=data.get('profileImage'),
                    face_descriptor=data.get('faceDescriptor')
                )
            return None
        except Exception as e:
            print(f"Error finding user by ID: {str(e)}")
            return None

    @staticmethod
    def find_by_email(email):
        """Find a user by email"""
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1)
        users = query.get()
        
        if not users:
            return None
            
        user_data = users[0].to_dict()
        user_data['uid'] = users[0].id
        return User(**user_data)

    def save(self):
        """Save or update user"""
        try:
            data = {
                'email': self.email,
                'name': self.name,
                'role': self.role,
                'phone': self.phone,
                'address': self.address,
                'skills': self.skills,
                'interests': self.interests,
                'bio': self.bio,
                'profileImage': self.profile_image,
                'faceDescriptor': self.face_descriptor,
                'updated_at': datetime.now().isoformat()
            }
            
            if not self.id:
                # Create new user
                data['created_at'] = self.created_at
                user_ref = db.collection('users').document()
                self.id = user_ref.id
            else:
                # Update existing user
                user_ref = db.collection('users').document(self.id)
            
            user_ref.set(data, merge=True)
            return True
        except Exception as e:
            print(f"Error saving user: {str(e)}")
            return False

    def delete(self):
        """Delete user"""
        if not self.id:
            raise ValueError("User ID is required for deletion")
            
        db.collection('users').document(self.id).delete()
        return True

    @staticmethod
    def create_firebase_user(email, password, name):
        """Create a new user in Firebase Authentication"""
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=name
            )
            return user.uid
        except Exception as e:
            raise Exception(f"Error creating Firebase user: {str(e)}")

    def to_dict(self):
        """Convert user to dictionary"""
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'role': self.role,
            'phone': self.phone,
            'address': self.address,
            'skills': self.skills,
            'interests': self.interests,
            'bio': self.bio,
            'profileImage': self.profile_image,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at
        }

    @staticmethod
    def find_all_with_face_descriptors():
        try:
            docs = db.collection('users').where('faceDescriptor', '!=', None).get()
            users = []
            for doc in docs:
                data = doc.to_dict()
                users.append(User(
                    id=doc.id,
                    name=data.get('name'),
                    email=data.get('email'),
                    role=data.get('role'),
                    phone=data.get('phone'),
                    address=data.get('address'),
                    skills=data.get('skills', []),
                    interests=data.get('interests', []),
                    bio=data.get('bio'),
                    profile_image=data.get('profileImage'),
                    face_descriptor=data.get('faceDescriptor')
                ))
            return users
        except Exception as e:
            print(f"Error finding users with face descriptors: {str(e)}")
            return [] 