import {
  getStoredUser,
  resendVerification,
  signInUser,
  signInWithApple,
  signInWithGoogle,
  signUpUser,
  verifyEmail,
} from "@/services/authService";
import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  loadingEnd,
  loginFailure,
  loginStart,
  loginSuccess,
  verifyEmailSuccess,
} from "./authSlice";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { dispatch }
  ) => {
    try {
      dispatch(loginStart());
      const result = await signInUser(email, password);

      if (!result.success) {
        throw new Error(result.error);
      }

      dispatch(loginSuccess(result.data as any));
      return result.data as any;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      phoneNumber: string;
      dateOfBirth: string;
    },
    { dispatch }
  ) => {
    try {
      dispatch(loginStart());
      const result = await signUpUser(userData);

      if (!result.success) {
        throw new Error(result.error);
      }
      // Signup returns user+token; stop loading here (UI may navigate next)
      dispatch(loadingEnd());
      return result;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  }
);

export const googleLogin = createAsyncThunk(
  "auth/googleLogin",
  async (idToken: string, { dispatch }) => {
    try {
      dispatch(loginStart());
      const result = await signInWithGoogle(idToken);
      if (!result || !result.success || !result.data) {
        throw new Error("Google sign-in failed");
      }
      dispatch(loginSuccess(result.data as any));
      return result.data as any;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  }
);

export const appleLogin = createAsyncThunk(
  "auth/appleLogin",
  async (
    { idToken, profile }: { idToken: string; profile: any },
    { dispatch }
  ) => {
    try {
      dispatch(loginStart());
      const result = await signInWithApple(idToken, profile);
      if (!result || !result.success || !result.data) {
        throw new Error("Apple sign-in failed");
      }
      dispatch(loginSuccess(result.data as any));
      return result.data as any;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  }
);

// Logout thunk: clear storage and redux state
import { logoutUser } from "@/services/authService";
import { logout as logoutAction } from "./authSlice";

export const logoutAndClear = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await logoutUser();
    } finally {
      dispatch(logoutAction());
    }
  }
);

export const verifyUserEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, code }: { email: string; code: string }, { dispatch }) => {
    try {
      const result = await verifyEmail(email, code);

      if (!result.success) {
        throw new Error(result.error);
      }

      dispatch(verifyEmailSuccess());
      return result;
    } catch (error: any) {
      throw error;
    }
  }
);

export const resendVerificationCode = createAsyncThunk(
  "auth/resendVerification",
  async (email: string, { dispatch }) => {
    try {
      const result = await resendVerification(email);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (error: any) {
      throw error;
    }
  }
);

export const loadUserFromStorage = createAsyncThunk(
  "auth/loadUser",
  async (_, { dispatch }) => {
    try {
      const user = await getStoredUser();
      if (user) {
        dispatch(loginSuccess(user));
      }
      return user;
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      throw error;
    }
  }
);

