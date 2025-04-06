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

// Social feed posts data
const posts = [
  {
    content: 'Just completed a week-long education campaign in rural Maharashtra! We reached over 500 children and distributed educational materials to 10 schools. Thank you to all the volunteers who made this possible! #EducationForAll #TeachForIndia',
    author: 'Teach For India',
    authorId: 'teachforindia_id', // Will be replaced with actual ID
    authorRole: 'ngo_admin',
    authorAvatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fteachforindia.png?alt=media&token=token2',
    timestamp: new Date('2023-06-20T14:30:00'),
    likes: 45,
    comments: [
      {
        content: 'Amazing work! The impact you\'re making is incredible.',
        author: 'Rahul Sharma',
        authorId: 'user1',
        timestamp: new Date('2023-06-20T15:45:00')
      },
      {
        content: 'Would love to volunteer for your next campaign!',
        author: 'Priya Patel',
        authorId: 'user2',
        timestamp: new Date('2023-06-20T16:20:00')
      }
    ],
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Feducation_campaign.png?alt=media&token=token6',
    tags: ['Education', 'Community Development', 'Volunteer']
  },
  {
    content: 'Our Clean India Drive in Delhi was a huge success! Over 200 volunteers came together to clean public spaces and plant trees. We collected over 2 tons of waste and planted 500 saplings. Together, we can make our cities cleaner and greener! #CleanIndia #Goonj',
    author: 'Goonj',
    authorId: 'goonj_id', // Will be replaced with actual ID
    authorRole: 'ngo_admin',
    authorAvatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fgoonj.png?alt=media&token=token1',
    timestamp: new Date('2023-07-22T10:15:00'),
    likes: 78,
    comments: [
      {
        content: 'The city looks so much better! Thank you for organizing this.',
        author: 'Amit Kumar',
        authorId: 'user3',
        timestamp: new Date('2023-07-22T11:30:00')
      },
      {
        content: 'I participated and it was a great experience. Looking forward to the next drive!',
        author: 'Neha Gupta',
        authorId: 'user4',
        timestamp: new Date('2023-07-22T12:45:00')
      }
    ],
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fclean_india.png?alt=media&token=token7',
    tags: ['Environment', 'Community Development', 'Volunteer']
  },
  {
    content: 'Our Women Empowerment Workshop in Ahmedabad was a transformative experience for all participants. We covered topics like financial literacy, skill development, and self-defense. The women left with new skills and renewed confidence. #WomenEmpowerment #SEWA',
    author: 'SEWA',
    authorId: 'sewa_id', // Will be replaced with actual ID
    authorRole: 'ngo_admin',
    authorAvatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fsewa.png?alt=media&token=token4',
    timestamp: new Date('2023-08-07T16:45:00'),
    likes: 92,
    comments: [
      {
        content: 'The self-defense training was particularly impactful. Thank you for organizing this!',
        author: 'Meera Patel',
        authorId: 'user5',
        timestamp: new Date('2023-08-07T17:20:00')
      },
      {
        content: 'I learned so much about financial planning. This will help me start my own small business.',
        author: 'Lakshmi Devi',
        authorId: 'user6',
        timestamp: new Date('2023-08-07T18:10:00')
      }
    ],
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fwomen_empowerment.png?alt=media&token=token8',
    tags: ['Women Empowerment', 'Education', 'Economic Development']
  },
  {
    content: 'Today we served our 3 billionth meal to school children across India! This milestone represents our commitment to eliminating classroom hunger and ensuring that no child goes to school on an empty stomach. Thank you to all our donors and volunteers who made this possible. #AkshayaPatra #MidDayMeal',
    author: 'Akshaya Patra Foundation',
    authorId: 'akshayapatra_id', // Will be replaced with actual ID
    authorRole: 'ngo_admin',
    authorAvatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fakshayapatra.png?alt=media&token=token3',
    timestamp: new Date('2023-09-15T09:30:00'),
    likes: 156,
    comments: [
      {
        content: 'Congratulations on this incredible achievement! Your work is truly inspiring.',
        author: 'Rajesh Verma',
        authorId: 'user7',
        timestamp: new Date('2023-09-15T10:15:00')
      },
      {
        content: 'I\'ve been volunteering with Akshaya Patra for 5 years now, and it\'s been the most rewarding experience. Keep up the great work!',
        author: 'Anita Desai',
        authorId: 'user8',
        timestamp: new Date('2023-09-15T11:30:00')
      }
    ],
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fmidday_meal.png?alt=media&token=token9',
    tags: ['Child Welfare', 'Hunger Relief', 'Education']
  },
  {
    content: 'Our Child Rights Awareness Campaign in Mumbai reached over 10,000 people! We conducted street plays, workshops, and distributed educational materials about child rights, child labor, and child protection laws. Together, we can create a safer and better future for our children. #ChildRights #CRY',
    author: 'CRY',
    authorId: 'cry_id', // Will be replaced with actual ID
    authorRole: 'ngo_admin',
    authorAvatar: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/ngo_logos%2Fcry.png?alt=media&token=token5',
    timestamp: new Date('2023-10-05T13:20:00'),
    likes: 112,
    comments: [
      {
        content: 'The street plays were so impactful! They really helped people understand the issues in a relatable way.',
        author: 'Vikram Singh',
        authorId: 'user9',
        timestamp: new Date('2023-10-05T14:05:00')
      },
      {
        content: 'I didn\'t know about many of these child rights before. Thank you for spreading awareness!',
        author: 'Sneha Reddy',
        authorId: 'user10',
        timestamp: new Date('2023-10-05T15:30:00')
      }
    ],
    image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fchild_rights.png?alt=media&token=token10',
    tags: ['Child Welfare', 'Education', 'Community Development']
  }
];

// Add posts to Firebase
const addPosts = async (ngoIds) => {
  try {
    console.log('Adding social feed posts to Firebase...');
    
    for (const post of posts) {
      // Replace placeholder authorId with actual NGO ID
      const authorKey = post.author.toLowerCase().replace(/\s+/g, '_');
      if (ngoIds[authorKey]) {
        post.authorId = ngoIds[authorKey];
      }
      
      const docRef = await addDoc(collection(db, 'posts'), post);
      console.log(`Added post by ${post.author} with ID: ${docRef.id}`);
    }
    
    console.log('All posts added successfully!');
  } catch (error) {
    console.error('Error adding posts:', error);
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
    
    await addPosts(ngoIds);
    console.log('All data added successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
  }
};

// Run the script
main(); 