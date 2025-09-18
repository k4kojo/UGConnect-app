import { useCallback, useEffect, useState } from 'react';
import { appointmentService, chatService, notificationService, userService, medicalRecordsService, medicationService } from '../services';
import { CACHE_KEYS, CACHE_TTL, cacheService } from '../services/cacheService';

interface UseCacheOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  ttl?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  initialData?: T | null;
}

interface UseCacheReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  invalidate: () => Promise<void>;
  isStale: boolean;
}

export function useCache<T>({
  key,
  fetchFn,
  ttl = CACHE_TTL.MEDIUM,
  autoRefresh = false,
  refreshInterval = 5 * 60 * 1000, // 5 minutes
  initialData = null,
}: UseCacheOptions<T>): UseCacheReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await cacheService.getOrFetch(key, fetchFn, ttl, forceRefresh);
      setData(result);
      setIsStale(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error(`Cache error for key ${key}:`, err);
    } finally {
      setLoading(false);
    }
  }, [key, ttl]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, []);

  const invalidate = useCallback(async () => {
    await cacheService.delete(key);
    setData(null);
    setIsStale(true);
  }, [key]);

  // Check if data is stale
  const checkStale = useCallback(async () => {
    const hasData = await cacheService.has(key);
    setIsStale(!hasData);
  }, [key]);

  useEffect(() => {
    loadData();
  }, [key, ttl]);

  useEffect(() => {
    checkStale();
  }, [key]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
    isStale,
  };
}

// Specialized hooks for common data types
export function useDoctors(forceRefresh = false) {
  return useCache({
    key: CACHE_KEYS.DOCTORS,
    fetchFn: async () => {
      return appointmentService.listDoctors();
    },
    ttl: CACHE_TTL.MEDIUM,
    autoRefresh: false,
  });
}

