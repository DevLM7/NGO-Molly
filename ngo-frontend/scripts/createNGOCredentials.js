const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyBxGUe4Hh_2QpDPK_7d4GUm2T_vvN7DYrA',
  authDomain: 'ngo-collaboration-platform.firebaseapp.com',
  projectId: 'ngo-collaboration-platform',
  storageBucket: 'ngo-collaboration-platform.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef0123456789'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// NGO credentials
const ngoCredentials = [
  {
    name: 'Goonj',
    email: 'info@goonj.org',
    password: 'Goonj@123'
  },
  {
    name: 'Teach For India',
    email: 'info@teachforindia.org',
    password: 'TeachForIndia@123'
  },
  {
    name: 'Akshaya Patra Foundation',
    email: 'info@akshayapatra.org',
    password: 'AkshayaPatra@123'
  },
  {
    name: 'SEWA',
    email: 'info@sewa.org',
    password: 'Sewa@123'
  },
  {
    name: 'CRY',
    email: 'info@cry.org',
    password: 'Cry@123'
  }
];

// Create NGO accounts
const createNGOCredentials = async () => {
  try {
    console.log('Creating NGO credentials...');
    
    for (const ngo of ngoCredentials) {
      try {
        // Create authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, ngo.email, ngo.password);
        console.log(`Created auth account for ${ngo.name}`);
        
        // Set role in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: ngo.name,
          email: ngo.email,
          role: 'ngo_admin',
          createdAt: new Date()
        });
        console.log(`Set role for ${ngo.name}`);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Account already exists for ${ngo.name}`);
        } else {
          console.error(`Error creating account for ${ngo.name}:`, error);
        }
      }
    }
    
    console.log('NGO credentials creation completed!');
  } catch (error) {
    console.error('Error in createNGOCredentials:', error);
  }
};

// Run the script
createNGOCredentials(); 