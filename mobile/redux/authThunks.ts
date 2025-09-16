import {
  authService,
  userService,
} from "@/services";
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
      const result = await authService.signInUser(email, password);

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
      const result = await authService.signUpUser(userData);

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
      const result = await authService.signInWithGoogle(idToken);
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
      const result = await authService.signInWithApple(idToken, profile);
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
import { logout as logoutAction } from "./authSlice";

export const logoutAndClear = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authService.logoutUser();
    } finally {
      dispatch(logoutAction());
    }
  }
);

export const verifyUserEmail = createAsyncThunk(
  "auth/verifyEmail",
  async ({ email, code }: { email: string; code: string }, { dispatch }) => {
    try {
      const result = await authService.verifyEmail(email, code);

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
      const result = await authService.resendVerification(email);

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
      const user = await userService.getStoredUser();
      if (user) {
        dispatch(loginSuccess(user as any));
      }
      return user;
    } catch (error) {
      console.error("Failed to load user from storage:", error);
      throw error;
    }
  }
);

