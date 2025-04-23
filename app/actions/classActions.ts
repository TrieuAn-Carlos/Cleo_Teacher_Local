"use server";

import { z } from "zod";
import { db } from "../../lib/firebaseAdminConfig";
import { revalidatePath } from "next/cache";
import type { FirebaseError } from "firebase-admin/app";
import type { ClassDocument } from "../../lib/firestoreTypes";
import { DocumentData, Timestamp } from "firebase-admin/firestore";

// Input schema for validation
const teacherClassesInput = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  archived: z.boolean().optional().default(false),
});

// Helper function to safely convert Timestamp to ISO string
const serializeTimestamp = (timestamp: any): string | null => {
  if (!timestamp) return null;
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  try {
    return new Date(timestamp).toISOString();
  } catch (e) { return null; }
};

export async function getTeacherClassesAction(teacherId: string, archived: boolean = false): Promise<any[]> {
  console.log(`[ClassActions] Fetching classes for teacher: ${teacherId}, archived: ${archived}`);
  
  try {
    // --- Validate Input ---
    const validatedInput = teacherClassesInput.parse({ teacherId, archived });

    // --- Check Firestore Connection ---
    if (!db) {
      console.error("[ClassActions] Firebase Firestore is not initialized");
      throw new Error("Firestore connection error: Database is not initialized. Check your Firebase Admin configuration.");
    }

    // --- Test Firebase Admin permissions ---
    try {
      // Simple permissions test to verify we can access Firestore
      console.log("[ClassActions] Testing Firestore permission with list collections");
      const collections = await db.listCollections();
      console.log(`[ClassActions] Connection test successful: found ${collections.length} collections`);
    } catch (permError) {
      console.error("[ClassActions] Permission error testing Firestore connection:", permError);
      if (permError instanceof Error) {
        if (permError.message.includes("permission-denied")) {
          throw new Error("Firebase permission denied: Your Firebase account doesn't have access to this project or collection. Check your credentials and project setup.");
        } else if (permError.message.includes("unauthenticated")) {
          throw new Error("Firebase authentication failed: Could not authenticate with Firestore. Check your service account credentials.");
        }
      }
      throw new Error(`Firestore connection test failed: ${permError instanceof Error ? permError.message : "Unknown error"}`);
    }

    try {
      // --- Firestore Query --- 
      console.log("[ClassActions] Executing Firestore query");
      
      // Make sure 'classes' collection exists
      const collections = await db.listCollections();
      const collectionNames = collections.map(col => col.id);
      console.log(`[ClassActions] Available collections:`, collectionNames);
      
      if (!collectionNames.includes('classes')) {
        console.warn("[ClassActions] 'classes' collection does not exist! Creating it now...");
        // Let's try to create it by writing a test document
        try {
          await db.collection('classes').doc('_test_doc').set({
            name: 'Test Class',
            teacherId: 'test',
            created_at: Timestamp.now(),
            isTest: true
          });
          console.log("[ClassActions] Successfully created 'classes' collection");
          // Delete the test document
          await db.collection('classes').doc('_test_doc').delete();
        } catch (createError) {
          console.error("[ClassActions] Failed to create classes collection:", createError);
          throw new Error("Could not create 'classes' collection. Check your Firestore write permissions.");
        }
      }
      
      const classesRef = db.collection("classes");
      
      console.log(`[ClassActions] Query: teacherId == "${validatedInput.teacherId}"`);
      
      try {
        // Thực hiện truy vấn
        const snapshot = await classesRef.where("teacherId", "==", validatedInput.teacherId).get();

        console.log(`[ClassActions] Query returned ${snapshot.size} documents`);
        
        if (snapshot.empty) {
          console.log(`[ClassActions] No classes found for teacher: ${teacherId}`);
          
          // Thử truy vấn không có filter để xem có docs nào trong collection không
          const allClassesSnapshot = await classesRef.limit(5).get();
          if (!allClassesSnapshot.empty) {
            console.log(`[ClassActions] But found ${allClassesSnapshot.size} classes in total. Sample teacher IDs:`);
            allClassesSnapshot.forEach(doc => {
              const data = doc.data();
              console.log(`- Class ${doc.id}: teacherId = "${data.teacherId}"`);
            });
            
            // Check if we have a user ID mismatch problem
            const uniqueTeacherIds = new Set<string>();
            allClassesSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.teacherId) uniqueTeacherIds.add(data.teacherId);
            });
            
            console.log(`[ClassActions] Found ${uniqueTeacherIds.size} unique teacher IDs in database`);
            if (uniqueTeacherIds.size > 0) {
              console.log(`[ClassActions] Expected teacherId: "${teacherId}" but found these teacherIds: ${Array.from(uniqueTeacherIds).join(', ')}`);
            }
          } else {
            console.log(`[ClassActions] No classes found in the collection at all`);
          }
          
          return [];
        }

        const classes: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as DocumentData;
          console.log(`[ClassActions] Processing class: ${doc.id}`, data);
          
          const isDocArchived = data.isArchived === true;

          // Filter classes based on archive status
          if ((!validatedInput.archived && !isDocArchived) || 
              (validatedInput.archived && isDocArchived)) {
            classes.push({
              id: doc.id,
              name: data.name || "Unnamed Class",
              teacherId: data.teacherId,
              created_at: serializeTimestamp(data.created_at),
              subject: data.subject || "",
              room: data.room || "",
              joinCode: data.joinCode || "",
              isArchived: isDocArchived,
              archivedAt: serializeTimestamp(data.archivedAt),
            });
          }
        });

        // Refresh cache
        revalidatePath('/dashboard');
        
        console.log(`[ClassActions] Processed ${classes.length} classes for teacher: ${teacherId}`);
        return classes;
      } catch (queryError) {
        console.error('[ClassActions] Error executing Firestore query:', queryError);
        // Log the specific details of the error
        if (queryError instanceof Error) {
          console.error('[ClassActions] Error message:', queryError.message);
          console.error('[ClassActions] Error stack:', queryError.stack);
          
          if (queryError.message.includes("permission-denied")) {
            throw new Error("Permission denied: Your account doesn't have access to read classes. Check your Firebase security rules.");
          }
        }
        throw new Error(`Error querying Firestore: ${queryError instanceof Error ? queryError.message : "Unknown error"}`);
      }
    } catch (firestoreError) {
      console.error("[ClassActions] Firestore query error:", firestoreError);
      throw firestoreError; // Re-throw to be caught by the outer handler
    }

  } catch (error: any) {
    console.error("[ClassActions] Error in getTeacherClassesAction:", error);

    if (error instanceof z.ZodError) {
      console.error("[ClassActions] Validation Error Details:", error.errors);
      return []; // Return empty array for validation errors
    } else if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as FirebaseError;
      console.error(`[ClassActions] Firebase Error Code: ${firebaseError.code}`);
      console.error(`[ClassActions] Firebase Error Message: ${firebaseError.message}`);
      return []; // Return empty array for Firebase errors
    } else {
      console.error('[ClassActions] Unhandled error:', error.message || 'Unknown error');
      return []; // Return empty array for any other errors
    }
  }
}