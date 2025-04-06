import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBFTYhJtsMWDWhzfhUHyRxw4SYgAn2IZZc',
  authDomain: 'ngo-collaboration-platform.firebaseapp.com',
  projectId: 'ngo-collaboration-platform',
  storageBucket: 'ngo-collaboration-platform.appspot.com',
  messagingSenderId: '1234567890',
  appId: '1:1234567890:web:abcdef1234567890'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function approveAllApplications() {
  try {
    // Get Flying Gamer's user ID
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('name', '==', 'Flying Gamer'));
    const userSnapshot = await getDocs(userQuery);
    
    if (userSnapshot.empty) {
      console.log('User not found');
      return;
    }
    
    const userId = userSnapshot.docs[0].id;
    console.log('Found user:', userId);
    
    // Get all pending applications
    const applicationsRef = collection(db, 'applications');
    const pendingQuery = query(applicationsRef, 
      where('volunteerId', '==', userId),
      where('status', '==', 'pending')
    );
    
    const pendingSnapshot = await getDocs(pendingQuery);
    
    if (pendingSnapshot.empty) {
      console.log('No pending applications found');
      return;
    }
    
    console.log(`Found ${pendingSnapshot.size} pending applications`);
    
    // Approve each application
    for (const applicationDoc of pendingSnapshot.docs) {
      const application = applicationDoc.data();
      
      // Update application status
      await updateDoc(doc(db, 'applications', applicationDoc.id), {
        status: 'accepted',
        updatedAt: new Date()
      });
      
      // Add NGO to user's connected NGOs
      await updateDoc(doc(db, 'users', userId), {
        connectedNGOs: arrayUnion(application.ngoId)
      });
      
      console.log(`\nApproved application for NGO: ${application.ngoId}`);
      
      // Get NGO events
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(eventsRef, where('ngoId', '==', application.ngoId));
      const eventsSnapshot = await getDocs(eventsQuery);
      
      console.log(`Events for NGO ${application.ngoId}:`);
      eventsSnapshot.forEach(eventDoc => {
        const event = eventDoc.data();
        console.log(`- ${event.title} (${event.date})`);
        console.log(`  Description: ${event.description}`);
        console.log(`  Location: ${event.location}`);
        console.log(`  Status: ${event.status}`);
        console.log('---');
      });
    }
    
    console.log('\nAll applications approved successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

approveAllApplications(); 