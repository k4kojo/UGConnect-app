import AsyncStorage from "@react-native-async-storage/async-storage";
import api from './api';

export type User = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  role: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PatientProfile = {
  profileId: string;
  userId: string;
  nationalId?: string | null;
  username?: string | null;
  firstName: string;
  lastName: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const userService = {
  // Get stored user from AsyncStorage
  getStoredUser: async (): Promise<User | null> => {
    try {
      const raw = await AsyncStorage.getItem("authUser");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // Fetch authenticated user's combined patient profile (user + patient profile)
  fetchPatientProfile: async (): Promise<{
    profilePicture: any;
    email: any;
    firstName: string;
    role: string;
    phoneNumber: string;
    lastName: string;
    user: User;
    profile: PatientProfile;
  }> => {
    const response = await api.get("/api/v0/patient-profile/me");
    const { user, profile } = response.data;
    // keep local authUser in sync for name/email/phone updates
    if (user) {
      await AsyncStorage.setItem("authUser", JSON.stringify(user));
    }
    return {
      profilePicture: user.profilePicture,
      email: user.email,
      firstName: user.firstName,
      role: user.role,
      phoneNumber: user.phoneNumber,
      lastName: user.lastName,
      user,
      profile
    };
  },

  // Upsert patient profile and return refreshed data
  upsertPatientProfile: async (updates: {
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
  }): Promise<{ 
    profilePicture: any; 
    email: any; 
    firstName: string;
    role: string;
    phoneNumber: string;
    lastName: string;
    user: User; 
    profile: PatientProfile; 
  }> => {
    await api.put("/api/v0/patient-profile/me", updates);
    // fetch updated combined data
    const result = await userService.fetchPatientProfile();
    return result;
  },

  // Update current user profile (partial). Only supported backend fields will be sent.
  updateCurrentUser: async (updates: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string; // ISO or parseable string
    profilePicture?: string; // data URI or URL
  }): Promise<{ success: boolean; data?: User; error?: string }> => {
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
  },

  // Upload profile picture using the dedicated endpoint
  uploadProfilePicture: async (imageUri: string): Promise<{ success: boolean; data?: User; error?: string }> => {
    try {
      const raw = await AsyncStorage.getItem("authUser");
      if (!raw) throw new Error("No authenticated user");
      const currentUser = JSON.parse(raw);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('profilePicture', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await api.post('/api/v0/user/profile-picture/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedUser = response.data.user;
      await AsyncStorage.setItem("authUser", JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to upload profile picture",
      };
    }
  },

  // Delete Account
  deleteAccount: async (): Promise<{
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
  },
};
