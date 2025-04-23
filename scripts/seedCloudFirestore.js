// scripts/seedCloudFirestore.js
// Run this script to add test data to your Cloud Firestore database

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  Timestamp, 
} = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAnhd1j8ws16y0X6iDuBcwbUdgHr9M_1II",
  authDomain: "cleo-dev-f31ac.firebaseapp.com",
  projectId: "cleo-dev-f31ac",
  storageBucket: "cleo-dev-f31ac.appspot.com",
  messagingSenderId: "48288193953",
  appId: "1:48288193953:web:de985ddf1b3f3d4ffe3fe0"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedData() {
  try {
    console.log('🌱 Seeding Cloud Firestore with test data...');

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