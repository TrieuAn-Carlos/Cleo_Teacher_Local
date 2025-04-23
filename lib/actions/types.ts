// Student interface to match the actual Firestore structure
export interface Student {
  uid: string;                // Unique identifier for the student (usually from Firebase Auth)
  displayName?: string;       // Student's display name
  email?: string;             // Student's email address
  photoURL?: string | null;   // Student's profile photo URL
  classId: string;            // ID of the class this student belongs to
  createdAt?: string;         // ISO date string (converted from Firestore Timestamp)
  joinDate?: string;          // ISO date string (converted from Firestore Timestamp)
  role?: string;              // Role of the student 
  docId?: string;             // The Firestore document ID 
}

// Additional types can be added here as needed 