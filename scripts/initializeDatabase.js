const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

// Initialize Firebase Admin SDK
try {
  // Check if already initialized
  admin.app();
} catch (error) {
  // Initialize app if not already initialized
  admin.initializeApp({
    projectId: 'cleo-dev-f31ac'
  });
}

const db = admin.firestore();

/**
 * Creates a test user
 * @param {string} role - Either 'teacher' or 'student'
 * @returns {Object} - The created user data with ID
 */
async function createTestUser(role) {
  const userRef = db.collection('users').doc();
  const userData = {
    uid: userRef.id,
    email: `test-${role}-${uuidv4().slice(0, 6)}@example.com`,
    displayName: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    role: role,
    created_at: admin.firestore.FieldValue.serverTimestamp()
  };

  await userRef.set(userData);
  console.log(`Created test ${role} with ID: ${userRef.id}`);
  return { id: userRef.id, ...userData };
}

/**
 * Creates a test class
 * @param {string} teacherId - The teacher's user ID
 * @returns {Object} - The created class data with ID
 */
async function createTestClass(teacherId) {
  const classRef = db.collection('classes').doc();
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const classData = {
    name: `Test Class ${Math.floor(Math.random() * 100)}`,
    teacherId: teacherId,
    joinCode: joinCode,
    subject: 'Computer Science',
    room: `Room ${Math.floor(Math.random() * 100)}`,
    created_at: admin.firestore.FieldValue.serverTimestamp(),
    isArchived: false
  };

  await classRef.set(classData);
  console.log(`Created test class with ID: ${classRef.id}, join code: ${joinCode}`);
  return { id: classRef.id, ...classData };
}

/**
 * Adds a student to a class
 * @param {string} classId - The class ID
 * @param {string} studentId - The student's user ID
 */
async function addStudentToClass(classId, studentId) {
  const studentClassRef = db.collection('classes').doc(classId).collection('students').doc(studentId);
  
  await studentClassRef.set({
    joinDate: admin.firestore.FieldValue.serverTimestamp()
  });

  // Create a userClasses record for easy lookups
  const userClassesRef = db.collection('userClasses').doc(studentId).collection('classes').doc(classId);
  
  // Get class info to denormalize
  const classDoc = await db.collection('classes').doc(classId).get();
  const classData = classDoc.data();
  
  // Get teacher info to denormalize
  const teacherDoc = await db.collection('users').doc(classData.teacherId).get();
  const teacherData = teacherDoc.data();
  
  await userClassesRef.set({
    className: classData.name,
    teacherName: teacherData.displayName,
    joinDate: admin.firestore.FieldValue.serverTimestamp()
  });
  
  console.log(`Added student ${studentId} to class ${classId}`);
}

/**
 * Creates a test session
 * @param {string} classId - The class ID
 * @param {string} teacherId - The teacher's user ID
 * @returns {Object} - The created session data with ID
 */
async function createTestSession(classId, teacherId) {
  const sessionRef = db.collection('sessions').doc();
  
  const sessionData = {
    classId: classId,
    teacherId: teacherId,
    startTime: admin.firestore.Timestamp.fromDate(new Date()),
    endTime: null,
    status: 'active',
    location: new admin.firestore.GeoPoint(10.762622, 106.660172), // Example location (Ho Chi Minh City)
    radius: 100, // 100 meters
    created_at: admin.firestore.FieldValue.serverTimestamp()
  };

  await sessionRef.set(sessionData);
  console.log(`Created test session with ID: ${sessionRef.id}`);
  return { id: sessionRef.id, ...sessionData };
}

/**
 * Main function to initialize the database with test data
 */
async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Create a test teacher
    const teacher = await createTestUser('teacher');
    
    // Create test classes
    const class1 = await createTestClass(teacher.id);
    const class2 = await createTestClass(teacher.id);
    
    // Create test students
    const student1 = await createTestUser('student');
    const student2 = await createTestUser('student');
    
    // Add students to classes
    await addStudentToClass(class1.id, student1.id);
    await addStudentToClass(class1.id, student2.id);
    await addStudentToClass(class2.id, student1.id);
    
    // Create a test session
    const session = await createTestSession(class1.id, teacher.id);
    
    console.log('Database initialization completed successfully!');
    console.log('\nTest Data Summary:');
    console.log(`Teacher ID: ${teacher.id}`);
    console.log(`Class IDs: ${class1.id}, ${class2.id}`);
    console.log(`Student IDs: ${student1.id}, ${student2.id}`);
    console.log(`Session ID: ${session.id}`);
    
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Run the initialization function
initializeDatabase(); 