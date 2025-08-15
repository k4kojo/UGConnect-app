import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import api from "./api";

// Public, no-auth client for endpoints that must not include Authorization
const publicApi = axios.create({ baseURL: (api.defaults as any).baseURL });

// -------- Appointments --------
export const listDoctors = async () => {
  // Any authenticated role can list, backend will filter for doctor role if needed
  const res = await api.get("/api/v0/doctor-profiles");
  return res.data as {
    id: number;
    doctorId: string | null;
    specialization: string;
    licenseNumber: string;
    bio?: string | null;
    reviews: number;
    rating: number;
    experienceYears?: string | null;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }[];
};

export const createAppointment = async (payload: {
  doctorId: string;
  appointmentDate: string; // ISO string
  appointmentAmount: string | number;
  appointmentMode: "Online" | "In-person";
  reasonForVisit?: string;
  paymentMethod?:
    | "MTN MoMo"
    | "Telecel Cash"
    | "AirtelTigo Cash"
    | "Credit Card";
}) => {
  // Ensure strings sent for number-fields to satisfy backend zod coercion
  const body = {
    ...payload,
    appointmentAmount: String(payload.appointmentAmount),
  };
  const res = await api.post("/api/v0/appointments", body);
  return res.data;
};

export type AppointmentRecord = {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO from backend
  appointmentMode: "Online" | "In-person";
  reasonForVisit?: string | null;
  appointmentAmount: number;
  paidAmount: number;
  paymentMethod?:
    | "MTN MoMo"
    | "Telecel Cash"
    | "AirtelTigo Cash"
    | "Credit Card"
    | null;
  paymentStatus:
    | "pending"
    | "partial"
    | "completed"
    | "failed"
    | "refunded"
    | "processing";
  paymentDate?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled";
  createdAt: string;
  updatedAt: string;
};

export const listAppointments = async (params?: { status?: string }) => {
  const res = await api.get("/api/v0/appointments", { params });
  return res.data as AppointmentRecord[];
};

// Sign Up
export const signUpUser = async (userData: {
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
};

// Sign In
export const signInUser = async (email: string, password: string) => {
  try {
    const response = await publicApi.post("/api/v0/user/sign-in", {
      email,
      password,
    });

    const { token, user } = response.data;
    await AsyncStorage.setItem("authToken", token);
    await AsyncStorage.setItem("authUser", JSON.stringify(user));

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
};

export const signInWithGoogle = async (idToken: string) => {
  const response = await publicApi.post("/api/v0/user/oauth/google", {
    idToken,
  });
  const { token, user } = response.data;
  await AsyncStorage.setItem("authToken", token);
  await AsyncStorage.setItem("authUser", JSON.stringify(user));
  return { success: true, data: user };
};

export const signInWithApple = async (
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
  return { success: true, data: user };
};

// Request Password Reset
export const requestPasswordReset = async (email: string) => {
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
};

// Reset Password
export const resetPassword = async (
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
};

// Resend reset token
export const resendResetToken = async (email: string) => {
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
};

// Verify reset token
export const verifyResetToken = async (email: string, token: string) => {
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
};

// Verify Email
export const verifyEmail = async (email: string, token: string) => {
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
};

// Resend Verification
export const resendVerification = async (email: string) => {
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
};

// Logout
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authUser");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Logout failed" };
  }
};

// Get stored user from AsyncStorage
export const getStoredUser = async () => {
  try {
    const raw = await AsyncStorage.getItem("authUser");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Fetch authenticated user's combined patient profile (user + patient profile)
export const fetchPatientProfile = async () => {
  const response = await api.get("/api/v0/patient-profile/me");
  const { user, profile } = response.data;
  // keep local authUser in sync for name/email/phone updates
  if (user) {
    await AsyncStorage.setItem("authUser", JSON.stringify(user));
  }
  return { user, profile };
};

// Upsert patient profile and return refreshed data
export const upsertPatientProfile = async (updates: {
  nationalId?: string | null;
  username?: string | null;
  firstName?: string;
  lastName?: string;
  gender?: string | null;
  dateOfBirth?: string | null; // ISO or parseable string
  phoneNumber?: string | null;
  email?: string | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
}) => {
  await api.put("/api/v0/patient-profile/me", updates);
  // fetch updated combined data
  return await fetchPatientProfile();
};

// Update current user profile (partial). Only supported backend fields will be sent.
export const updateCurrentUser = async (updates: {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO or parseable string
  profilePicture?: string; // data URI or URL
}) => {
  try {
    const raw = await AsyncStorage.getItem("authUser");
    if (!raw) throw new Error("No authenticated user");
    const currentUser = JSON.parse(raw);
    const userId = currentUser.userId;
    if (!userId) throw new Error("Missing user id");

    const payload: any = {};
    if (updates.firstName !== undefined) payload.firstName = updates.firstName;
    if (updates.lastName !== undefined) payload.lastName = updates.lastName;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.phoneNumber !== undefined)
      payload.phoneNumber = updates.phoneNumber;
    if (updates.dateOfBirth !== undefined && updates.dateOfBirth) {
      const d = new Date(updates.dateOfBirth);
      payload.dateOfBirth = isNaN(d.getTime())
        ? updates.dateOfBirth
        : d.toISOString();
    }
    if (updates.profilePicture !== undefined)
      payload.profilePicture = updates.profilePicture;

    const response = await api.put(`/api/v0/user/${userId}`, payload);
    const updatedUser = response.data.user;
    await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
    return { success: true, data: updatedUser };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to update profile",
    };
  }
};

// Delete Account
export const deleteAccount = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const raw = await AsyncStorage.getItem("authUser");
    if (!raw) throw new Error("No authenticated user");
    const currentUser = JSON.parse(raw);
    const userId = currentUser.userId;
    if (!userId) throw new Error("Missing user id");

    await api.delete(`/api/v0/user/${userId}`);
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("authUser");
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.message ||
        "Failed to delete account",
    };
  }
};

// -------- Notifications --------
export type NotificationItem = {
  id: number;
  userId: string | null;
  type:
    | "appointment"
    | "lab_result"
    | "chat"
    | "system"
    | "payment"
    | "reminder"
    | string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  message: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export const fetchNotifications = async (): Promise<NotificationItem[]> => {
  const res = await api.get("/api/v0/notifications/user/notifications");
  return res.data as NotificationItem[];
};

export const markNotificationRead = async (id: number): Promise<void> => {
  await api.put(`/api/v0/notifications/notifications/${id}/read`);
};
