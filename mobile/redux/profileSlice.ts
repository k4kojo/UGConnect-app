import { fetchPatientProfile, upsertPatientProfile } from "@/services/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type PatientUser = {
  userId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  profilePicture?: string;
};

export type PatientProfile = {
  nationalId?: string | null;
  username?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
};

type ProfileState = {
  user: PatientUser | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: ProfileState = {
  user: null,
  profile: null,
  isLoading: false,
  error: null,
};

export const loadPatientProfile = createAsyncThunk("profile/load", async () => {
  const { user, profile } = await fetchPatientProfile();
  return { user, profile } as { user: PatientUser; profile: PatientProfile };
});

export const savePatientProfile = createAsyncThunk(
  "profile/save",
  async (updates: Parameters<typeof upsertPatientProfile>[0]) => {
    const { user, profile } = await upsertPatientProfile(updates);
    return { user, profile } as { user: PatientUser; profile: PatientProfile };
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPatientProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loadPatientProfile.fulfilled,
        (state, action: PayloadAction<{ user: PatientUser; profile: PatientProfile }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.profile = action.payload.profile;
        }
      )
      .addCase(loadPatientProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load profile";
      })
      .addCase(savePatientProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(
        savePatientProfile.fulfilled,
        (state, action: PayloadAction<{ user: PatientUser; profile: PatientProfile }>) => {
          state.user = action.payload.user;
          state.profile = action.payload.profile;
        }
      )
      .addCase(savePatientProfile.rejected, (state, action) => {
        state.error = action.error.message || "Failed to save profile";
      });
  },
});

export default profileSlice.reducer;


