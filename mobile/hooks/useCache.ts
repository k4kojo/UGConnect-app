import { useCallback, useEffect, useState } from 'react';
import { appointmentService, chatService, notificationService, userService, medicalRecordsService } from '../services';
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
  }, [key, fetchFn, ttl]);

  const refresh = useCallback(async () => {
    await loadData(true);
  }, [loadData]);

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
  }, [loadData]);

  useEffect(() => {
    checkStale();
  }, [checkStale]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadData]);

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
  }, [getStats]);

  useEffect(() => {
    getStats();
  }, [getStats]);

  return {
    cacheStats,
    getStats,
    clearCache,
    invalidatePattern,
  };
}
