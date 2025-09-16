import { auth } from "@/firebase/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { signInWithCustomToken, signOut } from "firebase/auth";
import api from "./api";

// Public, no-auth client for endpoints that must not include Authorization
const publicApi = axios.create({ baseURL: (api.defaults as any).baseURL });

// Helper: fetch Firebase custom token from backend (requires stored authToken)
async function fetchFirebaseCustomToken(): Promise<string | null> {
  try {
    const res = await api.get("/api/v0/user/firebase-token");
    const token = res?.data?.customToken;
    if (!token) return null;
    return token as string;
  } catch (e) {
    console.warn("Failed to fetch Firebase custom token", e);
    return null;
  }
}

// Ensure Firebase client is signed in using backend-issued custom token
export async function ensureFirebaseAuth(): Promise<void> {
  try {
    console.log("ensureFirebaseAuth: Starting, current user:", auth.currentUser?.uid);
    
    if (!auth.currentUser) {
      console.log("ensureFirebaseAuth: No current user, fetching custom token");
      const firebaseToken = await fetchFirebaseCustomToken();
      console.log("ensureFirebaseAuth: Custom token received:", !!firebaseToken);
      
      if (firebaseToken) {
        console.log("ensureFirebaseAuth: Signing in with custom token");
        await signInWithCustomToken(auth, firebaseToken);
        console.log("ensureFirebaseAuth: Sign in successful, new user:", (auth.currentUser as any)?.uid || "unknown");
      } else {
        console.warn("ensureFirebaseAuth: No custom token received");
      }
    } else {
      console.log("ensureFirebaseAuth: User already signed in:", auth.currentUser.uid);
    }
  } catch (e) {
    console.error("ensureFirebaseAuth failed", e);
    throw e;
  }
}

export const authService = {
  // Sign Up
  signUpUser: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    dateOfBirth: string;
    role?: string; // Optional role field
  }) => {
    try {
      const response = await publicApi.post("/api/v0/user/sign-up", {
        ...userData,
        role: userData.role || "patient",
        dateOfBirth: new Date(userData.dateOfBirth).toISOString(),
      });

      const { token, user } = response.data;
      return { success: true, data: user, token };
    } catch (error: any) {
      let errorMessage = "Sign up failed";
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.error || "Invalid input data";
            break;
          case 409:
            errorMessage = "Email already exists";
            break;
          default:
            errorMessage =
              error.response.data.error || "An unexpected error occurred";
        }
      }
      console.error("Signup error details:", error.response?.data);
      return { success: false, error: errorMessage };
    }
  },

  // Sign In
  signInUser: async (email: string, password: string) => {
    try {
      const response = await publicApi.post("/api/v0/user/sign-in", {
        email,
        password,
      });

      const { token, user } = response.data;
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("authUser", JSON.stringify(user));

      // Sign into Firebase with a custom token
      try {
        const firebaseToken = await fetchFirebaseCustomToken();
        if (firebaseToken) {
          await signInWithCustomToken(auth, firebaseToken);
        } else {
          console.warn("No Firebase custom token returned by backend");
        }
      } catch (e) {
        console.warn("Firebase Auth sign-in with custom token failed", e);
      }

      return { success: true, data: user };
    } catch (error: any) {
      let errorMessage = "Sign in failed";
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data.error || "Invalid credentials";
            break;
          case 401:
            errorMessage =
              error.response.data.error || "Incorrect email or password";
            break;
          default:
            errorMessage =
              error.response.data.error || "An unexpected error occurred";
        }
      }
      return { success: false, error: errorMessage };
    }
  },

  // Sign In with Google
  signInWithGoogle: async (idToken: string) => {
    const response = await publicApi.post("/api/v0/user/oauth/google", {
      idToken,
    });
    const { token, user } = response.data;
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authUser", JSON.stringify(user));
    // Sign into Firebase with custom token
    try {
      const firebaseToken = await fetchFirebaseCustomToken();
      if (firebaseToken) {
        await signInWithCustomToken(auth, firebaseToken);
      }
    } catch (e) {
      console.warn("Firebase Auth sign-in (Google) failed", e);
    }
    return { success: true, data: user };
  },

  // Sign In with Apple
  signInWithApple: async (
    identityToken: string,
    profile?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      profilePicture?: string;
    }
  ) => {
    const response = await publicApi.post("/api/v0/user/oauth/apple", {
      identityToken,
      ...profile,
    });
    const { token, user } = response.data;
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authUser", JSON.stringify(user));
    // Sign into Firebase with custom token
    try {
      const firebaseToken = await fetchFirebaseCustomToken();
      if (firebaseToken) {
        await signInWithCustomToken(auth, firebaseToken);
      }
    } catch (e) {
      console.warn("Firebase Auth sign-in (Apple) failed", e);
    }
    return { success: true, data: user };
  },

  // Request Password Reset
  requestPasswordReset: async (email: string) => {
    try {
      const response = await publicApi.post(
        "/api/v0/user/request-password-reset",
        {
          email,
        }
      );
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to request reset password",
      };
    }
  },

  // Reset Password
  resetPassword: async (
    email: string,
    token: string,
    newPassword: string
  ) => {
    try {
      const response = await publicApi.post("/api/v0/user/reset-password", {
        email,
        token,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to reset password",
      };
    }
  },

  // Resend reset token
  resendResetToken: async (email: string) => {
    try {
      const response = await publicApi.post(
        "/api/v0/user/resend-request-password-reset",
        {
          email,
        }
      );
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to resend reset code",
      };
    }
  },

  // Verify reset token
  verifyResetToken: async (email: string, token: string) => {
    try {
      const res = await publicApi.get("/api/v0/user/verify-reset-token", {
        params: { email, code: token, token },
      });
      return { success: true, message: res.data?.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Invalid or expired code",
      };
    }
  },

  // Verify Email
  verifyEmail: async (email: string, token: string) => {
    try {
      const response = await publicApi.get("/api/v0/user/verify-email", {
        params: { email, token },
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Email verification failed",
      };
    }
  },

  // Resend Verification
  resendVerification: async (email: string) => {
    try {
      const response = await publicApi.get("/api/v0/user/resend-verification", {
        params: { email },
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to resend verification",
      };
    }
  },

  // Logout
  logoutUser: async () => {
    try {
      // Sign out from Firebase Auth
      try {
        await signOut(auth);
      } catch (e) {
        console.warn("Firebase Auth signOut failed", e);
      }
      await AsyncStorage.removeItem("authToken");
      await AsyncStorage.removeItem("authUser");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Logout failed" };
    }
  },
};

export function listDoctors() {
  throw new Error('Function not implemented.');
}
