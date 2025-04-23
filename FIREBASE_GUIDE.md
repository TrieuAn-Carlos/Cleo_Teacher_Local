# Firebase Integration Guide

This guide provides instructions on how to work with Firebase in this Next.js project.

## Firebase Services Used

1. **Firebase Authentication** - For user authentication
2. **Cloud Firestore** - For database and data storage
3. **Firebase Storage** - For file uploads
4. **Firebase Hosting** - For deploying the application

## Firebase Configuration

The Firebase configuration is set up in the following files:

- `lib/firebaseConfig.ts` - Client-side Firebase configuration
- `lib/firebaseAdminConfig.ts` - Server-side Firebase Admin configuration
- `lib/firebaseEnvConfig.ts` - Environment configuration (switching between emulator and cloud)
- `lib/firestoreUtils.ts` - Utility functions for Firestore operations
- `lib/storageUtils.ts` - Utility functions for Storage operations

## Running the Application Locally

To run the application locally with Firebase Emulators:

```bash
# Start the emulators and Next.js development server
npm run dev-with-emulator
```

To run the application locally with Firebase Cloud (production):

```bash
# Start the Next.js development server only
npm run dev
```

## Adding New Firebase Features

### 1. Authentication

Authentication is already set up using Google Sign-In. The `AuthContext.tsx` provides the authentication context and hooks for the application.

To use authentication in your components:

```tsx
import { useAuth } from "../context/AuthContext";

const YourComponent = () => {
  const { user, signInWithGoogle, signOut } = useAuth();

  // Check if user is authenticated
  if (!user) {
    return <button onClick={signInWithGoogle}>Sign In</button>;
  }

  return (
    <div>
      <p>Welcome, {user.displayName}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};
```

### 2. Firestore Database

To interact with Firestore, use the utility functions in `lib/firestoreUtils.ts`:

```tsx
import {
  addDocument,
  getCollection,
  updateDocument,
  deleteDocument,
} from "../lib/firestoreUtils";

// Create a document
const newDoc = await addDocument("collection-name", { data: "value" });

// Get all documents from a collection
const docs = await getCollection("collection-name");

// Get documents with query
const filteredDocs = await queryCollection(
  "collection-name",
  [{ field: "userId", operator: "==", value: user.uid }],
  { field: "createdAt", direction: "desc" },
  10 // limit to 10 results
);

// Update a document
await updateDocument("collection-name", docId, { updatedField: "new value" });

// Delete a document
await deleteDocument("collection-name", docId);
```

### 3. Firebase Storage

To work with Storage, use the utility functions in `lib/storageUtils.ts`:

```tsx
import {
  uploadFile,
  uploadFileWithProgress,
  deleteFile,
} from "../lib/storageUtils";

// Upload a file
const result = await uploadFile("path/to/file.jpg", fileObject);
const downloadURL = result.downloadURL;

// Upload with progress
uploadFileWithProgress(
  "path/to/file.jpg",
  fileObject,
  (progress) => console.log(`Upload progress: ${progress}%`),
  (error) => console.error("Upload error:", error),
  (downloadURL) => console.log("File available at:", downloadURL)
);

// Delete a file
await deleteFile("path/to/file.jpg");
```

## Deployment

To deploy the application to Firebase:

### Option 1: Using the Deployment Script

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

### Option 2: Manual Deployment

```bash
# Build the Next.js application
npm run build

# Deploy to Firebase
firebase deploy
```

## Firebase Security Rules

The Firestore security rules are defined in `firestore.rules`. These rules ensure that:

1. Users can only read and write their own data
2. All operations require authentication
3. Default access is denied unless explicitly allowed

## Firebase Indexes

The Firestore indexes are defined in `firestore.indexes.json`. These indexes optimize queries for your application.

To add a new index:

1. Either manually add it to `firestore.indexes.json`
2. Or run a query locally and follow the Firebase console link in the error message to create the index

## Environment Configuration

By default, the application connects to Firebase Cloud services. To use the Firebase Emulator instead:

1. Edit `lib/firebaseEnvConfig.ts`
2. Set `USE_EMULATOR = true`
3. Start the emulators with `npm run emulator`

## Troubleshooting

If you encounter issues with Firebase:

1. Check the browser console for errors
2. Verify that your Firebase project is properly configured
3. Make sure your security rules allow the operations you're trying to perform
4. Ensure that the Firebase emulators are running if you're using them
5. Verify that your authentication settings are correct in the Firebase console
