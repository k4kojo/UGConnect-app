import {
  AppointmentRecord,
  appointmentService,
} from "@/services";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CachedData, createInitialCacheState, isDataStale } from "@/types/cache";

type AppointmentsState = CachedData<AppointmentRecord[]>;

const initialState: AppointmentsState = createInitialCacheState<AppointmentRecord[]>([]);

export const fetchAppointments = createAsyncThunk(
  "appointments/fetch",
  async (params: { status?: string; forceRefresh?: boolean } = {}, { getState }) => {
    const state = getState() as any;
    const appointmentsState = state.appointments as AppointmentsState;
    
    // Skip fetch if data is fresh and not forcing refresh
    if (!params?.forceRefresh && !isDataStale(appointmentsState.lastFetched)) {
      return appointmentsState.data;
    }
    
    const data = await appointmentService.listAppointments(params);
    return data;
  }
);

// Background refresh action
export const refreshAppointments = createAsyncThunk(
  "appointments/refresh",
  async (params?: { status?: string }) => {
    const data = await appointmentService.listAppointments(params);
    return data;
  }
);

export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (
    payload: Parameters<typeof appointmentService.createAppointment>[0],
    { rejectWithValue }
  ) => {
    try {
      const res = await appointmentService.createAppointment(payload);
      return res as any;
    } catch (e: any) {
      return rejectWithValue(e?.response?.data?.error || e?.message || "Failed to create appointment");
    }
  }
);

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    invalidateCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initial fetch
      .addCase(fetchAppointments.pending, (state) => {
        if (state.isInitialLoad) {
          state.isFetching = true;
        } else {
          state.isRefreshing = true;
        }
        state.error = null;
      })
      .addCase(
        fetchAppointments.fulfilled,
        (state, action: PayloadAction<AppointmentRecord[]>) => {
          state.isFetching = false;
          state.isRefreshing = false;
          state.isInitialLoad = false;
          state.data = action.payload;
          state.lastFetched = Date.now();
          state.error = null;
        }
      )
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isFetching = false;
        state.isRefreshing = false;
        state.error = (action.error.message as string) || "Failed to load appointments";
      })
      // Background refresh
      .addCase(refreshAppointments.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(
        refreshAppointments.fulfilled,
        (state, action: PayloadAction<AppointmentRecord[]>) => {
          state.isRefreshing = false;
          state.data = action.payload;
          state.lastFetched = Date.now();
          state.error = null;
        }
      )
      .addCase(refreshAppointments.rejected, (state, action) => {
        state.isRefreshing = false;
        state.error = (action.error.message as string) || "Failed to refresh appointments";
      })
      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state) => {
        // Invalidate cache to trigger refresh
        state.lastFetched = null;
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.error = (action.payload as string) || (action.error.message as string) || "Failed to create appointment";
      });
  },
});

export const { clearError, invalidateCache } = appointmentsSlice.actions;

export default appointmentsSlice.reducer;


