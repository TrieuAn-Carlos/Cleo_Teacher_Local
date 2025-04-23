import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebaseConfig'; // Assuming your db export is here
import type {
  UserProfile,
  ClassData,
  ClassDocument,
  SessionData,
  SessionDocument,
  StudentClassDetails, // Assuming this might be used elsewhere, keep if needed
} from './firestoreTypes'; // Import interfaces
import { Student } from './actions/types'; // Import the Student type

// Helper function to check if Firestore is available and handle errors
const checkFirestore = () => {
  if (!db) {
    console.error("Firestore is not initialized properly");
    throw new Error("Firebase connection error: Firestore is not available");
  }
};

// --- User Service --- 

/**
 * Creates or updates a user profile in Firestore.
 * Usually called after successful signup or profile update.
 * @param userId - The Firebase Auth UID.
 * @param data - User profile data (email, displayName, role).
 */
export const setUserProfile = async (userId: string, data: Omit<UserProfile, 'uid' | 'created_at'>): Promise<void> => {
  try {
    checkFirestore();
    
    const userRef = doc(db, 'users', userId);
    // Use setDoc with merge: true to create or update, and add created_at on initial creation
    await setDoc(userRef, {
      ...data,
      uid: userId, // Ensure uid is stored
      created_at: serverTimestamp(), // Set creation time only once
    }, { merge: true });
  } catch (error) {
    console.error("Error setting user profile:", error);
    throw error;
  }
};

/**
 * Gets a user profile from Firestore.
 * @param userId - The Firebase Auth UID.
 * @returns UserProfile or null if not found.
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    checkFirestore();
    
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      // Explicitly cast to UserProfile after checking existence
      return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      console.log("No such user profile!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// --- Class Service --- 

const classesCol = collection(db, 'classes');

/**
 * Adds a new class to Firestore.
 * @param classData - Data for the new class (name, teacherId, etc.).
 * @returns The ID of the newly created class document.
 */
