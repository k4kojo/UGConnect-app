import AsyncStorage from "@react-native-async-storage/async-storage";

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface CacheConfig {
  defaultTTL?: number; // Default TTL in milliseconds (5 minutes)
  maxCacheSize?: number; // Maximum number of items in cache
  enableLogging?: boolean; // Enable debug logging
}

class CacheService {
  private config: Required<CacheConfig>;
  private cache: Map<string, CacheItem<any>>;
  private cacheKeys: Set<string>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 5 * 60 * 1000, // 5 minutes
      maxCacheSize: config.maxCacheSize || 100,
      enableLogging: config.enableLogging || false,
    };
    this.cache = new Map();
    this.cacheKeys = new Set();
    this.loadCacheFromStorage();
  }

  private log(message: string, ...args: any[]) {
    if (this.config.enableLogging) {
      console.log(`[CacheService] ${message}`, ...args);
    }
  }

  private async loadCacheFromStorage() {
    try {
      const cachedData = await AsyncStorage.getItem('app_cache');
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        this.cache = new Map(Object.entries(parsed));
        this.cacheKeys = new Set(this.cache.keys());
        this.log('Cache loaded from storage', this.cache.size, 'items');
      }
    } catch (error) {
      this.log('Failed to load cache from storage:', error);
    }
  }

  private async saveCacheToStorage() {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await AsyncStorage.setItem('app_cache', JSON.stringify(cacheObject));
      this.log('Cache saved to storage', this.cache.size, 'items');
    } catch (error) {
      this.log('Failed to save cache to storage:', error);
    }
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanupExpiredItems() {
    const expiredKeys: string[] = [];
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => {
      this.cache.delete(key);
      this.cacheKeys.delete(key);
    });

    if (expiredKeys.length > 0) {
      this.log('Cleaned up', expiredKeys.length, 'expired items');
    }
  }

  private enforceMaxSize() {
    if (this.cache.size > this.config.maxCacheSize) {
      const items = Array.from(this.cache.entries());
      items.sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by timestamp (oldest first)
      
      const itemsToRemove = items.slice(0, this.cache.size - this.config.maxCacheSize);
      itemsToRemove.forEach(([key]) => {
        this.cache.delete(key);
        this.cacheKeys.delete(key);
      });
      
      this.log('Removed', itemsToRemove.length, 'items to enforce max size');
    }
  }

  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    this.cleanupExpiredItems();
    this.enforceMaxSize();

    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
    };

    this.cache.set(key, cacheItem);
    this.cacheKeys.add(key);
    
    this.log('Cached item:', key, 'TTL:', ttl || this.config.defaultTTL);
    await this.saveCacheToStorage();
  }

  async get<T>(key: string): Promise<T | null> {
    this.cleanupExpiredItems();

    const item = this.cache.get(key);
    if (!item) {
      this.log('Cache miss:', key);
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.cacheKeys.delete(key);
      this.log('Cache item expired:', key);
      await this.saveCacheToStorage();
      return null;
    }

    this.log('Cache hit:', key);
    return item.data as T;
  }

  async has(key: string): Promise<boolean> {
    this.cleanupExpiredItems();
    return this.cache.has(key) && !this.isExpired(this.cache.get(key)!);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    this.cacheKeys.delete(key);
    this.log('Deleted cache item:', key);
    await this.saveCacheToStorage();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.cacheKeys.clear();
    this.log('Cache cleared');
    await AsyncStorage.removeItem('app_cache');
  }

  async getKeys(): Promise<string[]> {
    this.cleanupExpiredItems();
    return Array.from(this.cacheKeys);
  }

  async getStats(): Promise<{
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  }> {
    this.cleanupExpiredItems();
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: 0, // Would need to track hits/misses to calculate
      keys: Array.from(this.cacheKeys),
    };
  }

  // Cache with automatic refresh
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number,
    forceRefresh: boolean = false
  ): Promise<T> {
    if (!forceRefresh) {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    }

    try {
      this.log('Fetching fresh data for:', key);
      const data = await fetchFn();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      this.log('Fetch failed for:', key, error);
      // Return cached data even if expired as fallback
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
      throw error;
    }
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.getKeys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    
    for (const key of matchingKeys) {
      await this.delete(key);
    }
    
    this.log('Invalidated', matchingKeys.length, 'items matching pattern:', pattern);
  }

  // Preload data
  async preload<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<void> {
    try {
      const data = await fetchFn();
      await this.set(key, data, ttl);
      this.log('Preloaded data for:', key);
    } catch (error) {
      this.log('Preload failed for:', key, error);
    }
  }
}

// Create singleton instance
export const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100,
  enableLogging: __DEV__, // Enable logging in development
});

// Cache keys constants
export const CACHE_KEYS = {
  DOCTORS: 'doctors',
  DOCTOR_PROFILE: (id: string) => `doctor_profile_${id}`,
  APPOINTMENTS: 'appointments',
  APPOINTMENT_DETAILS: (id: string) => `appointment_${id}`,
  USER_PROFILE: 'user_profile',
  PATIENT_PROFILE: 'patient_profile',
  CHAT_ROOMS: 'chat_rooms',
  CHAT_MESSAGES: (roomId: string) => `chat_messages_${roomId}`,
  NOTIFICATIONS: 'notifications',
  LAB_RESULTS: 'lab_results',
  MEDICAL_RECORDS: 'medical_records',
  PRESCRIPTIONS: 'prescriptions',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  SETTINGS: 'settings',
} as const;

// Cache TTL constants
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 15 * 60 * 1000, // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  PERSISTENT: 24 * 60 * 60 * 1000, // 24 hours
} as const;
