const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, updateDoc, doc } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');

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
const storage = getStorage(app);

// Indian NGOs data
const indianNGOs = [
  {
    name: 'Goonj',
    description: 'Goonj is a non-governmental organization based in Delhi, India. It focuses on urban-rural exchange of material as a tool to trigger development with dignity, urban material as a resource for rural development, and under-utilized urban material as a development resource.',
    role: 'ngo_admin',
    causes: ['Education', 'Healthcare', 'Community Development', 'Disaster Relief'],
    location: 'Delhi',
    volunteerCount: 120,
    logo: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fgoonj.png?alt=media&token=token1',
    website: 'https://goonj.org',
    foundedYear: 1999,
    impact: 'Reached over 10 million people across India',
    contactEmail: 'info@goonj.org',
    contactPhone: '+91-11-26972351'
  },
  {
    name: 'Teach For India',
    description: 'Teach For India is a non-profit organization that works to eliminate educational inequity in India by placing outstanding college graduates and young professionals as full-time teachers in low-income schools.',
    role: 'ngo_admin',
    causes: ['Education', 'Youth Development', 'Social Justice'],
    location: 'Mumbai',
    volunteerCount: 85,
    logo: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fteachforindia.png?alt=media&token=token2',
    website: 'https://www.teachforindia.org',
    foundedYear: 2008,
    impact: 'Placed over 10,000 fellows in schools across India',
    contactEmail: 'info@teachforindia.org',
    contactPhone: '+91-22-2493-7474'
  },
  {
    name: 'Akshaya Patra Foundation',
    description: 'The Akshaya Patra Foundation is a non-profit organization in India that runs the world\'s largest mid-day meal program. It aims to eliminate classroom hunger by implementing the Mid-Day Meal Scheme in government schools and government-aided schools.',
    role: 'ngo_admin',
    causes: ['Education', 'Child Welfare', 'Hunger Relief'],
    location: 'Bangalore',
    volunteerCount: 150,
    logo: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fakshayapatra.png?alt=media&token=token3',
    website: 'https://www.akshayapatra.org',
    foundedYear: 2000,
    impact: 'Serving over 1.8 million children daily',
    contactEmail: 'info@akshayapatra.org',
    contactPhone: '+91-80-30143400'
  },
  {
    name: 'SEWA (Self-Employed Women\'s Association)',
    description: 'SEWA is a trade union registered in 1972. It is an organization of poor, self-employed women workers. These are women who earn a living through their own labor or small businesses.',
    role: 'ngo_admin',
    causes: ['Women Empowerment', 'Economic Development', 'Labor Rights'],
    location: 'Ahmedabad',
    volunteerCount: 95,
    logo: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fsewa.png?alt=media&token=token4',
    website: 'https://www.sewa.org',
    foundedYear: 1972,
    impact: 'Over 2 million members across India',
    contactEmail: 'info@sewa.org',
    contactPhone: '+91-79-25506444'
  },
  {
    name: 'CRY (Child Rights and You)',
    description: 'CRY is an Indian non-governmental organization that works to ensure children\'s rights. The organization was founded in 1979 to restore children\'s rights in India.',
    role: 'ngo_admin',
    causes: ['Child Welfare', 'Education', 'Healthcare'],
    location: 'Mumbai',
    volunteerCount: 110,
    logo: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fcry.png?alt=media&token=token5',
    website: 'https://www.cry.org',
    foundedYear: 1979,
    impact: 'Reached over 3 million children across India',
    contactEmail: 'info@cry.org',
    contactPhone: '+91-22-23063647'
  }
];

