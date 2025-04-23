"use server";

import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminApp } from "../../lib/firebaseAdminConfig";
import type { ClassDocument, SessionDocument } from "../../lib/firestoreTypes";
import { z } from 'zod';

const firestore = getFirestore(adminApp);

// Input schema validation
const UserIdSchema = z.object({ 
  userId: z.string().min(1, { message: "User ID is required" })
});

const SessionInputSchema = z.object({
  classId: z.string().min(1, { message: "Class ID is required" }),
  teacherId: z.string().min(1, { message: "Teacher ID is required" }),
  location: z.object({
    latitude: z.number(),
    longitude: z.number()
  }),
  radius: z.number().min(10).default(100),
  title: z.string().optional()
});

// Helper function (can be shared or redefined)
const serializeTimestamp = (timestamp: any): string | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  try {
    return new Date(timestamp).toISOString();
  } catch (e) { return null; }
};

/**
 * Get all sessions for a teacher (regardless of status)
 */
export async function getActiveSessionsAction(input: { userId: string | undefined | null }): Promise<any[]> {
  // Validate input
  const validatedInput = UserIdSchema.safeParse(input);
  
  if (!validatedInput.success) {
    console.error("Server Action Validation Error:", validatedInput.error.errors);
    throw new Error("Invalid input: User ID is missing or invalid.");
  }

  const { userId } = validatedInput.data;
  console.log(`[TeacherActions] Fetching sessions for teacherId: ${userId}`);

  try {
    const sessionsRef = firestore.collection("sessions");
    console.log("[TeacherActions] Executing Firestore query");
    const q = sessionsRef.where("teacherId", "==", userId);
    const snapshot = await q.get();

    if (snapshot.empty) {
      console.log(`[TeacherActions] No sessions found for teacherId ${userId}.`);
      return [];
    }

    const sessions: any[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sessions.push({
        id: doc.id,
        classId: data.classId,
        teacherId: data.teacherId,
        startTime: serializeTimestamp(data.startTime),
        endTime: serializeTimestamp(data.endTime),
        status: data.status,
        location: data.location,
        radius: data.radius,
        created_at: serializeTimestamp(data.created_at),
        title: data.title || null
      });
    });

    console.log(`[TeacherActions] Found ${sessions.length} total sessions for teacherId: ${userId}`);
    return sessions;

  } catch (error) {
    console.error("[TeacherActions] Error fetching sessions:", error);
    throw new Error("Failed to fetch sessions from server.");
  }
}

/**
 * Create a new attendance session
 */
export async function createSessionAction(input: {
  classId: string;
  teacherId: string;
  location: { latitude: number; longitude: number };
  radius?: number;
  title?: string;
}): Promise<{ id: string }> {
  // Validate input
  const validatedInput = SessionInputSchema.safeParse(input);
  
  if (!validatedInput.success) {
    console.error("Server Action Validation Error:", validatedInput.error.errors);
    throw new Error("Invalid input for creating session.");
  }

  const { classId, teacherId, location, radius, title } = validatedInput.data;
  console.log(`Server Action: Creating new session for class: ${classId}, teacher: ${teacherId}`);

  try {
    // First verify the class exists and belongs to this teacher
    const classRef = firestore.collection("classes").doc(classId);
    const classDoc = await classRef.get();
    
    if (!classDoc.exists) {
      throw new Error("Class not found.");
    }
    
    const classData = classDoc.data();
    if (classData?.teacherId !== teacherId) {
      throw new Error("You don't have permission to create a session for this class.");
    }

    // Create the session
    const sessionRef = firestore.collection("sessions").doc();
    const sessionData = {
      classId,
      teacherId,
      startTime: null, // Will be set when session is started
      endTime: null,
      status: "scheduled", // Initial status
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      radius: radius || 100, // Default 100m radius if not specified
      created_at: FieldValue.serverTimestamp(),
      title: title || classData?.name || "Attendance Session"
    };

    await sessionRef.set(sessionData);
    
    console.log(`Server Action: Created new session with ID: ${sessionRef.id}`);
    return { id: sessionRef.id };

  } catch (error) {
    console.error("Server Action Error creating session:", error);
    throw new Error(`Failed to create session: ${error.message}`);
  }
}

