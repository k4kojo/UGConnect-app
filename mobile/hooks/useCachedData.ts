import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { 
  fetchAppointments, 
  refreshAppointments, 
  clearError as clearAppointmentsError 
} from '@/redux/appointmentsSlice';
import { fetchDoctors } from '@/redux/doctorsSlice';
import { 
  selectAppointmentScreenData,
  selectAppointmentsState,
  selectDoctorsState 
} from '@/redux/selectors';

// Cache-aware hook for appointments data
export const useCachedAppointments = (params?: { status?: string }) => {
  const dispatch = useAppDispatch();
  const appointmentsState = useAppSelector(selectAppointmentsState);
  const { 
    appointments, 
    doctors, 
    isLoading, 
    isRefreshing, 
    error, 
    cacheStatus 
  } = useAppSelector(selectAppointmentScreenData);

  // Initial data fetch - only if needed
  useEffect(() => {
    if (cacheStatus.isInitialLoad || cacheStatus.isStale) {
      dispatch(fetchAppointments(params));
    }
  }, [dispatch, cacheStatus.isInitialLoad, cacheStatus.isStale]);

  // Background refresh when data needs updating
  useEffect(() => {
    if (!cacheStatus.isInitialLoad && cacheStatus.needsBackgroundRefresh && !isRefreshing) {
      dispatch(refreshAppointments(params));
    }
  }, [dispatch, cacheStatus.needsBackgroundRefresh, isRefreshing, cacheStatus.isInitialLoad]);

  // Manual refresh function (for pull-to-refresh)
  const refresh = useCallback(async () => {
    await dispatch(refreshAppointments(params));
  }, [dispatch, params]);

  // Force refresh function (bypasses cache)
  const forceRefresh = useCallback(async () => {
    await dispatch(fetchAppointments({ ...params, forceRefresh: true }));
  }, [dispatch, params]);

  // Clear error function
  const clearError = useCallback(() => {
    dispatch(clearAppointmentsError());
  }, [dispatch]);

  return {
    data: appointments,
    doctors,
    isLoading, // Only true for initial load
    isRefreshing, // True for background refresh
    error,
    refresh,
    forceRefresh,
    clearError,
    cacheStatus,
  };
};

// Hook for doctors data
export const useCachedDoctors = () => {
  const dispatch = useAppDispatch();
  const doctorsState = useAppSelector(selectDoctorsState);

  useEffect(() => {
    if (!doctorsState.items || doctorsState.items.length === 0) {
      dispatch(fetchDoctors());
    }
  }, [dispatch, doctorsState.items]);

  const refresh = useCallback(async () => {
    await dispatch(fetchDoctors());
  }, [dispatch]);

  return {
    data: doctorsState.items || [],
    isLoading: doctorsState.isLoading,
    error: doctorsState.error,
    refresh,
  };
};

// Generic hook factory for creating cache-aware hooks for other data types
export const createCachedDataHook = <T, P = void>(
  fetchAction: any,
  refreshAction: any,
  selector: (state: any) => any,
  clearErrorAction?: any
) => {
  return (params?: P) => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selector);

    useEffect(() => {
      if (state.isInitialLoad || (state.lastFetched && Date.now() - state.lastFetched > 5 * 60 * 1000)) {
        dispatch(fetchAction(params));
      }
    }, [dispatch, state.isInitialLoad, state.lastFetched]);

    const refresh = useCallback(async () => {
      if (refreshAction) {
        await dispatch(refreshAction(params));
      } else {
        await dispatch(fetchAction(params));
      }
    }, [dispatch, params]);

    const clearError = useCallback(() => {
      if (clearErrorAction) {
        dispatch(clearErrorAction());
      }
    }, [dispatch]);

    return {
      data: state.data,
      isLoading: state.isFetching && state.isInitialLoad,
      isRefreshing: state.isRefreshing || false,
      error: state.error,
      refresh,
      clearError,
    };
  };
};
