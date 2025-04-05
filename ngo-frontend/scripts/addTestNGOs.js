const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

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
const db = getFirestore(app);

// Test NGOs to add
const testNGOs = [
  {
    name: 'Environmental Protection Society',
    description: 'Working to protect and preserve our environment through community action and education.',
    role: 'ngo_admin',
    causes: ['Environment', 'Education', 'Community Development'],
    location: 'New York',
    volunteerCount: 25,
    logo: 'https://example.com/logo1.png'
  },
  {
    name: 'Youth Empowerment Initiative',
    description: 'Empowering young people through education, mentorship, and skill development programs.',
    role: 'ngo_admin',
    causes: ['Education', 'Youth Development', 'Skills Training'],
    location: 'Chicago',
    volunteerCount: 15,
    logo: 'https://example.com/logo2.png'
  },
  {
    name: 'Global Health Foundation',
    description: 'Providing healthcare services and education to underserved communities worldwide.',
    role: 'ngo_admin',
    causes: ['Healthcare', 'Education', 'Community Development'],
    location: 'San Francisco',
    volunteerCount: 35,
    logo: 'https://example.com/logo3.png'
  }
];

// Add NGOs to Firebase
const addNGOs = async () => {
  try {
    for (const ngo of testNGOs) {
      const docRef = await addDoc(collection(db, 'users'), ngo);
      console.log('Added NGO with ID:', docRef.id);
    }
  } catch (error) {
    console.error('Error adding NGOs:', error);
  }
};

addNGOs(); 