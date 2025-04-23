import { Timestamp, GeoPoint } from 'firebase/firestore';

// Based on schema.text

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'teacher' | 'student';
  created_at: Timestamp;
}

export interface ClassData {
  // classId is the document ID, not stored in the document itself usually
  name: string;
  teacherId: string; // UID of the teacher
  joinCode?: string; // Optional
  subject?: string; // Subject field
  room?: string;     // Room field
  created_at: Timestamp;
  isArchived?: boolean; // Added for soft delete functionality
  archivedAt?: Timestamp; // Timestamp when the class was archived
}

export interface ClassDocument extends ClassData {
  id: string; // Document ID when fetched
}

export interface StudentInClass {
  // userId is the document ID
  joinDate: Timestamp;
}

export interface SessionData {
  // sessionId is the document ID
  classId: string;
  teacherId: string;
  startTime: Timestamp | null;
  endTime?: Timestamp | null;
  status: 'scheduled' | 'active' | 'ended' | 'cancelled';
  location?: GeoPoint; // Optional or required based on usage
  radius?: number; // Optional or required based on usage
  created_at: Timestamp;
  title?: string; // Optional title for the session
}

export interface SessionDocument extends SessionData {
  id: string; // Document ID when fetched
  title: string | null; // Title is always defined (either from DB or default)
}

export interface AttendanceRecord {
  // studentId is the document ID
  classId: string;
  checkInTime?: Timestamp | null;
  checkOutTime?: Timestamp | null;
  checkInLocation?: GeoPoint | null;
  status: 
    | 'pending' 
    | 'checked_in' 
    | 'verified' 
    | 'failed_location' 
    | 'failed_other' 
    | 'absent' 
    | 'checked_out_early_before_verification';
  isGpsVerified: boolean;
  lastUpdated: Timestamp;
}

export interface UserClassInfo {
   // classId is the document ID in the subcollection
  className: string;
  teacherName?: string;
  joinDate: Timestamp;
}

// New interface for the return type of getStudentClassesAction
export interface StudentClassDetails extends UserClassInfo {
  classId: string; // Add the classId
}