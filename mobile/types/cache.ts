// Cache-related types for Redux state management
export interface CacheMetadata {
  lastFetched: number | null;
  isInitialLoad: boolean;
  isFetching: boolean;
  isRefreshing: boolean;
  error: string | null;
}

export interface CachedData<T> extends CacheMetadata {
  data: T;
}

// Cache configuration
export const CACHE_CONFIG = {
  // Cache duration in milliseconds (5 minutes)
  STALE_TIME: 5 * 60 * 1000,
  // Background refresh threshold (2 minutes)
  BACKGROUND_REFRESH_TIME: 2 * 60 * 1000,
} as const;

// Helper to check if data is stale
export const isDataStale = (lastFetched: number | null, staleTime = CACHE_CONFIG.STALE_TIME): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > staleTime;
};

// Helper to check if data needs background refresh
export const needsBackgroundRefresh = (lastFetched: number | null): boolean => {
  if (!lastFetched) return true;
  return Date.now() - lastFetched > CACHE_CONFIG.BACKGROUND_REFRESH_TIME;
};

// Helper to create initial cache state
export const createInitialCacheState = <T>(initialData: T): CachedData<T> => ({
  data: initialData,
  lastFetched: null,
  isInitialLoad: true,
  isFetching: false,
  isRefreshing: false,
  error: null,
});

// Cache status type for components
export interface CacheStatus {
  isStale: boolean;
  needsBackgroundRefresh: boolean;
  isInitialLoad: boolean;
  lastFetched: number | null;
}
