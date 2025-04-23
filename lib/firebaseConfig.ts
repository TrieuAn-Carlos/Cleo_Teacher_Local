// lib/firebaseConfig.ts

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { connectAuthEmulator } from "firebase/auth";
import { USE_EMULATOR, EMULATOR_CONFIG, logFirebaseEnvironment } from './firebaseEnvConfig';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAZt-JgnTzGnnqN2W5vXyqyyeAEe-y0e1E",
  authDomain: "backend-9b778.firebaseapp.com",
  projectId: "backend-9b778",
  storageBucket: "backend-9b778.appspot.com", // Adjusted to common pattern, original was backend-9b778.firebasestorage.app
  messagingSenderId: "456495360120",
  appId: "1:456495360120:web:f94b224798501c117ea58d",
  measurementId: "G-R1KTY4Z7G1"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp(); // if already initialized, use that one
}

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// --- Emulator Connection Logic --- 
// This should run on both server and client if USE_EMULATOR is true
if (USE_EMULATOR) {
  try {
    console.log(`Attempting to connect Firestore emulator at localhost:${EMULATOR_CONFIG.firestorePort}`);
    connectFirestoreEmulator(db, 'localhost', EMULATOR_CONFIG.firestorePort);
    
    // Auth emulator connection might need the full URL
    const authEmulatorUrl = `http://localhost:${EMULATOR_CONFIG.authPort}`;
    console.log(`Attempting to connect Auth emulator at ${authEmulatorUrl}`);
    connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true }); // Added disableWarnings for cleaner logs
    
    console.log('Successfully connected to Firebase Emulators (Firestore & Auth)');
  } catch (error) {
    console.warn("Error connecting to Firebase Emulators (might be already connected or unavailable):", error);
  }
} else {
  console.log('Using Firebase Cloud services');
}

// Log environment only on the client-side to avoid server logs clutter
if (typeof window !== 'undefined') {
  logFirebaseEnvironment();
}

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, googleProvider, db, functions, storage };