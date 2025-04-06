const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, doc, setDoc, updateDoc } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyB192mO4KQ8phO-R92jpBbKYHSBtFNdO_8',
  authDomain: 'ngoplatform-48c72.firebaseapp.com',
  projectId: 'ngoplatform-48c72',
  storageBucket: 'ngoplatform-48c72.firebasestorage.app',
  messagingSenderId: '1066528688543',
  appId: '1:1066528688543:web:830bd661060a0d5685d5aa',
  measurementId: 'G-8PVJVBHBF1'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Complete NGO data with detailed information
const ngoData = [
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
    contactPhone: '+91-11-26972351',
    password: 'Goonj@123',
    events: [
      {
        title: 'Clean India Drive - Delhi',
        description: 'A city-wide cleanliness drive to make Delhi cleaner and greener. We will be organizing teams to clean public spaces, plant trees, and create awareness about waste management.',
        date: '2023-07-20T08:00:00',
        location: 'Delhi',
        category: 'Environment',
        maxParticipants: 100,
        currentParticipants: 45,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fclean_india.png?alt=media&token=token7',
        requirements: 'Volunteers should bring their own gloves and masks. Refreshments will be provided.',
        status: 'upcoming',
        causes: ['Environment', 'Community Development']
      },
      {
        title: 'Cloth for Work Campaign',
        description: 'Join us in our unique initiative where communities work on local development projects and receive clothing and other material as a reward.',
        date: '2023-08-15T09:00:00',
        location: 'Rural Areas, Delhi NCR',
        category: 'Community Development',
        maxParticipants: 50,
        currentParticipants: 20,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fcloth_for_work.png?alt=media&token=token11',
        requirements: 'Volunteers should be comfortable working in rural areas and have good communication skills.',
        status: 'upcoming',
        causes: ['Community Development', 'Education']
      }
    ]
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
    contactPhone: '+91-22-2493-7474',
    password: 'TeachForIndia@123',
    events: [
      {
        title: 'Education for All - Rural India Campaign',
        description: 'Join us for a week-long campaign to promote education in rural areas of Maharashtra. We will be conducting workshops, distributing educational materials, and setting up temporary learning centers.',
        date: '2023-06-15T09:00:00',
        location: 'Mumbai, Maharashtra',
        category: 'Education',
        maxParticipants: 50,
        currentParticipants: 12,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Feducation_campaign.png?alt=media&token=token6',
        requirements: 'Volunteers should be comfortable working with children and have basic teaching skills.',
        status: 'upcoming',
        causes: ['Education', 'Community Development']
      },
      {
        title: 'Teacher Training Workshop',
        description: 'A comprehensive training program for volunteers interested in teaching. Learn effective teaching methodologies, classroom management, and how to engage with students from diverse backgrounds.',
        date: '2023-09-05T10:00:00',
        location: 'Mumbai, Maharashtra',
        category: 'Education',
        maxParticipants: 30,
        currentParticipants: 15,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fteacher_training.png?alt=media&token=token12',
        requirements: 'Open to all with a passion for education. No prior teaching experience required.',
        status: 'upcoming',
        causes: ['Education', 'Youth Development']
      }
    ]
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
    contactPhone: '+91-80-30143400',
    password: 'AkshayaPatra@123',
    events: [
      {
        title: 'Mid-Day Meal Program Volunteer Drive',
        description: 'Join us in our mission to provide nutritious meals to school children. We need volunteers to help with food preparation, serving, and creating awareness about the importance of nutrition.',
        date: '2023-09-10T07:00:00',
        location: 'Bangalore, Karnataka',
        category: 'Child Welfare',
        maxParticipants: 40,
        currentParticipants: 22,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fmidday_meal.png?alt=media&token=token9',
        requirements: 'Volunteers should be available for at least 4 hours. Food handling certification preferred.',
        status: 'upcoming',
        causes: ['Child Welfare', 'Hunger Relief']
      },
      {
        title: 'Nutrition Awareness Campaign',
        description: 'A city-wide campaign to raise awareness about the importance of nutrition for children\'s development. We will be conducting workshops, distributing educational materials, and organizing community events.',
        date: '2023-10-15T09:00:00',
        location: 'Bangalore, Karnataka',
        category: 'Child Welfare',
        maxParticipants: 60,
        currentParticipants: 30,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fnutrition_campaign.png?alt=media&token=token13',
        requirements: 'Volunteers should have good communication skills and be passionate about child nutrition.',
        status: 'upcoming',
        causes: ['Child Welfare', 'Education']
      }
    ]
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
    contactPhone: '+91-79-25506444',
    password: 'Sewa@123',
    events: [
      {
        title: 'Women Empowerment Workshop',
        description: 'A two-day workshop focused on skill development, financial literacy, and self-defense training for women from underprivileged backgrounds.',
        date: '2023-08-05T10:00:00',
        location: 'Ahmedabad, Gujarat',
        category: 'Women Empowerment',
        maxParticipants: 30,
        currentParticipants: 18,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fwomen_empowerment.png?alt=media&token=token8',
        requirements: 'Open to all women. Registration required.',
        status: 'upcoming',
        causes: ['Women Empowerment', 'Education']
      },
      {
        title: 'Skill Development Program',
        description: 'A month-long program to teach women traditional crafts, digital skills, and entrepreneurship basics to help them start their own businesses.',
        date: '2023-11-01T09:00:00',
        location: 'Ahmedabad, Gujarat',
        category: 'Women Empowerment',
        maxParticipants: 25,
        currentParticipants: 12,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fskill_development.png?alt=media&token=token14',
        requirements: 'Women from underprivileged backgrounds. Commitment to attend all sessions required.',
        status: 'upcoming',
        causes: ['Women Empowerment', 'Economic Development']
      }
    ]
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
    contactPhone: '+91-22-23063647',
    password: 'Cry@123',
    events: [
      {
        title: 'Child Rights Awareness Campaign',
        description: 'A month-long campaign to create awareness about child rights, child labor, and child protection laws. We will be conducting street plays, workshops, and distributing educational materials.',
        date: '2023-10-01T11:00:00',
        location: 'Mumbai, Maharashtra',
        category: 'Child Welfare',
        maxParticipants: 60,
        currentParticipants: 35,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fchild_rights.png?alt=media&token=token10',
        requirements: 'Volunteers should have good communication skills and be passionate about child rights.',
        status: 'upcoming',
        causes: ['Child Welfare', 'Education']
      },
      {
        title: 'Education for Street Children',
        description: 'Join us in our initiative to provide basic education and healthcare to street children. We will be setting up temporary learning centers and health camps in various locations across Mumbai.',
        date: '2023-12-05T09:00:00',
        location: 'Mumbai, Maharashtra',
        category: 'Child Welfare',
        maxParticipants: 40,
        currentParticipants: 20,
        image: 'https://firebasestorage.googleapis.com/v0/b/ngo-collaboration-platform.appspot.com/o/event_images%2Fstreet_children.png?alt=media&token=token15',
        requirements: 'Volunteers should be comfortable working with children from challenging backgrounds.',
        status: 'upcoming',
        causes: ['Child Welfare', 'Education', 'Healthcare']
      }
    ]
  }
];

