// firebase.js - Firebase configuration
// Firebase is Google's free cloud service for:
//   - Storing data (Firestore)
//   - User login (Authentication)
//   - Hosting your website

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Read Firebase configurations from .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services we'll use
export const db = getFirestore(app);      // Firestore database
export const auth = getAuth(app);          // Authentication (login/signup)
export const storage = getStorage(app);    // Storage (for sticker images)

export default app;
