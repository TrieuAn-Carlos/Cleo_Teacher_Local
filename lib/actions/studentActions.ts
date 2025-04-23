'use server';

import { getStudentsInClass } from '../firestoreService';
import { Student } from './types'; // Import từ file types.ts mới tạo
// Remove Timestamp import if no longer needed directly here
// import { Timestamp } from 'firebase/firestore'; 

/**
 * Server action để lấy danh sách sinh viên cho một lớp học.
 * Directly returns the data fetched by firestoreService.
 */
export async function getStudentsForClassAction(classId: string): Promise<Student[]> {
  if (!classId) {
    console.error('[Server Action] Error: Class ID is required.');
    throw new Error('Class ID is required.');
  }

  try {
    console.log(`[Server Action] Fetching students for class ID: ${classId}`);
    // Directly call and return the result from the service function
    const students = await getStudentsInClass(classId);
    console.log(`[Server Action] Received ${students.length} students from firestoreService.`);

    // Log sample data if needed for debugging
    if (students.length > 0) {
      console.log('[Server Action] Sample student data:', JSON.stringify(students[0]));
    } else {
      console.log('[Server Action] No students found by firestoreService for this class');
    }

    return students; // Return the already processed array

  } catch (error: any) {
    console.error(`[Server Action] Error fetching students for class ${classId}:`, error);
    // Re-throw the error so the client knows something went wrong
    throw new Error(`Failed to fetch students: ${error.message || 'Unknown error'}`); 
  }
}

// The Student interface definition should be solely in ./types.ts
// Remove any duplicate definitions here.