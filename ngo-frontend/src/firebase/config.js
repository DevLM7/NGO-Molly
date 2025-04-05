import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB192mO4KQ8phO-R92jpBbKYHSBtFNdO_8",
  authDomain: "ngoplatform-48c72.firebaseapp.com",
  projectId: "ngoplatform-48c72",
  storageBucket: "ngoplatform-48c72.firebasestorage.app",
  messagingSenderId: "1066528688543",
  appId: "1:1066528688543:web:830bd661060a0d5685d5aa",
  measurementId: "G-8PVJVBHBF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export the services
export { auth, db, storage, analytics };