export const addClass = async (classData: Omit<ClassData, 'created_at'>): Promise<string> => {
  try {
    checkFirestore();
    
    const docRef = await addDoc(classesCol, {
      ...classData,
      isArchived: false, // Thêm trường này rõ ràng để đảm bảo nhất quán
      created_at: serverTimestamp(), // Add server timestamp on creation
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

/**
 * Archives a class instead of deleting it.
 * Implements soft delete by setting an isArchived flag.
 * @param classId - The ID of the class document to archive.
 */
export const archiveClass = async (classId: string): Promise<void> => {
  try {
    checkFirestore();
    
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, {
      isArchived: true,
      archivedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error archiving class:", error);
    throw error;
  }
};

/**
 * Gets all classes taught by a specific teacher.
 * @param teacherId - The UID of the teacher.
 * @param includeArchived - Whether to include archived classes. Default is false.
 * @returns An array of ClassDocument.
 */
export const getTeacherClasses = async (teacherId: string, includeArchived: boolean = false): Promise<ClassDocument[]> => {
  try {
    checkFirestore();
    
    let q;
    
    if (includeArchived) {
      // Get all classes for this teacher
      q = query(classesCol, where("teacherId", "==", teacherId));
    } else {
      // Get only non-archived classes (isArchived is undefined or false)
      q = query(
        classesCol, 
        where("teacherId", "==", teacherId),
        where("isArchived", "in", [false, null, undefined])
      );
    }
    
    const querySnapshot = await getDocs(q);
    const classes: ClassDocument[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Record<string, any>;
      classes.push({ 
        id: doc.id, 
        name: data.name || '',
        teacherId: data.teacherId || '',
        joinCode: data.joinCode || '',
        isArchived: data.isArchived || false,
        // Add other fields as needed, explicitly
      } as ClassDocument);
    });
    
    return classes;
  } catch (error) {
    console.error("Error getting teacher classes:", error);
    throw error;
  }
};

/**
 * Updates an existing class document.
 * @param classId - The ID of the class document to update.
 * @param updatedData - An object containing the fields to update.
 */
export const updateClass = async (classId: string, updatedData: Partial<ClassData>): Promise<void> => {
  try {
    checkFirestore();
    
    const classRef = doc(db, 'classes', classId);
    await updateDoc(classRef, updatedData);
  } catch (error) {
    console.error("Error updating class:", error);
    throw error;
  }
};

/**
 * Deletes a class document.
 * Note: This is a hard delete. Consider adding an 'isArchived' flag for soft delete.
 * @param classId - The ID of the class document to delete.
 */
export const deleteClass = async (classId: string): Promise<void> => {
  try {
    checkFirestore();
    
    const classRef = doc(db, 'classes', classId);
    await deleteDoc(classRef);
    // TODO: Consider deleting subcollections (students, sessions) or handling cleanup.
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

// --- Session Service --- (Example functions)

const sessionsCol = collection(db, 'sessions');

/**
 * Adds a new session for a class.
 * @param sessionData - Data for the new session.
 * @returns The ID of the newly created session document.
 */
export const addSession = async (sessionData: Omit<SessionData, 'created_at'>): Promise<string> => {
  try {
    checkFirestore();
    
    const sessionToAdd = {
      ...sessionData,
      created_at: serverTimestamp(),
    };
    
    const docRef = await addDoc(sessionsCol, sessionToAdd);
    return docRef.id;
  } catch (error) {
    console.error("Error adding session:", error);
    throw error;
  }
};

/**
 * Gets all sessions for a specific class.
 * @param classId - The ID of the class.
 * @returns An array of SessionDocument.
 */
export const getClassSessions = async (classId: string): Promise<SessionDocument[]> => {
  try {
    checkFirestore();
    
    const q = query(sessionsCol, where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    const sessions: SessionDocument[] = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() } as SessionDocument);
    });
    return sessions;
  } catch (error) {
    console.error("Error getting class sessions:", error);
    throw error;
  }
};

/**
 * Updates an existing session document.
 * @param sessionId - The ID of the session document to update.
 * @param updatedData - An object containing the fields to update.
 */
export const updateSession = async (sessionId: string, updatedData: Partial<SessionData>): Promise<void> => {
  try {
    checkFirestore();
    
    const sessionRef = doc(db, 'sessions', sessionId);
    await updateDoc(sessionRef, updatedData);
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
};

/**
 * Deletes a session document.
 * @param sessionId - The ID of the session document to delete.
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  try {
    checkFirestore();
    
    const sessionRef = doc(db, 'sessions', sessionId);
    await deleteDoc(sessionRef);
  } catch (error) {
    console.error("Error deleting session:", error);
    throw error;
  }
};

/**
 * Gets a class by its join code.
 * @param joinCode - The unique join code of the class.
 * @returns A ClassDocument or null if not found.
 */
export const getClassByJoinCode = async (joinCode: string): Promise<ClassDocument | null> => {
  try {
    checkFirestore();
    
    const q = query(classesCol, where("joinCode", "==", joinCode));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No class found with that join code");
      return null;
    }
    
    // Return the first matching class (join codes should be unique)
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as ClassDocument;
  } catch (error) {
    console.error("Error getting class by join code:", error);
    throw error;
  }
};

/**
 * Gets all students in a specific class.
 * @param classId - The ID of the class.
 * @returns An array of student objects matching the Student interface.
 */
export const getStudentsInClass = async (classId: string): Promise<Student[]> => {
  try {
    checkFirestore();

    // Path to the students subcollection within the class
    const studentsCol = collection(db, `classes/${classId}/students`);
    console.log(`[Firestore Service] Querying path: classes/${classId}/students`); // Log the exact path

    const querySnapshot = await getDocs(studentsCol);

    // *** ADD DETAILED LOGS HERE ***
    console.log(`[Firestore Service] Query snapshot for class ${classId} - isEmpty: ${querySnapshot.empty}, size: ${querySnapshot.size}`);

    if (querySnapshot.empty) {
      console.log(`[Firestore Service] No student documents found at path: classes/${classId}/students`);
    }
    // *** END ADDED LOGS ***

    const students: Student[] = [];

    querySnapshot.forEach((studentDoc) => {
      const studentId = studentDoc.id; // The document ID is the student's UID
      const data = studentDoc.data() as Record<string, any>; // Get data from the subcollection document

      // *** ADD LOG INSIDE LOOP ***
      console.log(`[Firestore Service] Processing student doc ID: ${studentId}, Data:`, JSON.stringify(data));
      // *** END ADDED LOG ***

      // Convert Timestamps to ISO strings for serialization
      let createdAtISO: string | undefined = undefined;
      if (data.created_at instanceof Timestamp) {
        createdAtISO = data.created_at.toDate().toISOString();
      } else if (data.created_at) {
        try {
          createdAtISO = new Date(data.created_at).toISOString();
        } catch (e) {
          console.warn(`[Firestore] Could not convert created_at for student ${studentId}:`, data.created_at);
        }
      }
      
      let joinDateISO: string | undefined = undefined;
      if (data.joinDate instanceof Timestamp) {
          joinDateISO = data.joinDate.toDate().toISOString();
      } else if (data.joinDate) {
          try {
              joinDateISO = new Date(data.joinDate).toISOString();
          } catch (e) {
              console.warn(`[Firestore] Could not convert joinDate for student ${studentId}:`, data.joinDate);
          }
      }


      // Construct the Student object directly from the subcollection data
      const studentData: Student = {
        uid: studentId,
        classId: classId, // Add the classId
        displayName: data.displayName || `Student ${studentId.substring(0, 8)}`, // Use displayName from doc or fallback
        email: data.email || '', // Use email from doc or fallback
        photoURL: data.photoURL || null, // Use photoURL from doc or fallback
        role: data.role || 'student', // Use role from doc or fallback
        createdAt: createdAtISO, // Use converted timestamp
        joinDate: joinDateISO, // Use converted timestamp
        docId: studentId, // Use studentId as docId for consistency if needed
        // Add any other fields from the Student interface that exist in the Firestore doc
      };

      students.push(studentData);
    });

    console.log(`[Firestore Service] Finished processing. Returning ${students.length} student records for class ${classId}`);
    return students;
  } catch (error) {
    console.error(`[Firestore Service] Error getting students in class ${classId}:`, error);
    throw new Error(`Failed to get students for class ${classId}`); // Re-throw a more specific error
  }
};

export const getSessionsByClassId = async (classId: string): Promise<SessionDocument[]> => {
  try {
    checkFirestore();
    
    const q = query(sessionsCol, where("classId", "==", classId));
    const querySnapshot = await getDocs(q);
    
    const sessions: SessionDocument[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Make sure title is always defined (null if not present in the database)
      const title = data.title !== undefined ? data.title : null;
      
      sessions.push({ 
        id: doc.id, 
        ...data,
        title 
      } as SessionDocument);
    });
    
    // Sort sessions by startTime descending (newest first)
    return sessions.sort((a, b) => {
      const timeA = a.startTime ? a.startTime.toMillis() : 0;
      const timeB = b.startTime ? b.startTime.toMillis() : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting sessions by class ID:", error);
    throw error;
  }
};

/**
 * Adds a new student to a class.
 * @param studentData - Data for the new student.
 * @param classId - The ID of the class.
 * @returns The ID of the newly created student document.
 */
export const addStudent = async (studentData: any, classId: string): Promise<string> => {
  try {
    checkFirestore();
    
    // Make sure we have a uid for the student (important for identification)
    if (!studentData.uid) {
      console.warn('[Firestore] Student data missing uid field');
    }

    // Ensure classId is included in the student data
    const studentToAdd = {
      ...studentData,
      classId: classId, // Store classId in the student document for easy reference
      created_at: serverTimestamp(), // Add server timestamp for creation time
    };
    
    // Create a reference to the students collection within the class
    const studentsCol = collection(db, 'classes', classId, 'students');
    
    // Create a document ID (preferably using the student's UID if available or generate one)
    const documentId = studentToAdd.uid || studentData.id || null;
    
    let docRef;
    if (documentId) {
      // If we have a document ID, use it explicitly for easier management
      docRef = doc(studentsCol, documentId);
      await setDoc(docRef, studentToAdd);
    } else {
      // Otherwise, let Firestore generate a document ID
      docRef = await addDoc(studentsCol, studentToAdd);
    }
    
    console.log(`[Firestore] Added student to class ${classId} with document ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error("[Firestore] Error adding student:", error);
    throw error;
  }
};

/**
 * Removes a student from a class.
 * @param studentUid - The UID of the student to remove.
 * @param classId - The ID of the class.
 */
export const removeStudentFromClass = async (studentUid: string, classId: string): Promise<void> => {
  try {
    checkFirestore();
    
    // First, try to get the document directly by its ID (if student docs use uid as doc ID)
    const studentRef = doc(db, `classes/${classId}/students`, studentUid);
    const studentDoc = await getDoc(studentRef);
    
    if (studentDoc.exists()) {
      console.log(`[Firestore] Found student document by ID: ${studentUid}`);
      await deleteDoc(studentRef);
      return;
    }
    
    // If the direct approach didn't work, try to find by uid field
    console.log(`[Firestore] Student document with ID ${studentUid} not found, searching by uid field`);
    const studentsCol = collection(db, `classes/${classId}/students`);
    const q = query(studentsCol, where("uid", "==", studentUid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn(`[Firestore] No student with UID ${studentUid} found in class ${classId}`);
      return;
    }
    
    // Delete each matching document (should only be one)
    const deletePromises = querySnapshot.docs.map(doc => {
      console.log(`[Firestore] Deleting student document: ${doc.id}`);
      return deleteDoc(doc.ref);
    });
    
    await Promise.all(deletePromises);
    console.log(`[Firestore] Removed student ${studentUid} from class ${classId}`);
    
  } catch (error) {
    console.error("[Firestore] Error removing student from class:", error);
    throw error;
  }
};

// TODO: Add functions for other collections and subcollections as needed
// (e.g., addStudentToClass, getAttendance, updateAttendance, etc.)