// Events data
const events = [
  {
    title: 'Education for All - Rural India Campaign',
    description: 'Join us for a week-long campaign to promote education in rural areas of Maharashtra. We will be conducting workshops, distributing educational materials, and setting up temporary learning centers.',
    date: '2023-06-15T09:00:00',
    location: 'Mumbai, Maharashtra',
    organizer: 'Teach For India',
    organizerId: 'teachforindia_id', // Will be replaced with actual ID
    category: 'Education',
    maxParticipants: 50,
    currentParticipants: 12,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Feducation_campaign.png?alt=media&token=token6',
    requirements: 'Volunteers should be comfortable working with children and have basic teaching skills.',
    status: 'upcoming',
    causes: ['Education', 'Community Development']
  },
  {
    title: 'Clean India Drive - Delhi',
    description: 'A city-wide cleanliness drive to make Delhi cleaner and greener. We will be organizing teams to clean public spaces, plant trees, and create awareness about waste management.',
    date: '2023-07-20T08:00:00',
    location: 'Delhi',
    organizer: 'Goonj',
    organizerId: 'goonj_id', // Will be replaced with actual ID
    category: 'Environment',
    maxParticipants: 100,
    currentParticipants: 45,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fclean_india.png?alt=media&token=token7',
    requirements: 'Volunteers should bring their own gloves and masks. Refreshments will be provided.',
    status: 'upcoming',
    causes: ['Environment', 'Community Development']
  },
  {
    title: 'Women Empowerment Workshop',
    description: 'A two-day workshop focused on skill development, financial literacy, and self-defense training for women from underprivileged backgrounds.',
    date: '2023-08-05T10:00:00',
    location: 'Ahmedabad, Gujarat',
    organizer: 'SEWA',
    organizerId: 'sewa_id', // Will be replaced with actual ID
    category: 'Women Empowerment',
    maxParticipants: 30,
    currentParticipants: 18,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fwomen_empowerment.png?alt=media&token=token8',
    requirements: 'Open to all women. Registration required.',
    status: 'upcoming',
    causes: ['Women Empowerment', 'Education']
  },
  {
    title: 'Mid-Day Meal Program Volunteer Drive',
    description: 'Join us in our mission to provide nutritious meals to school children. We need volunteers to help with food preparation, serving, and creating awareness about the importance of nutrition.',
    date: '2023-09-10T07:00:00',
    location: 'Bangalore, Karnataka',
    organizer: 'Akshaya Patra Foundation',
    organizerId: 'akshayapatra_id', // Will be replaced with actual ID
    category: 'Child Welfare',
    maxParticipants: 40,
    currentParticipants: 22,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fmidday_meal.png?alt=media&token=token9',
    requirements: 'Volunteers should be available for at least 4 hours. Food handling certification preferred.',
    status: 'upcoming',
    causes: ['Child Welfare', 'Hunger Relief']
  },
  {
    title: 'Child Rights Awareness Campaign',
    description: 'A month-long campaign to create awareness about child rights, child labor, and child protection laws. We will be conducting street plays, workshops, and distributing educational materials.',
    date: '2023-10-01T11:00:00',
    location: 'Mumbai, Maharashtra',
    organizer: 'CRY',
    organizerId: 'cry_id', // Will be replaced with actual ID
    category: 'Child Welfare',
    maxParticipants: 60,
    currentParticipants: 35,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fchild_rights.png?alt=media&token=token10',
    requirements: 'Volunteers should have good communication skills and be passionate about child rights.',
    status: 'upcoming',
    causes: ['Child Welfare', 'Education']
  }
];

// Add NGOs to Firebase
const addNGOs = async () => {
  try {
    console.log('Adding Indian NGOs to Firebase...');
    const ngoIds = {};
    
    for (const ngo of indianNGOs) {
      const docRef = await addDoc(collection(db, 'users'), ngo);
      console.log(`Added NGO: ${ngo.name} with ID: ${docRef.id}`);
      ngoIds[ngo.name.toLowerCase().replace(/\s+/g, '_')] = docRef.id;
    }
    
    return ngoIds;
  } catch (error) {
    console.error('Error adding NGOs:', error);
    return {};
  }
};

// Add events to Firebase
const addEvents = async (ngoIds) => {
  try {
    console.log('Adding events to Firebase...');
    
    for (const event of events) {
      // Replace placeholder organizerId with actual NGO ID
      const organizerKey = event.organizer.toLowerCase().replace(/\s+/g, '_');
      if (ngoIds[organizerKey]) {
        event.organizerId = ngoIds[organizerKey];
      }
      
      const docRef = await addDoc(collection(db, 'events'), event);
      console.log(`Added event: ${event.title} with ID: ${docRef.id}`);
    }
    
    console.log('All events added successfully!');
  } catch (error) {
    console.error('Error adding events:', error);
  }
};

// Main function to add all data
const addAllData = async () => {
  try {
    const ngoIds = await addNGOs();
    await addEvents(ngoIds);
    console.log('All data added successfully!');
  } catch (error) {
    console.error('Error adding data:', error);
  }
};

// Run the script
addAllData(); 