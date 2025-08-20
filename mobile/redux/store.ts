import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import appointmentsReducer, { fetchAppointments } from "./appointmentsSlice";
import authReducer from "./authSlice";
import doctorsReducer, { fetchDoctors } from "./doctorsSlice";
import notificationsReducer, { fetchNotifications } from "./notificationsSlice";
import profileReducer from "./profileSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    notifications: notificationsReducer,
    profile: profileReducer,
    doctors: doctorsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

// Typed hooks for convenience
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper to prefetch core data after login (or app boot if token exists)
export async function prefetchInitialData(dispatch: AppDispatch) {
  await Promise.all([
    dispatch(fetchAppointments() as any),
    dispatch(fetchDoctors() as any),
    dispatch(fetchNotifications() as any),
  ]);
}
