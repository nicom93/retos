import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_NM-NDdTebE7pBzDi92C9ABvOieodNB0",
  authDomain: "retos-d1eed.firebaseapp.com",
  projectId: "retos-d1eed",
  storageBucket: "retos-d1eed.firebasestorage.app",
  messagingSenderId: "65422350196",
  appId: "1:65422350196:web:3774f581d17aadc6b9be21"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app; 