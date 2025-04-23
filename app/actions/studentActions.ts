"use server";

import { z } from "zod";
import { db } from "../../lib/firebaseAdminConfig";
import type { StudentClassDetails } from "../../lib/firestoreTypes";
import { Timestamp } from "firebase-admin/firestore";
import { getStudentsInClass } from "../../lib/firestoreService"; // Import the function
import { Student } from "../../lib/actions/types"; // Import the Student type

// Input schema validation
const StudentIdSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
});

// Schema for class ID validation
const ClassIdSchema = z.object({
  classId: z.string().min(1, "Class ID is required"),
});

/**
 * Get all classes a student is enrolled in.
 * Uses the denormalized /userClasses/{userId}/classes/{classId} structure.
 */
export async function getStudentClassesAction(input: { studentId: string | undefined | null }): Promise<StudentClassDetails[]> {
  console.log(`[StudentActions] Attempting to fetch classes for student: ${input?.studentId}`);

  // --- Validate Input --- 
  const validatedInput = StudentIdSchema.safeParse(input);
  
  if (!validatedInput.success) {
    console.error("[StudentActions] Validation Error:", validatedInput.error.errors);
    throw new Error("Invalid input: Student ID is missing or invalid.");
  }

  const { studentId } = validatedInput.data;

  // --- Check Firestore Connection --- 
  if (!db) {
    console.error("[StudentActions] Firebase Firestore is not initialized");
    throw new Error("Database connection error");
  }

  // --- Firestore Query --- 
  try {
    const studentClassesRef = db.collection("userClasses").doc(studentId).collection("classes");
    const snapshot = await studentClassesRef.get();

    if (snapshot.empty) {
      console.log(`[StudentActions] No classes found for student: ${studentId}`);
      return [];
    }

    const classes: StudentClassDetails[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure joinDate is converted correctly to a serializable format
      let joinDateISO: string | null = null;
      if (data.joinDate instanceof Timestamp) {
        joinDateISO = data.joinDate.toDate().toISOString();
      } else if (data.joinDate) {
        // Attempt conversion if it's not a Timestamp but exists (e.g., from older data)
        try {
          joinDateISO = new Date(data.joinDate).toISOString();
        } catch (e) {
          console.warn(`[StudentActions] Could not convert joinDate for class ${doc.id}:`, data.joinDate);
        }
      }

      classes.push({
        classId: doc.id, // The document ID in this subcollection is the classId
        className: data.className || "Unnamed Class",
        teacherName: data.teacherName,
        joinDate: joinDateISO, // Use the ISO string
      });
    });

    console.log(`[StudentActions] Found ${classes.length} classes for student: ${studentId}`);
    return classes;

  } catch (error: any) {
    console.error(`[StudentActions] Error fetching classes for student ${studentId}:`, error);
    // Add more specific error checking if needed (e.g., FirebaseError)
    throw new Error("Failed to fetch student classes from server.");
  }
}

/**
 * Server Action to get all students enrolled in a specific class.
 * @param classId - The ID of the class.
 * @returns An array of Student objects.
 */
export async function getStudentsForClassAction(classId: string): Promise<Student[]> {
  console.log(`[StudentActions] Attempting to fetch students for class: ${classId}`);

  // --- Validate Input --- 
  const validatedInput = ClassIdSchema.safeParse({ classId });

  if (!validatedInput.success) {
    console.error("[StudentActions] Validation Error:", validatedInput.error.errors);
    throw new Error("Invalid input: Class ID is missing or invalid.");
  }

  // --- Check Firestore Connection (already handled by firestoreService) --- 

  // --- Firestore Query via Service --- 
  try {
    // Call the existing service function
    const studentsData = await getStudentsInClass(classId);
    
    console.log(`[StudentActions] Found ${studentsData.length} students for class: ${classId}`);
    
    // Ensure the returned data matches the Student type (or perform mapping if needed)
    // Assuming getStudentsInClass returns data compatible with the Student type
    return studentsData as Student[]; 

  } catch (error: any) {
    console.error(`[StudentActions] Error fetching students for class ${classId}:`, error);
    throw new Error("Failed to fetch students for the class from server.");
  }
}