import { auth, db } from "@/firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, Timestamp, updateDoc } from "firebase/firestore";

// User profile interface for type safety
export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  createdAt: Timestamp;
}

// Sign up user and store in Firestore
export const signUpUser = async ({
  firstName,
  lastName,
  email,
  password,
  phoneNumber,
  dateOfBirth,
}: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  dateOfBirth: string;
}) => {
  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save additional user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
      createdAt: Timestamp.now(),
    });

    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign in user and fetch Firestore profile
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    const userDocRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userDocRef);

    if (!userSnap.exists()) {
      return { success: false, error: "User profile not found in Firestore." };
    }

    const userData = userSnap.data();
    return { success: true, user, userData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Sign out user
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUserProfile = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userDoc = await getDoc(doc(db, "users", currentUser.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }

  return null;
};

// Update profile
export const updateUserProfile = async (data: Partial<UserProfile>) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, data);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