/**
 * Start an attendance session
 */
export async function startSessionAction(input: { 
  sessionId: string; 
  teacherId: string; 
}): Promise<{ success: boolean }> {
  try {
    if (!input.sessionId || !input.teacherId) {
      throw new Error("Session ID and Teacher ID are required");
    }

    const sessionRef = firestore.collection("sessions").doc(input.sessionId);
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }
    
    const sessionData = sessionDoc.data();
    
    // Check if the teacher is the owner of the session
    if (sessionData?.teacherId !== input.teacherId) {
      throw new Error("You don't have permission to start this session");
    }
    
    // Check if session is already active
    if (sessionData?.status === "active") {
      return { success: true }; // Already active
    }
    
    // Update session status to active
    await sessionRef.update({
      status: "active",
      startTime: FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Server Action Error starting session:", error);
    throw new Error(`Failed to start session: ${error.message}`);
  }
}

/**
 * End an attendance session
 */
export async function endSessionAction(input: { 
  sessionId: string; 
  teacherId: string; 
}): Promise<{ success: boolean }> {
  try {
    if (!input.sessionId || !input.teacherId) {
      throw new Error("Session ID and Teacher ID are required");
    }

    const sessionRef = firestore.collection("sessions").doc(input.sessionId);
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }
    
    const sessionData = sessionDoc.data();
    
    // Check if the teacher is the owner of the session
    if (sessionData?.teacherId !== input.teacherId) {
      throw new Error("You don't have permission to end this session");
    }
    
    // Update session status to ended
    await sessionRef.update({
      status: "ended",
      endTime: FieldValue.serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error("Server Action Error ending session:", error);
    throw new Error(`Failed to end session: ${error.message}`);
  }
}

/**
 * Get session attendance for a specific session
 */
export async function getSessionAttendanceAction(input: { 
  sessionId: string; 
  teacherId: string; 
}): Promise<Array<{ 
  studentId: string; 
  name: string; 
  status: string; 
  checkInTime: Date | null; 
}>
> {
  try {
    if (!input.sessionId || !input.teacherId) {
      throw new Error("Session ID and Teacher ID are required");
    }

    const sessionRef = firestore.collection("sessions").doc(input.sessionId);
    const sessionDoc = await sessionRef.get();
    
    if (!sessionDoc.exists) {
      throw new Error("Session not found");
    }
    
    const sessionData = sessionDoc.data();
    
    // Check if the teacher is the owner of the session
    if (sessionData?.teacherId !== input.teacherId) {
      throw new Error("You don't have permission to view this session's attendance");
    }

    // Get all students in the class
    const classRef = firestore.collection("classes").doc(sessionData?.classId);
    const studentsSnapshot = await classRef.collection("students").get();
    
    // Get attendance records for this session
    const attendanceSnapshot = await sessionRef.collection("attendance").get();
    
    // Map of student IDs to attendance records
    const attendanceMap = new Map();
    attendanceSnapshot.forEach(doc => {
      const data = doc.data();
      attendanceMap.set(doc.id, {
        studentId: doc.id,
        status: data.status,
        checkInTime: data.checkInTime?.toDate ? data.checkInTime.toDate() : null
      });
    });
    
    // Get student names from users collection
    const results = [];
    for (const studentDoc of studentsSnapshot.docs) {
      const studentId = studentDoc.id;
      
      // Get student profile
      const userDoc = await firestore.collection("users").doc(studentId).get();
      const userData = userDoc.exists ? userDoc.data() : null;
      
      // Get attendance record or mark as absent
      const attendance = attendanceMap.get(studentId) || {
        studentId,
        status: "absent",
        checkInTime: null
      };
      
      results.push({
        studentId,
        name: userData?.displayName || "Unknown Student",
        status: attendance.status,
        checkInTime: attendance.checkInTime
      });
    }
    
    return results;
  } catch (error) {
    console.error("Server Action Error getting session attendance:", error);
    throw new Error(`Failed to get session attendance: ${error.message}`);
  }
} 