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

// Events data
const events = [
  {
    title: 'Education Awareness Campaign',
    description: 'Join us for a week-long campaign to promote education in rural Maharashtra. We will conduct workshops, distribute educational materials, and engage with local communities to emphasize the importance of education.',
    date: new Date('2024-03-15T09:00:00'),
    endDate: new Date('2024-03-21T17:00:00'),
    location: 'Rural Maharashtra',
    organizer: 'teachforindia_id', // Will be replaced with actual ID
    organizerName: 'Teach For India',
    category: 'Education',
    maxParticipants: 50,
    currentParticipants: 0,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Feducation_campaign.png?alt=media&token=token6',
    requirements: [
      'Basic teaching skills',
      'Good communication skills',
      'Willingness to travel to rural areas',
      'Commitment to full week participation'
    ],
    status: 'upcoming',
    causes: ['Education', 'Community Development'],
    registrationDeadline: new Date('2024-03-10T23:59:59'),
    contactEmail: 'events@teachforindia.org',
    contactPhone: '+91-9876543210'
  },
  {
    title: 'Clean India Drive',
    description: 'A massive cleanliness drive across Delhi to promote Swachh Bharat mission. Activities include waste collection, tree plantation, and awareness campaigns about environmental conservation.',
    date: new Date('2024-04-22T06:00:00'),
    endDate: new Date('2024-04-22T18:00:00'),
    location: 'Various locations in Delhi',
    organizer: 'goonj_id', // Will be replaced with actual ID
    organizerName: 'Goonj',
    category: 'Environment',
    maxParticipants: 200,
    currentParticipants: 0,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fclean_india.png?alt=media&token=token7',
    requirements: [
      'Comfortable clothing and shoes',
      'Basic cleaning supplies',
      'Water bottle',
      'Face mask'
    ],
    status: 'upcoming',
    causes: ['Environment', 'Community Development'],
    registrationDeadline: new Date('2024-04-20T23:59:59'),
    contactEmail: 'events@goonj.org',
    contactPhone: '+91-9876543211'
  },
  {
    title: 'Women Empowerment Workshop',
    description: 'A comprehensive workshop focusing on women\'s rights, financial literacy, skill development, and self-defense training. The workshop aims to empower women with knowledge and skills for personal and professional growth.',
    date: new Date('2024-05-10T10:00:00'),
    endDate: new Date('2024-05-12T17:00:00'),
    location: 'Ahmedabad, Gujarat',
    organizer: 'sewa_id', // Will be replaced with actual ID
    organizerName: 'SEWA',
    category: 'Women Empowerment',
    maxParticipants: 100,
    currentParticipants: 0,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fwomen_empowerment.png?alt=media&token=token8',
    requirements: [
      'Interest in women\'s rights and empowerment',
      'Basic understanding of financial concepts',
      'Open-mindedness and respect for diversity'
    ],
    status: 'upcoming',
    causes: ['Women Empowerment', 'Education', 'Economic Development'],
    registrationDeadline: new Date('2024-05-05T23:59:59'),
    contactEmail: 'events@sewa.org',
    contactPhone: '+91-9876543212'
  },
  {
    title: 'Mid-Day Meal Program Launch',
    description: 'Join us in launching our expanded mid-day meal program to reach more schools in rural areas. The event includes program inauguration, volunteer training, and community engagement activities.',
    date: new Date('2024-06-01T09:00:00'),
    endDate: new Date('2024-06-01T17:00:00'),
    location: 'Hyderabad, Telangana',
    organizer: 'akshayapatra_id', // Will be replaced with actual ID
    organizerName: 'Akshaya Patra Foundation',
    category: 'Hunger Relief',
    maxParticipants: 75,
    currentParticipants: 0,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fmidday_meal.png?alt=media&token=token9',
    requirements: [
      'Food safety awareness',
      'Basic cooking skills',
      'Team spirit',
      'Commitment to food hygiene'
    ],
    status: 'upcoming',
    causes: ['Child Welfare', 'Hunger Relief', 'Education'],
    registrationDeadline: new Date('2024-05-25T23:59:59'),
    contactEmail: 'events@akshayapatra.org',
    contactPhone: '+91-9876543213'
  },
  {
    title: 'Child Rights Awareness Campaign',
    description: 'A comprehensive campaign to raise awareness about child rights, child labor laws, and child protection measures. The campaign includes street plays, workshops, and distribution of educational materials.',
    date: new Date('2024-07-15T10:00:00'),
    endDate: new Date('2024-07-20T18:00:00'),
    location: 'Mumbai, Maharashtra',
    organizer: 'cry_id', // Will be replaced with actual ID
    organizerName: 'CRY',
    category: 'Child Welfare',
    maxParticipants: 100,
    currentParticipants: 0,
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fchild_rights.png?alt=media&token=token10',
    requirements: [
      'Understanding of child rights',
      'Good communication skills',
      'Experience in street theater (optional)',
      'Passion for child welfare'
    ],
    status: 'upcoming',
    causes: ['Child Welfare', 'Education', 'Community Development'],
    registrationDeadline: new Date('2024-07-10T23:59:59'),
    contactEmail: 'events@cry.org',
    contactPhone: '+91-9876543214'
  }
];

// Add events to Firebase
const addEvents = async (ngoIds) => {
  try {
    console.log('Adding events to Firebase...');
    
    for (const event of events) {
      // Replace placeholder organizer ID with actual ID
      const organizerKey = event.organizerName.toLowerCase().replace(/\s+/g, '_');
      if (ngoIds[organizerKey]) {
        event.organizer = ngoIds[organizerKey];
      }
      
      const docRef = await addDoc(collection(db, 'events'), event);
      console.log(`Added event "${event.title}" with ID: ${docRef.id}`);
    }
    
    console.log('All events added successfully!');
  } catch (error) {
    console.error('Error adding events:', error);
  }
};

// Main function
const main = async () => {
  try {
    // This would normally come from the addIndianData.js script
    // For simplicity, we're using placeholder IDs
    const ngoIds = {
      'goonj': 'goonj_id',
      'teach_for_india': 'teachforindia_id',
      'akshaya_patra_foundation': 'akshayapatra_id',
      'sewa': 'sewa_id',
      'cry': 'cry_id'
    };
    
    await addEvents(ngoIds);
    console.log('All data added successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
  }
};

// Run the script
main(); 