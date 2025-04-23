import admin from 'firebase-admin';
import { getApps, initializeApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { USE_EMULATOR, EMULATOR_CONFIG, logFirebaseEnvironment } from './firebaseEnvConfig';

// In development, always connect to the Emulator
// In production, use credentials
let adminApp: App;
let db: FirebaseFirestore.Firestore;

// Enhanced error handling and debug logging
const debugFirebase = (message: string) => {
  console.log(`[Firebase Debug] ${message}`);
};

// Trong môi trường server, process.env.NODE_ENV luôn tồn tại và đáng tin cậy hơn
// biến USE_EMULATOR có thể không được chuyển từ client sang server
// nên ưu tiên sử dụng isDevelopment
const isDevelopment = process.env.NODE_ENV === 'development';

// Quyết định sử dụng emulator dựa trên môi trường phát triển hoặc biến USE_EMULATOR
const shouldUseEmulator = isDevelopment && USE_EMULATOR;

// Project ID should match the one in your Firebase configuration
const projectId = 'backend-9b778';

try {
  if (!getApps().length) {
    try {
      debugFirebase(`Initializing in ${shouldUseEmulator ? 'EMULATOR' : 'CLOUD'} mode`);
      
      if (shouldUseEmulator) {
        // Initialize Firebase Admin with the SAME projectId as client SDK
        adminApp = initializeApp({
          projectId: projectId,
        });
        
        debugFirebase("Admin app initialized for emulator mode");
        
        try {
          db = getFirestore();
          // Configure connection to Firestore Emulator using config
          db.settings({
            host: `localhost:${EMULATOR_CONFIG.firestorePort}`,
            ssl: false,
          });
          
          debugFirebase(`Attempting to connect to Firestore Emulator at localhost:${EMULATOR_CONFIG.firestorePort}`);
          
          // Test connection to the emulator
          db.collection('_connection_test').doc('test').set({ timestamp: new Date().toISOString() })
            .then(() => debugFirebase("Firestore emulator connection test successful"))
            .catch(err => console.error("Firestore emulator connection test FAILED:", err));
        } catch (emulatorError) {
          console.error("Failed to configure Firestore emulator connection:", emulatorError);
          console.warn("IMPORTANT: Make sure the Firebase emulator is running. Start it with: `firebase emulators:start`");
        }
      } else {
        // For cloud mode, initialize with proper credentials
        // Use Google Application Default Credentials for production environments
        try {
          // First try: Use application default credentials
          adminApp = initializeApp({
            projectId: projectId,
            credential: admin.credential.applicationDefault()
          });
          
          debugFirebase("Admin app initialized with application default credentials");
        } catch (credError) {
          console.warn("Failed to use application default credentials, trying cert:", credError);
          
          // Second try: Check if we have service account as env variable
          // This is a better approach for deployment environments
          if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
              const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
              adminApp = initializeApp({
                credential: cert(serviceAccount)
              });
              debugFirebase("Admin app initialized with service account from env var");
            } catch (saEnvError) {
              console.error("Failed to parse service account from env:", saEnvError);
              
              // Last resort: Try using just project ID (will work if running on GCP/Firebase hosting)
              adminApp = initializeApp({
                projectId: projectId
              });
              debugFirebase("Admin app initialized with project ID only (must be on GCP environment)");
            }
          } else {
            // Last resort: Try initializing without explicit credentials
            // This works in GCP/Firebase deployments through instance metadata
            adminApp = initializeApp({
              projectId: projectId
            });
            debugFirebase("Admin app initialized with project ID only (must be on GCP environment)");
          }
        }
        
        // Initialize Firestore with default settings
        db = getFirestore(adminApp);
        debugFirebase("Firestore instance created successfully for cloud mode");
      }
    } catch (error: any) {
      console.error("Firebase Admin: Initialization failed:", error);
      
      // Try a simpler initialization as a fallback
      try {
        adminApp = initializeApp({
          projectId: projectId
        });
        db = getFirestore(adminApp);
        debugFirebase("Fallback initialization successful");
      } catch (fallbackError) {
        console.error("Even fallback initialization failed:", fallbackError);
        throw new Error(`Failed to initialize Firebase Admin SDK: ${error.message}`);
      }
    }
  } else {
    adminApp = getApps()[0];
    db = getFirestore(adminApp);
    debugFirebase(`Using existing app. Emulator mode: ${shouldUseEmulator}`);
  }

  // Log môi trường hiện tại
  try {
    logFirebaseEnvironment();
  } catch (e) {
    console.log(`[Firebase Environment] Using ${shouldUseEmulator ? 'EMULATOR' : 'CLOUD'} services`);
  }
} catch (error) {
  console.error("Critical error initializing Firebase Admin:", error);
}

export { adminApp, db };