export function useAppointments(params?: { status?: string; limit?: number }) {
  const cacheKey = `${CACHE_KEYS.APPOINTMENTS}_${JSON.stringify(params || {})}`;
  
  return useCache({
    key: cacheKey,
    fetchFn: async () => {
      return appointmentService.listAppointments(params);
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: true,
    refreshInterval: 2 * 60 * 1000, // 2 minutes
  });
}

export function usePatientProfile() {
  return useCache({
    key: CACHE_KEYS.PATIENT_PROFILE,
    fetchFn: async () => {
      return userService.fetchPatientProfile();
    },
    ttl: CACHE_TTL.LONG,
    autoRefresh: false,
  });
}

export function useNotifications() {
  return useCache({
    key: CACHE_KEYS.NOTIFICATIONS,
    fetchFn: async () => {
      return notificationService.fetchNotifications();
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: true,
    refreshInterval: 1 * 60 * 1000, // 1 minute
  });
}

export function useChatRooms() {
  return useCache({
    key: CACHE_KEYS.CHAT_ROOMS,
    fetchFn: async () => {
      return chatService.listChatRooms();
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: true,
    refreshInterval: 30 * 1000, // 30 seconds
  });
}

export function useChatMessages(roomId: string) {
  return useCache({
    key: CACHE_KEYS.CHAT_MESSAGES(roomId),
    fetchFn: async () => {
      return chatService.listRoomMessages(roomId);
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: true,
    refreshInterval: 10 * 1000, // 10 seconds
  });
}

// Medical records related hooks
export function useMedicalRecords() {
  return useCache({
    key: CACHE_KEYS.MEDICAL_RECORDS,
    fetchFn: async () => {
      return medicalRecordsService.getMedicalRecords();
    },
    ttl: CACHE_TTL.LONG,
    autoRefresh: false,
  });
}

export function usePrescriptions() {
  return useCache({
    key: CACHE_KEYS.PRESCRIPTIONS,
    fetchFn: async () => {
      return medicalRecordsService.getPrescriptions();
    },
    ttl: CACHE_TTL.LONG,
    autoRefresh: false,
  });
}

export function useLabResults() {
  return useCache({
    key: CACHE_KEYS.LAB_RESULTS,
    fetchFn: async () => {
      return medicalRecordsService.getLabResults();
    },
    ttl: CACHE_TTL.LONG,
    autoRefresh: false,
  });
}

// Medication-related hooks
export function useMedications() {
  return useCache({
    key: CACHE_KEYS.MEDICATIONS,
    fetchFn: async () => {
      // Fetch all medications (both active and inactive) to support filtering
      return medicationService.getMyMedications();
    },
    ttl: CACHE_TTL.MEDIUM,
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMedicationDetails(medicationId: string) {
  return useCache({
    key: CACHE_KEYS.MEDICATION_DETAILS(medicationId),
    fetchFn: async () => {
      const response = await medicationService.getMedicationById(medicationId);
      return response.data;
    },
    ttl: CACHE_TTL.MEDIUM,
    autoRefresh: false,
  });
}

export function useMedicationLogs(medicationId: string, params?: { status?: 'taken' | 'skipped' | 'missed'; days?: number }) {
  const cacheKey = `${CACHE_KEYS.MEDICATION_LOGS(medicationId)}_${JSON.stringify(params || {})}`;
  
  return useCache({
    key: cacheKey,
    fetchFn: async () => {
      const queryParams: any = { limit: 50 };
      if (params?.status) queryParams.status = params.status;
      if (params?.days) {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - params.days * 24 * 60 * 60 * 1000);
        queryParams.startDate = startDate.toISOString();
        queryParams.endDate = endDate.toISOString();
      }
      
      const response = await medicationService.getMedicationLogs(medicationId, queryParams);
      return response.data.medications || [];
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: true,
    refreshInterval: 2 * 60 * 1000, // 2 minutes
  });
}

export function useMedicationAdherence(medicationId: string, days: number = 30) {
  return useCache({
    key: `${CACHE_KEYS.MEDICATION_ADHERENCE(medicationId)}_${days}`,
    fetchFn: async () => {
      const response = await medicationService.getMedicationAdherence(medicationId, days);
      return response.data;
    },
    ttl: CACHE_TTL.MEDIUM,
    autoRefresh: true,
    refreshInterval: 10 * 60 * 1000, // 10 minutes
  });
}

export function useUpcomingReminders() {
  return useCache({
    key: CACHE_KEYS.UPCOMING_REMINDERS,
    fetchFn: async () => {
      return medicationService.getUpcomingReminders();
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: true,
    refreshInterval: 1 * 60 * 1000, // 1 minute
  });
}

export function useOverallAdherence(days: number = 30) {
  return useCache({
    key: `${CACHE_KEYS.OVERALL_ADHERENCE}_${days}`,
    fetchFn: async () => {
      return medicationService.getOverallAdherence(days);
    },
    ttl: CACHE_TTL.MEDIUM,
    autoRefresh: true,
    refreshInterval: 10 * 60 * 1000, // 10 minutes
  });
}

// Additional specialized hooks for other data types
export function usePaymentHistory() {
  return useCache({
    key: CACHE_KEYS.PAYMENTS,
    fetchFn: async () => {
      // This would be implemented when payment service is available
      return [];
    },
    ttl: CACHE_TTL.LONG,
    autoRefresh: false,
  });
}

export function useDoctorProfile(doctorId: string) {
  return useCache({
    key: CACHE_KEYS.DOCTOR_PROFILE(doctorId),
    fetchFn: async () => {
      const doctors = await appointmentService.listDoctors();
      return doctors.find((d: any) => String(d.doctorId) === String(doctorId));
    },
    ttl: CACHE_TTL.MEDIUM,
    autoRefresh: false,
  });
}

export function useAppointmentDetails(appointmentId: string) {
  return useCache({
    key: CACHE_KEYS.APPOINTMENT_DETAILS(appointmentId),
    fetchFn: async () => {
      return appointmentService.getAppointmentById(appointmentId);
    },
    ttl: CACHE_TTL.SHORT,
    autoRefresh: false,
  });
}

// Cache management hook
export function useCacheManagement() {
  const [cacheStats, setCacheStats] = useState<{
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } | null>(null);

  const getStats = useCallback(async () => {
    const stats = await cacheService.getStats();
    setCacheStats(stats);
  }, []);

  const clearCache = useCallback(async () => {
    await cacheService.clear();
    setCacheStats(null);
  }, []);

  const invalidatePattern = useCallback(async (pattern: string) => {
    await cacheService.invalidatePattern(pattern);
    await getStats();
  }, []);

  useEffect(() => {
    getStats();
  }, []);

  return {
    cacheStats,
    getStats,
    clearCache,
    invalidatePattern,
  };
}
