from app.config.firebase import db
from datetime import datetime

class BaseModel:
    def __init__(self, id=None, created_at=None, updated_at=None):
        self.id = id
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()

    @classmethod
    def find_by_id(cls, id):
        """Find document by ID"""
        doc_ref = db.collection(cls.collection_name).document(id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return None
            
        data = doc.to_dict()
        data['id'] = doc.id
        return cls(**data)

    @classmethod
    def find(cls, query=None):
        """Find documents based on query"""
        collection_ref = db.collection(cls.collection_name)
        
        if query:
            for key, value in query.items():
                collection_ref = collection_ref.where(key, '==', value)
        
        docs = collection_ref.get()
        return [cls(**{**doc.to_dict(), 'id': doc.id}) for doc in docs]

    def save(self):
        """Save or update document"""
        data = self.to_dict()
        data.pop('id', None)  # Remove id from data
        data['updated_at'] = datetime.now()
        
        if not self.id:
            # Create new document
            data['created_at'] = datetime.now()
            doc_ref = db.collection(self.collection_name).document()
            self.id = doc_ref.id
        else:
            # Update existing document
            doc_ref = db.collection(self.collection_name).document(self.id)
            
        doc_ref.set(data, merge=True)
        return self

    def delete(self):
        """Delete document"""
        if not self.id:
            raise ValueError("Document ID is required for deletion")
            
        db.collection(self.collection_name).document(self.id).delete()
        return True

    def to_dict(self):
        """Convert model to dictionary"""
        data = {}
        for key, value in self.__dict__.items():
            if not key.startswith('_'):
                if isinstance(value, datetime):
                    data[key] = value.isoformat()
                else:
                    data[key] = value
        return data 