import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, PersistConfig } from "redux-persist";
import appointmentsReducer, { fetchAppointments } from "./appointmentsSlice";
import authReducer from "./authSlice";
import doctorsReducer, { fetchDoctors } from "./doctorsSlice";
import notificationsReducer, { fetchNotifications } from "./notificationsSlice";
import profileReducer from "./profileSlice";
import { CachedData } from "@/types/cache";
import { AppointmentRecord } from "@/services";
import { DoctorItem } from "./doctorsSlice";
import { PatientUser, PatientProfile } from "./profileSlice";

// Persist configuration for individual slices
const appointmentsPersistConfig: PersistConfig<CachedData<AppointmentRecord[]>> = {
  key: 'appointments',
  storage: AsyncStorage,
};

const doctorsPersistConfig: PersistConfig<{
  items: DoctorItem[];
  isLoading: boolean;
  error: string | null;
}> = {
  key: 'doctors',
  storage: AsyncStorage,
};

const profilePersistConfig: PersistConfig<{
  user: PatientUser | null;
  profile: PatientProfile | null;
  isLoading: boolean;
  error: string | null;
}> = {
  key: 'profile',
  storage: AsyncStorage,
};

// Create persisted reducers
const persistedAppointmentsReducer = persistReducer(appointmentsPersistConfig, appointmentsReducer);
const persistedProfileReducer = persistReducer(profilePersistConfig, profileReducer);
const persistedDoctorsReducer = persistReducer(doctorsPersistConfig, doctorsReducer);

const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: persistedAppointmentsReducer,
    notifications: notificationsReducer,
    profile: persistedProfileReducer,
    doctors: persistedDoctorsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

// Typed hooks for convenience
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper to prefetch core data after login (or app boot if token exists)
export async function prefetchInitialData(dispatch: AppDispatch) {
  try {
    // Check if user is authenticated before making API calls
    const token = await AsyncStorage.getItem("authToken");
    
    if (!token) {
      console.log("[Prefetch] No auth token found, skipping data prefetch");
      return;
    }
    
    console.log("[Prefetch] Auth token found, prefetching data...");
    // Only fetch if not already cached or stale
    await Promise.all([
      dispatch(fetchAppointments({})),
      dispatch(fetchDoctors()),
      dispatch(fetchNotifications()),
    ]);
  } catch (error) {
    console.error("[Prefetch] Error during data prefetch:", error);
  }
}
