import { collection, getDocs, doc, getDoc, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const ngoService = {
  // Get all NGOs
  async getAllNGOs() {
    try {
      console.log('Fetching NGOs from Firebase...');
      console.log('Database instance:', db);
      
      // First, let's check if we can get any users at all
      const usersQuery = query(collection(db, 'users'));
      console.log('Users query:', usersQuery);
      
      const usersSnap = await getDocs(usersQuery);
      console.log('Users snapshot:', usersSnap);
      console.log('Total users in collection:', usersSnap.size);
      
      // Log all users to see what we have
      usersSnap.forEach(doc => {
        console.log('User document:', {
          id: doc.id,
          data: doc.data(),
          exists: doc.exists(),
          metadata: doc.metadata
        });
      });
      
      // Get all users and filter for NGOs in JavaScript
      const allUsers = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('All users:', allUsers);
      console.log('User roles:', allUsers.map(user => user.role));
      
      // Filter for NGOs - check for various possible role values
      const ngos = allUsers.filter(user => {
        const isNGO = user.role === 'ngo_admin' || 
          user.role === 'ngo' || 
          user.role === 'organization' ||
          user.role === 'organization_admin';
        
        if (isNGO) {
          console.log('Found NGO:', {
            id: user.id,
            name: user.name,
            role: user.role,
            causes: user.causes,
            location: user.location
          });
        } else {
          console.log('Skipping non-NGO user:', {
            id: user.id,
            role: user.role
          });
        }
        
        return isNGO;
      });
      
      console.log('Found NGOs:', ngos.length);
      console.log('NGO details:', ngos.map(ngo => ({
        id: ngo.id,
        name: ngo.name,
        role: ngo.role,
        causes: ngo.causes,
        location: ngo.location
      })));
      
      return ngos;
    } catch (error) {
      console.error('Error getting NGOs:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },

  // Get NGO by ID
  async getNGOById(ngoId) {
    try {
      console.log('Fetching NGO by ID:', ngoId);
      
      const ngoRef = doc(db, 'users', ngoId);
      console.log('NGO reference:', ngoRef);
      
      const ngoSnap = await getDoc(ngoRef);
      console.log('NGO snapshot:', ngoSnap);
      
      if (!ngoSnap.exists()) {
        console.log('NGO not found:', ngoId);
        throw new Error('NGO not found');
      }
      
      const ngoData = {
        id: ngoSnap.id,
        ...ngoSnap.data()
      };
      
      console.log('Found NGO:', {
        id: ngoData.id,
        name: ngoData.name,
        role: ngoData.role,
        causes: ngoData.causes,
        location: ngoData.location
      });
      
      return ngoData;
    } catch (error) {
      console.error('Error getting NGO:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  },
  
  // Subscribe to real-time NGO updates
  subscribeToNGOs(callback) {
    try {
      console.log('Setting up real-time NGO listener...');
      console.log('Database instance:', db);
      
      // Create a query for users collection
      const usersQuery = query(collection(db, 'users'));
      console.log('Users query:', usersQuery);
      
      // Set up the real-time listener
      const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
        console.log('NGO snapshot update received');
        console.log('Total documents in snapshot:', snapshot.size);
        console.log('Snapshot metadata:', snapshot.metadata);
        
        // Track changes to identify deleted NGOs
        const changes = snapshot.docChanges();
        console.log('Document changes:', changes.length);
        
        // Log changes for debugging
        changes.forEach(change => {
          console.log('Document change:', {
            type: change.type,
            id: change.doc.id,
            data: change.doc.data(),
            oldIndex: change.oldIndex,
            newIndex: change.newIndex
          });
        });
        
        // Get all users and filter for NGOs
        const allUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('All users:', allUsers.length);
        console.log('User roles:', allUsers.map(user => user.role));
        
        // Filter for NGOs - check for various possible role values
        const ngos = allUsers.filter(user => {
          const isNGO = user.role === 'ngo_admin' || 
            user.role === 'ngo' || 
            user.role === 'organization' ||
            user.role === 'organization_admin';
          
          if (isNGO) {
            console.log('Found NGO:', {
              id: user.id,
              name: user.name,
              role: user.role,
              causes: user.causes,
              location: user.location
            });
          } else {
            console.log('Skipping non-NGO user:', {
              id: user.id,
              role: user.role
            });
          }
          
          return isNGO;
        });
        
        console.log('Real-time update: Found NGOs:', ngos.length);
        console.log('NGO details:', ngos.map(ngo => ({
          id: ngo.id,
          name: ngo.name,
          role: ngo.role,
          causes: ngo.causes,
          location: ngo.location
        })));
        
        // Call the callback with the updated NGOs
        callback(ngos);
      }, (error) => {
        console.error('Error in NGO listener:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      });
      
      // Return the unsubscribe function
      return unsubscribe;
    } catch (error) {
      console.error('Error setting up NGO listener:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
};

export default ngoService; 