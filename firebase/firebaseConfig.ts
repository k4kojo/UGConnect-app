import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import {
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCQ76slAFV1AAEymCrokEGMxB9u48w6Mxw",
  authDomain: "medi-connect-app-70848.firebaseapp.com",
  projectId: "medi-connect-app-70848",
  storageBucket: "medi-connect-app-70848.appspot.com", // fixed `.firebasestorage.app` typo
  messagingSenderId: "608389858171",
  appId: "1:608389858171:web:10c7af54ad1f5edb5e73de",
};

// Initialize app
const app = initializeApp(firebaseConfig);

// Setup Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore reference
const db = getFirestore(app);

// Auth state change listener
const subscribeToAuth = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth, db, subscribeToAuth };
