import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Helper function to check if Firestore is available and handle errors
const checkFirestore = () => {
  if (!db) {
    console.error("Firestore is not initialized properly");
    throw new Error("Firebase connection error: Firestore is not available");
  }
};

/**
 * Marks a student as attended for a session
 * @param sessionId - The ID of the session
 * @param studentId - The ID of the student
 * @param classId - The ID of the class
 * @returns Promise<void>
 */
export const markStudentAsAttended = async (
  sessionId: string,
  studentId: string,
  classId: string
): Promise<void> => {
  try {
    checkFirestore();
    
    const attendanceRef = doc(db, `sessions/${sessionId}/attendance/${studentId}`);
    const now = serverTimestamp();
    
    // Create or update the attendance record
    await setDoc(attendanceRef, {
      classId: classId,
      checkInTime: now,
      status: 'verified',
      isGpsVerified: true, // For admin purposes, we'll set this to true
      lastUpdated: now
    }, { merge: true });
    
  } catch (error) {
    console.error(`Error marking student ${studentId} as attended:`, error);
    throw error;
  }
};

/**
 * Marks a student as not attended for a session
 * @param sessionId - The ID of the session
 * @param studentId - The ID of the student
 * @returns Promise<void>
 */
export const markStudentAsNotAttended = async (
  sessionId: string,
  studentId: string
): Promise<void> => {
  try {
    checkFirestore();
    
    const attendanceRef = doc(db, `sessions/${sessionId}/attendance/${studentId}`);
    const attendanceDoc = await getDoc(attendanceRef);
    
    // If the attendance record exists, remove it
    if (attendanceDoc.exists()) {
      await deleteDoc(attendanceRef);
    }
    
  } catch (error) {
    console.error(`Error marking student ${studentId} as not attended:`, error);
    throw error;
  }
};

/**
 * Toggles a student's attendance status for a session
 * @param sessionId - The ID of the session
 * @param studentId - The ID of the student
 * @param classId - The ID of the class
 * @returns Promise<boolean> - Returns true if student is now attended, false if not attended
 */
export const toggleStudentAttendance = async (
  sessionId: string,
  studentId: string,
  classId: string
): Promise<boolean> => {
  try {
    checkFirestore();
    
    const attendanceRef = doc(db, `sessions/${sessionId}/attendance/${studentId}`);
    const attendanceDoc = await getDoc(attendanceRef);
    
    // If the attendance record exists, remove it
    if (attendanceDoc.exists()) {
      await deleteDoc(attendanceRef);
      return false;
    } else {
      // Otherwise, mark as attended
      const now = serverTimestamp();
      await setDoc(attendanceRef, {
        classId: classId,
        checkInTime: now,
        status: 'verified',
        isGpsVerified: true, // For admin purposes, we'll set this to true
        lastUpdated: now
      });
      return true;
    }
    
  } catch (error) {
    console.error(`Error toggling attendance for student ${studentId}:`, error);
    throw error;
  }
};

/**
 * Gets the attendance status for a student in a session
 * @param sessionId - The ID of the session
 * @param studentId - The ID of the student
 * @returns Promise<boolean> - Returns true if student is attended, false if not
 */
export const isStudentAttended = async (
  sessionId: string,
  studentId: string
): Promise<boolean> => {
  try {
    checkFirestore();
    
    const attendanceRef = doc(db, `sessions/${sessionId}/attendance/${studentId}`);
    const attendanceDoc = await getDoc(attendanceRef);
    
    return attendanceDoc.exists();
    
  } catch (error) {
    console.error(`Error checking attendance for student ${studentId}:`, error);
    throw error;
  }
}; 