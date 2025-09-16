import { RootState } from './store';
import { needsBackgroundRefresh, isDataStale, CacheStatus } from '@/types/cache';

// Appointments selectors
export const selectAppointmentsState = (state: RootState) => state.appointments;

export const selectAppointments = (state: RootState) => state.appointments.data;

export const selectAppointmentsLoading = (state: RootState) => {
  const { isFetching, isInitialLoad } = state.appointments;
  // Only show loading for initial load, not for background refresh
  return isFetching && isInitialLoad;
};

export const selectAppointmentsRefreshing = (state: RootState) => state.appointments.isRefreshing;

export const selectAppointmentsError = (state: RootState) => state.appointments.error;

export const selectAppointmentsCacheStatus = (state: RootState): CacheStatus => {
  const { lastFetched, isInitialLoad } = state.appointments;
  return {
    isStale: isDataStale(lastFetched),
    needsBackgroundRefresh: needsBackgroundRefresh(lastFetched),
    isInitialLoad,
    lastFetched,
  };
};

// Doctors selectors
export const selectDoctorsState = (state: RootState) => state.doctors;

export const selectDoctors = (state: RootState) => state.doctors.items || [];

export const selectDoctorsLoading = (state: RootState) => state.doctors.isLoading;

export const selectDoctorsError = (state: RootState) => state.doctors.error;

// Combined selector for appointment screen data
export const selectAppointmentScreenData = (state: RootState) => {
  const appointments = selectAppointments(state);
  const doctors = selectDoctors(state);
  const isLoading = selectAppointmentsLoading(state);
  const isRefreshing = selectAppointmentsRefreshing(state);
  const error = selectAppointmentsError(state);
  const cacheStatus = selectAppointmentsCacheStatus(state);

  return {
    appointments,
    doctors,
    isLoading,
    isRefreshing,
    error,
    cacheStatus,
  };
};
