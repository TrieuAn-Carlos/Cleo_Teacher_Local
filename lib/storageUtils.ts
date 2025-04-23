// lib/storageUtils.ts
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  uploadString,
  uploadBytesResumable
} from 'firebase/storage';
import { storage } from './firebaseConfig';

// Function to upload a file and get its download URL
export const uploadFile = async (filePath: string, file: File | Blob) => {
  try {
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { filePath, downloadURL };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to upload a string (like base64 data)
export const uploadBase64 = async (filePath: string, data: string, contentType: string = 'data_url') => {
  try {
    const storageRef = ref(storage, filePath);
    await uploadString(storageRef, data, contentType as any);
    const downloadURL = await getDownloadURL(storageRef);
    return { filePath, downloadURL };
  } catch (error) {
    console.error('Error uploading base64 data:', error);
    throw error;
  }
};

// Function to upload a file with progress tracking
export const uploadFileWithProgress = (
  filePath: string, 
  file: File | Blob, 
  onProgress: (progress: number) => void,
  onError: (error: any) => void,
  onComplete: (downloadURL: string) => void
) => {
  try {
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        console.error('Error during upload:', error);
        onError(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        onComplete(downloadURL);
      }
    );

    return uploadTask;
  } catch (error) {
    console.error('Error setting up upload task:', error);
    onError(error);
    return null;
  }
};

// Function to get a download URL for a file
export const getFileURL = async (filePath: string) => {
  try {
    const storageRef = ref(storage, filePath);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
};

// Function to delete a file
export const deleteFile = async (filePath: string) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Function to list all files in a directory
export const listFiles = async (directoryPath: string) => {
  try {
    const storageRef = ref(storage, directoryPath);
    const result = await listAll(storageRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          fullPath: itemRef.fullPath,
          url
        };
      })
    );
    
    return files;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}; 