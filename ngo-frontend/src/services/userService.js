import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const userService = {
  // Get user data from Firestore
  async getUserData(userId) {
    try {
      console.log('Getting user data for:', userId);
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('User data found:', userData);
        return userData;
      } else {
        console.log('No user data found for:', userId);
        return null;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      throw error;
    }
  }
};

export default userService; 