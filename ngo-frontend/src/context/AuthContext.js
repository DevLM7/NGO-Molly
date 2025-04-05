import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

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
          badges: userData?.badges || [],
          profileImage: userData?.profileImage || null,
          faceDescriptor: userData?.faceDescriptor || null
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
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User data not found');
      }
      
      const user = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        role: userData.role || 'volunteer',
        name: userData.name || userCredential.user.displayName,
        skills: userData.skills || [],
        interests: userData.interests || [],
        totalHours: userData.totalHours || 0,
        badges: userData.badges || [],
        profileImage: userData.profileImage || null,
        faceDescriptor: userData.faceDescriptor || null
      };
      
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later or reset your password.');
        case 'auth/user-not-found':
          throw new Error('No account found with this email address.');
        case 'auth/wrong-password':
          throw new Error('Incorrect password. Please try again.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address format.');
        case 'auth/user-disabled':
          throw new Error('This account has been disabled. Please contact support.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection.');
        default:
          throw new Error('An error occurred during login. Please try again.');
      }
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
      if (!user) throw new Error('No user logged in');
      
      // Get the current user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }
      
      // Prepare the data to update
      const updateData = {
        name: profileData.name || user.name,
        bio: profileData.bio || user.bio,
        skills: profileData.skills || user.skills || [],
        interests: profileData.interests || user.interests || [],
        updatedAt: new Date().toISOString()
      };
      
      // Only update profile image and face descriptor if they are provided
      if (profileData.profileImage) {
        updateData.profileImage = profileData.profileImage;
      }
      
      if (profileData.faceDescriptor) {
        updateData.faceDescriptor = profileData.faceDescriptor;
      }
      
      // Update the user document
      await updateDoc(userRef, updateData);
      
      // Update the local user state
      setUser(prevUser => ({
        ...prevUser,
        ...updateData
      }));
      
      // If the user is a volunteer, update their profile in the volunteers collection
      if (user.role === 'volunteer') {
        const volunteerRef = doc(db, 'volunteers', user.uid);
        const volunteerDoc = await getDoc(volunteerRef);
        
        if (volunteerDoc.exists()) {
          await updateDoc(volunteerRef, updateData);
        } else {
          // Create a new volunteer document if it doesn't exist
          await setDoc(volunteerRef, {
            ...updateData,
            userId: user.uid,
            email: user.email,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        const userData = {
          uid: result.user.uid,
          name: result.user.displayName,
          email: result.user.email,
          role: 'volunteer', // Default role for Google sign-in
          skills: [],
          interests: [],
          totalHours: 0,
          badges: [],
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), userData);
        setUser(userData);
      } else {
        // Use existing user data
        const userData = userDoc.data();
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          role: userData.role,
          name: userData.name,
          skills: userData.skills || [],
          interests: userData.interests || [],
          totalHours: userData.totalHours || 0,
          badges: userData.badges || [],
          profileImage: userData.profileImage || null,
          faceDescriptor: userData.faceDescriptor || null
        });
      }
      
      return result.user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    loginWithGoogle,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
