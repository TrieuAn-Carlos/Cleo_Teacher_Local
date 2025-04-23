'use server';

import { revalidatePath } from 'next/cache';
import { 
  addClass as addClassService, 
  updateClass as updateClassService, 
  deleteClass as deleteClassService,
  archiveClass as archiveClassService,
  getUserProfile
} from './firestoreService';
import type { ClassData } from './firestoreTypes';
import { cookies } from "next/headers";

/**
 * Server action to add a new class
 */
export async function addClassAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const teacherId = formData.get('teacherId') as string;
    const joinCode = formData.get('joinCode') as string | undefined;

    if (!name || !teacherId) {
      return { error: 'Name and teacher ID are required' };
    }

    const classData: Omit<ClassData, 'created_at'> = {
      name,
      teacherId,
    };

    if (joinCode) {
      classData.joinCode = joinCode;
    }

    const classId = await addClassService(classData);
    revalidatePath('/dashboard');
    return { success: true, classId };
  } catch (error) {
    console.error('Error adding class:', error);
    return { error: 'Failed to add class' };
  }
}

/**
 * Server action to update an existing class
 */
export async function updateClassAction(classId: string, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const joinCode = formData.get('joinCode') as string | undefined;

    if (!name) {
      return { error: 'Name is required' };
    }

    const updatedData: Partial<ClassData> = { name };
    
    if (joinCode !== undefined) {
      updatedData.joinCode = joinCode;
    }

    await updateClassService(classId, updatedData);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error updating class:', error);
    return { error: 'Failed to update class' };
  }
}

/**
 * Server action to archive a class (soft delete)
 */
export async function archiveClassAction(classId: string) {
  try {
    // Use the new archive function instead of hard delete
    await archiveClassService(classId);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error archiving class:', error);
    return { error: 'Failed to archive class' };
  }
}

/**
 * Get user's display name by UID
 */
export async function getUserDisplayName(userId: string): Promise<string> {
  // This function will be replaced with actual Firestore calls
  // For now, we'll simulate fetching a user name
  console.log(`Server action: Getting display name for user ${userId}`);
  
  // In a real implementation, you'd fetch this from your Firestore
  return "Test User";
}

// Helper function to set authentication status cookie
export async function setAuthCookie(status: boolean): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set("auth-status", status ? "authenticated" : "unauthenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });
}

// Helper function to check authentication status from cookie
export async function checkAuthCookie(): Promise<boolean> {
  const cookieStore = cookies();
  const status = cookieStore.get("auth-status");
  return status?.value === "authenticated";
} 