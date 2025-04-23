import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebaseConfig';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';

export async function GET(request: Request) {
  try {
    // 1. Check if demo teacher already exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', 'demo-teacher@example.com'));
    const querySnapshot = await getDocs(q);
    
    let demoTeacher;
    
    // 2. If demo teacher doesn't exist, create one
    if (querySnapshot.empty) {
      // Create demo teacher
      const teacherData = {
        uid: 'demo-teacher-uid',
        email: 'demo-teacher@example.com',
        displayName: 'Demo Teacher',
        role: 'teacher',
        created_at: Timestamp.now()
      };
      
      const docRef = await addDoc(collection(db, 'users'), teacherData);
      demoTeacher = {
        id: docRef.id,
        ...teacherData
      };
      
      // Create demo classes
      const class1Data = {
        name: 'Demo Class 1',
        teacherId: docRef.id,
        joinCode: 'DEMO01',
        subject: 'Introduction to Computer Science',
        room: 'Room 101',
        created_at: Timestamp.now(),
        isArchived: false
      };
      
      const class2Data = {
        name: 'Demo Class 2',
        teacherId: docRef.id,
        joinCode: 'DEMO02',
        subject: 'Web Development',
        room: 'Room 102',
        created_at: Timestamp.now(),
        isArchived: false
      };
      
      // Add classes to Firestore
      await addDoc(collection(db, 'classes'), class1Data);
      await addDoc(collection(db, 'classes'), class2Data);
    } else {
      // Get existing demo teacher
      demoTeacher = {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      };
    }
    
    return NextResponse.json({
      success: true, 
      demoTeacher
    });
  } catch (error) {
    console.error('Error creating demo user:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create demo user'
    }, { status: 500 });
  }
} 