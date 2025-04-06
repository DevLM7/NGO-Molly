const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/firestore');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

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
const storage = getStorage(app);

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = ['temp/ngo_logos', 'temp/event_images'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Download image from URL
const downloadImage = async (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath));
      } else {
        response.resume();
        reject(new Error(`Request Failed With a Status Code: ${response.statusCode}`));
      }
    });
  });
};

// Upload image to Firebase Storage
const uploadImage = async (filepath, destination) => {
  const file = fs.readFileSync(filepath);
  const storageRef = ref(storage, destination);
  
  try {
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    console.log(`Uploaded ${destination} successfully. URL: ${url}`);
    return url;
  } catch (error) {
    console.error(`Error uploading ${destination}:`, error);
    return null;
  }
};

// NGO logo URLs
const ngoLogos = [
  {
    name: 'goonj',
    url: 'https://goonj.org/wp-content/uploads/2020/05/goonj-logo.png'
  },
  {
    name: 'teachforindia',
    url: 'https://www.teachforindia.org/assets/images/tfi-logo.png'
  },
  {
    name: 'akshayapatra',
    url: 'https://www.akshayapatra.org/images/akshayapatra-logo.png'
  },
  {
    name: 'sewa',
    url: 'https://www.sewa.org/images/sewa-logo.png'
  },
  {
    name: 'cry',
    url: 'https://www.cry.org/images/cry-logo.png'
  }
];

// Event image URLs
const eventImages = [
  {
    name: 'education_campaign',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    name: 'clean_india',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    name: 'women_empowerment',
    url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    name: 'midday_meal',
    url: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    name: 'child_rights',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

// Process NGO logos
const processNgoLogos = async () => {
  console.log('Processing NGO logos...');
  
  for (const logo of ngoLogos) {
    try {
      const filepath = path.join('temp/ngo_logos', `${logo.name}.png`);
      await downloadImage(logo.url, filepath);
      await uploadImage(filepath, `ngo_logos/${logo.name}.png`);
      fs.unlinkSync(filepath); // Delete temporary file
    } catch (error) {
      console.error(`Error processing NGO logo ${logo.name}:`, error);
    }
  }
  
  console.log('NGO logos processing completed.');
};

// Process event images
const processEventImages = async () => {
  console.log('Processing event images...');
  
  for (const image of eventImages) {
    try {
      const filepath = path.join('temp/event_images', `${image.name}.png`);
      await downloadImage(image.url, filepath);
      await uploadImage(filepath, `event_images/${image.name}.png`);
      fs.unlinkSync(filepath); // Delete temporary file
    } catch (error) {
      console.error(`Error processing event image ${image.name}:`, error);
    }
  }
  
  console.log('Event images processing completed.');
};

// Main function
const main = async () => {
  try {
    createDirectories();
    await processNgoLogos();
    await processEventImages();
    console.log('All images processed successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
  }
};

// Run the script
main(); 