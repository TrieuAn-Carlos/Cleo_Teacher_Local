// scripts/seedEmulator.js
// Run this script to add test data to your Firebase emulator

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  Timestamp, 
  connectFirestoreEmulator 
} = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCYyDDKuRUkzrULyCfBJGSVvOgHlTOQdTc",
  authDomain: "test-for-web-project-cb2d8.firebaseapp.com",
  projectId: "test-for-web-project-cb2d8",
  storageBucket: "test-for-web-project-cb2d8.appspot.com",
  messagingSenderId: "772100504464",
  appId: "1:772100504464:web:d7a5d12c67c0ee3b39c20f"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Connect to emulator
connectFirestoreEmulator(db, 'localhost', 8002);

async function seedData() {
  try {
    console.log('🌱 Seeding Firestore emulator with test data...');

    // Create a test teacher user
    const teacherId = 'teacher123';
    const teacherData = {
      uid: teacherId,
      email: 'teacher@example.com',
      displayName: 'Test Teacher',
      role: 'teacher',
      created_at: Timestamp.now()
    };
    await setDoc(doc(db, 'users', teacherId), teacherData);
    console.log('✅ Created test teacher user');

    // Create test classes
    const classData = [
      {
        name: 'Introduction to Computer Science',
        teacherId: teacherId,
        joinCode: 'CS101',
        subject: 'Computer Science',
        room: 'Room 101',
        created_at: Timestamp.now(),
        isArchived: false
      },
      {
        name: 'Web Development Fundamentals',
        teacherId: teacherId,
        joinCode: 'WEB201',
        subject: 'Web Development',
        room: 'Room 202',
        created_at: Timestamp.now(),
        isArchived: false
      },
      {
        name: 'Mobile App Development',
        teacherId: teacherId,
        joinCode: 'MOB301',
        subject: 'Mobile Development',
        room: 'Room 303',
        created_at: Timestamp.now(),
        isArchived: false
      }
    ];

    for (let i = 0; i < classData.length; i++) {
      const classId = `class${i+1}`;
      await setDoc(doc(db, 'classes', classId), classData[i]);
      console.log(`✅ Created class: ${classData[i].name}`);
    }

    console.log('🎉 Finished seeding data!');
    console.log('\nTest Teacher ID:', teacherId);
    console.log('Use this ID in the Dashboard page or with the DemoDataCreator tool');

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

seedData(); 