import { listDoctors } from "@/services/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type DoctorItem = {
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
};

type DoctorsState = {
  items: DoctorItem[];
  isLoading: boolean;
  error: string | null;
};

const initialState: DoctorsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchDoctors = createAsyncThunk("doctors/fetch", async () => {
  const data = await listDoctors();
  return data as DoctorItem[];
});

const doctorsSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchDoctors.fulfilled,
        (state, action: PayloadAction<DoctorItem[]>) => {
          state.isLoading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load doctors";
      });
  },
});

export default doctorsSlice.reducer;


