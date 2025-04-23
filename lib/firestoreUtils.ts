// lib/firestoreUtils.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// Generic function to get document by ID
export const getDocumentById = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to create or update a document
export const setDocument = async (collectionName: string, id: string, data: DocumentData) => {
  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return { id, ...data };
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to create a document with auto-generated ID
export const addDocument = async (collectionName: string, data: DocumentData) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = doc(collectionRef);
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...data };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to update a document
export const updateDocument = async (collectionName: string, id: string, data: DocumentData) => {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to delete a document
export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to get all documents from a collection
export const getCollection = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

// Generic function to query a collection
export const queryCollection = async (
  collectionName: string, 
  conditions: Array<{field: string, operator: string, value: any}>,
  sortBy?: {field: string, direction: 'asc' | 'desc'},
  limitTo?: number
) => {
  try {
    let q = collection(db, collectionName);
    
    // Add where conditions
    if (conditions && conditions.length > 0) {
      const queryConstraints = conditions.map(cond => 
        where(cond.field, cond.operator as any, cond.value)
      );
      
      q = query(q, ...queryConstraints);
    }
    
    // Add orderBy if provided
    if (sortBy) {
      q = query(q, orderBy(sortBy.field, sortBy.direction));
    }
    
    // Add limit if provided
    if (limitTo) {
      q = query(q, limit(limitTo));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
}; 