// Create NGO accounts and add data
const setupNGOData = async () => {
  try {
    console.log('Setting up NGO data...');
    const ngoIds = {};
    
    for (const ngo of ngoData) {
      try {
        // Create authentication account
        const userCredential = await createUserWithEmailAndPassword(auth, ngo.contactEmail, ngo.password);
        console.log(`Created auth account for ${ngo.name}`);
        
        // Add NGO data to Firestore
        const ngoDoc = {
          uid: userCredential.user.uid,
          name: ngo.name,
          email: ngo.contactEmail,
          role: 'ngo_admin',
          description: ngo.description,
          causes: ngo.causes,
          location: ngo.location,
          volunteerCount: ngo.volunteerCount,
          logo: ngo.logo,
          website: ngo.website,
          foundedYear: ngo.foundedYear,
          impact: ngo.impact,
          contactEmail: ngo.contactEmail,
          contactPhone: ngo.contactPhone,
          createdAt: new Date()
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), ngoDoc);
        console.log(`Added NGO data for ${ngo.name}`);
        
        // Store NGO ID for events
        ngoIds[ngo.name] = userCredential.user.uid;
        
        // Add events for this NGO
        for (const event of ngo.events) {
          const eventDoc = {
            ...event,
            organizer: ngo.name,
            organizerId: userCredential.user.uid,
            createdAt: new Date()
          };
          
          const eventRef = await addDoc(collection(db, 'events'), eventDoc);
          console.log(`Added event: ${event.title} for ${ngo.name}`);
          
          // Add to suggested events collection
          await addDoc(collection(db, 'suggestedEvents'), {
            eventId: eventRef.id,
            ngoId: userCredential.user.uid,
            ngoName: ngo.name,
            title: event.title,
            date: event.date,
            location: event.location,
            image: event.image,
            createdAt: new Date()
          });
          console.log(`Added to suggested events: ${event.title}`);
        }
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`Account already exists for ${ngo.name}, updating data...`);
          
          // Get existing user ID
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', ngo.contactEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const existingUserId = querySnapshot.docs[0].id;
            ngoIds[ngo.name] = existingUserId;
            
            // Update NGO data
            await updateDoc(doc(db, 'users', existingUserId), {
              name: ngo.name,
              description: ngo.description,
              causes: ngo.causes,
              location: ngo.location,
              volunteerCount: ngo.volunteerCount,
              logo: ngo.logo,
              website: ngo.website,
              foundedYear: ngo.foundedYear,
              impact: ngo.impact,
              contactPhone: ngo.contactPhone
            });
            console.log(`Updated NGO data for ${ngo.name}`);
            
            // Add events for this NGO
            for (const event of ngo.events) {
              const eventDoc = {
                ...event,
                organizer: ngo.name,
                organizerId: existingUserId,
                createdAt: new Date()
              };
              
              const eventRef = await addDoc(collection(db, 'events'), eventDoc);
              console.log(`Added event: ${event.title} for ${ngo.name}`);
              
              // Add to suggested events collection
              await addDoc(collection(db, 'suggestedEvents'), {
                eventId: eventRef.id,
                ngoId: existingUserId,
                ngoName: ngo.name,
                title: event.title,
                date: event.date,
                location: event.location,
                image: event.image,
                createdAt: new Date()
              });
              console.log(`Added to suggested events: ${event.title}`);
            }
          }
        } else {
          console.error(`Error setting up ${ngo.name}:`, error);
        }
      }
    }
    
    console.log('NGO data setup completed!');
    return ngoIds;
  } catch (error) {
    console.error('Error in setupNGOData:', error);
    return {};
  }
};

// Run the script
setupNGOData(); 