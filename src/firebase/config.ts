import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD_NM-NDdTebE7pBzDi92C9ABvOieodNB0",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "retos-d1eed.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "retos-d1eed",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "retos-d1eed.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "65422350196",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:65422350196:web:3774f581d17aadc6b9be21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 