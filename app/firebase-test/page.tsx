"use client";

import { useState, useEffect } from 'react';
import { db, auth } from '../../lib/firebaseConfig';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

export default function FirebaseTestPage() {
  const [testStatus, setTestStatus] = useState<{
    firestore: string;
    auth: string;
  }>({
    firestore: 'Not Tested',
    auth: 'Not Tested'
  });
  
  const [testData, setTestData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testFirestoreConnection = async () => {
    try {
      setTestStatus(prev => ({ ...prev, firestore: 'Testing...' }));
      
     
      const testCollection = collection(db, 'test');
      const docRef = await addDoc(testCollection, {
        message: 'Testing connection to Firebase Emulator',
        timestamp: new Date().toISOString()
      });
      
      // Đọc data từ Firestore
      console.log('Document written with ID: ', docRef.id);
      const q = query(testCollection, limit(5));
      const querySnapshot = await getDocs(q);
      
      const data: any[] = [];
      querySnapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      setTestData(data);
      setTestStatus(prev => ({ ...prev, firestore: 'Success' }));
    } catch (err) {
      console.error('Firestore test error:', err);
      setTestStatus(prev => ({ ...prev, firestore: 'Failed' }));
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };
  
  const testAuthConnection = async () => {
    try {
      setTestStatus(prev => ({ ...prev, auth: 'Testing...' }));
      
      // Đăng nhập ẩn danh
      const result = await signInAnonymously(auth);
      if (result.user) {
        setTestStatus(prev => ({ ...prev, auth: 'Success' }));
      } else {
        setTestStatus(prev => ({ ...prev, auth: 'No User' }));
      }
    } catch (err) {
      console.error('Auth test error:', err);
      setTestStatus(prev => ({ ...prev, auth: 'Failed' }));
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Firebase Emulator Connection Test</h1>
      
      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl mb-2">Connection Status:</h2>
        <div className="mb-2">
          <span className="font-bold">Firestore: </span>
          <span className={`px-2 py-1 rounded ${
            testStatus.firestore === 'Success' ? 'bg-green-100 text-green-800' : 
            testStatus.firestore === 'Failed' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {testStatus.firestore}
          </span>
        </div>
        
        <div className="mb-4">
          <span className="font-bold">Auth: </span>
          <span className={`px-2 py-1 rounded ${
            testStatus.auth === 'Success' ? 'bg-green-100 text-green-800' : 
            testStatus.auth === 'Failed' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {testStatus.auth}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <button 
            onClick={testFirestoreConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Firestore
          </button>
          
          <button 
            onClick={testAuthConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Auth
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 mb-4 bg-red-100 text-red-800 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {testData.length > 0 && (
        <div className="p-4 border rounded">
          <h2 className="text-xl mb-2">Firestore Test Data:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}