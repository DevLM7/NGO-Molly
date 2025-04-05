import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          role: userData?.role || 'volunteer',
          name: userData?.name || firebaseUser.displayName,
          skills: userData?.skills || [],
          interests: userData?.interests || [],
          totalHours: userData?.totalHours || 0,
          badges: userData?.badges || []
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (formData) => {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Update profile with display name
      await updateFirebaseProfile(userCredential.user, {
        displayName: formData.name
      });

      // Create user document in Firestore
      const userData = {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role || 'volunteer',
        phone: formData.phone || '',
        address: formData.address || '',
        skills: formData.skills || [],
        interests: formData.interests || [],
        totalHours: 0,
        badges: [],
        createdAt: new Date()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      
      setUser({
        ...userData,
        uid: userCredential.user.uid
      });

      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: userData?.role || 'volunteer',
        name: userData?.name || userCredential.user.displayName,
        skills: userData?.skills || [],
        interests: userData?.interests || [],
        totalHours: userData?.totalHours || 0,
        badges: userData?.badges || []
      };
      
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Update Firebase Auth profile if name is provided
      if (profileData.name) {
        await updateFirebaseProfile(auth.currentUser, {
          displayName: profileData.name
        });
      }

      // Update Firestore document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        name: profileData.name || user.name,
        skills: profileData.skills || user.skills,
        interests: profileData.interests || user.interests,
        bio: profileData.bio || user.bio || '',
        updatedAt: new Date()
      });

      // Update local user state
      setUser({
        ...user,
        name: profileData.name || user.name,
        skills: profileData.skills || user.skills,
        interests: profileData.interests || user.interests,
        bio: profileData.bio || user.bio || ''
      });

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
