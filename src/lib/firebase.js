import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  where,
  getDocs
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let db = null;
let auth = null;
let firebaseError = null;

try {
  if (!firebaseConfig.apiKey) throw new Error("Missing Firebase API Key - check your .env file");
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  firebaseError = error;
}

export {
  db,
  auth,
  firebaseError,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  deleteDoc,
  where,
  getDocs,
  signInAnonymously,
  onAuthStateChanged
};
