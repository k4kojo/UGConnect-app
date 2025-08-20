import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config (same as mobile app)
const firebaseConfig = {
  apiKey: "AIzaSyCQ76slAFV1AAEymCrokEGMxB9u48w6Mxw",
  authDomain: "medi-connect-app-70848.firebaseapp.com",
  projectId: "medi-connect-app-70848",
  storageBucket: "medi-connect-app-70848.appspot.com",
  messagingSenderId: "608389858171",
  appId: "1:608389858171:web:10c7af54ad1f5edb5e73de",
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Setup Auth
const auth = getAuth(app);

// Firestore reference
const db = getFirestore(app);

// Storage reference
const storage = getStorage(app);

// Auth state change listener
const subscribeToAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db, storage, subscribeToAuth };

