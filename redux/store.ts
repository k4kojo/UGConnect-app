import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import appointmentsReducer from "./appointmentsSlice";
import authReducer from "./authSlice";
import doctorsReducer from "./doctorsSlice";
import notificationsReducer from "./notificationsSlice";
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
