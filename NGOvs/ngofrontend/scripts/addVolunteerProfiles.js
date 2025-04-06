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

// Volunteer profiles data
const volunteers = [
  {
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'volunteer',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/volunteer_avatars%2Frahul_sharma.jpg?alt=media&token=token1',
    bio: 'Passionate about education and community development. Have been volunteering with Teach For India for 2 years.',
    location: 'Mumbai, Maharashtra',
    interests: ['Education', 'Community Development', 'Youth Empowerment'],
    skills: ['Teaching', 'Event Management', 'Public Speaking'],
    volunteerHours: 120,
    connectedNGOs: ['teachforindia_id'], // Will be replaced with actual IDs
    pendingConnections: [],
    achievements: [
      {
        title: 'Best Volunteer Award',
        description: 'Recognized for outstanding contribution to education initiatives',
        date: new Date('2023-05-15')
      }
    ],
    availability: {
      weekdays: true,
      weekends: true,
      preferredTime: 'Evening'
    }
  },
  {
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    role: 'volunteer',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/volunteer_avatars%2Fpriya_patel.jpg?alt=media&token=token2',
    bio: 'Environmental activist and sustainability enthusiast. Working towards a cleaner and greener India.',
    location: 'Delhi, NCR',
    interests: ['Environment', 'Sustainability', 'Clean Energy'],
    skills: ['Environmental Science', 'Community Outreach', 'Project Management'],
    volunteerHours: 85,
    connectedNGOs: ['goonj_id'], // Will be replaced with actual IDs
    pendingConnections: [],
    achievements: [
      {
        title: 'Green Champion',
        description: 'Led successful tree plantation drives in Delhi',
        date: new Date('2023-07-10')
      }
    ],
    availability: {
      weekdays: false,
      weekends: true,
      preferredTime: 'Morning'
    }
  },
  {
    name: 'Amit Kumar',
    email: 'amit.kumar@example.com',
    role: 'volunteer',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/volunteer_avatars%2Famit_kumar.jpg?alt=media&token=token3',
    bio: 'Social worker with focus on child welfare and education. Believe in creating positive change through community engagement.',
    location: 'Bangalore, Karnataka',
    interests: ['Child Welfare', 'Education', 'Social Work'],
    skills: ['Child Care', 'Counseling', 'Team Leadership'],
    volunteerHours: 150,
    connectedNGOs: ['cry_id'], // Will be replaced with actual IDs
    pendingConnections: [],
    achievements: [
      {
        title: 'Community Impact Award',
        description: 'Recognized for exceptional work in child welfare programs',
        date: new Date('2023-08-20')
      }
    ],
    availability: {
      weekdays: true,
      weekends: true,
      preferredTime: 'Flexible'
    }
  },
  {
    name: 'Neha Gupta',
    email: 'neha.gupta@example.com',
    role: 'volunteer',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/volunteer_avatars%2Fneha_gupta.jpg?alt=media&token=token4',
    bio: 'Women empowerment advocate and skill development trainer. Passionate about creating opportunities for women in rural areas.',
    location: 'Ahmedabad, Gujarat',
    interests: ['Women Empowerment', 'Skill Development', 'Rural Development'],
    skills: ['Training', 'Workshop Facilitation', 'Content Creation'],
    volunteerHours: 95,
    connectedNGOs: ['sewa_id'], // Will be replaced with actual IDs
    pendingConnections: [],
    achievements: [
      {
        title: 'Women Empowerment Champion',
        description: 'Successfully trained 100+ women in vocational skills',
        date: new Date('2023-09-05')
      }
    ],
    availability: {
      weekdays: true,
      weekends: false,
      preferredTime: 'Morning'
    }
  },
  {
    name: 'Rajesh Verma',
    email: 'rajesh.verma@example.com',
    role: 'volunteer',
    avatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/volunteer_avatars%2Frajesh_verma.jpg?alt=media&token=token5',
    bio: 'Food security advocate and community kitchen volunteer. Working towards eliminating hunger and ensuring food access for all.',
    location: 'Hyderabad, Telangana',
    interests: ['Hunger Relief', 'Food Security', 'Community Service'],
    skills: ['Logistics', 'Team Management', 'Community Outreach'],
    volunteerHours: 200,
    connectedNGOs: ['akshayapatra_id'], // Will be replaced with actual IDs
    pendingConnections: [],
    achievements: [
      {
        title: 'Hunger Relief Hero',
        description: 'Contributed to serving 1 million meals to school children',
        date: new Date('2023-10-12')
      }
    ],
    availability: {
      weekdays: true,
      weekends: true,
      preferredTime: 'Early Morning'
    }
  }
];

// Add volunteers to Firebase
const addVolunteers = async (ngoIds) => {
  try {
    console.log('Adding volunteer profiles to Firebase...');
    
    for (const volunteer of volunteers) {
      // Replace placeholder NGO IDs with actual IDs
      if (volunteer.connectedNGOs.length > 0) {
        const ngoKey = volunteer.connectedNGOs[0].split('_')[0];
        if (ngoIds[ngoKey]) {
          volunteer.connectedNGOs = [ngoIds[ngoKey]];
        }
      }
      
      const docRef = await addDoc(collection(db, 'users'), volunteer);
      console.log(`Added volunteer ${volunteer.name} with ID: ${docRef.id}`);
    }
    
    console.log('All volunteer profiles added successfully!');
  } catch (error) {
    console.error('Error adding volunteer profiles:', error);
  }
};

// Main function
const main = async () => {
  try {
    // This would normally come from the addIndianData.js script
    // For simplicity, we're using placeholder IDs
    const ngoIds = {
      'goonj': 'goonj_id',
      'teachforindia': 'teachforindia_id',
      'akshayapatra': 'akshayapatra_id',
      'sewa': 'sewa_id',
      'cry': 'cry_id'
    };
    
    await addVolunteers(ngoIds);
    console.log('All data added successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
  }
};

// Run the script
main(); 