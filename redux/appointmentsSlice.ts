import {
  AppointmentRecord,
  createAppointment as createAppointmentApi,
  listAppointments,
} from "@/services/authService";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppointmentsState = {
  items: AppointmentRecord[];
  isLoading: boolean;
  error: string | null;
};

const initialState: AppointmentsState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchAppointments = createAsyncThunk(
  "appointments/fetch",
  async (params?: { status?: string }) => {
    const data = await listAppointments(params);
    return data;
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (
    payload: Parameters<typeof createAppointmentApi>[0],
    { rejectWithValue }
  ) => {
    try {
      const res = await createAppointmentApi(payload);
      return res as any;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to create appointment");
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAppointments.fulfilled,
        (state, action: PayloadAction<AppointmentRecord[]>) => {
          state.isLoading = false;
          state.items = action.payload;
        }
      )
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.error.message as string) || "Failed to load appointments";
      })
      .addCase(createAppointment.pending, (state) => {
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state) => {
        // After creating, we rely on UI to refetch or leave as-is
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.error = (action.payload as string) || (action.error.message as string) || "Failed to create appointment";
      });
  },
});

export default appointmentsSlice.reducer;


