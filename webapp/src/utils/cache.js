// Simple in-memory cache for API responses
class ApiCache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL
  }

  // Set cache entry with optional TTL
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now() + ttl);
    
    // Clean up expired entries periodically
    this.cleanup();
  }

  // Get cache entry if not expired
  get(key) {
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp || Date.now() > timestamp) {
      // Entry expired or doesn't exist
      this.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  // Delete cache entry
  delete(key) {
    this.cache.delete(key);
    this.timestamps.delete(key);
  }

  // Clear all cache entries
  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.delete(key);
      }
    }
  }

  // Check if key exists and is not expired
  has(key) {
    return this.get(key) !== null;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Create singleton instance
const apiCache = new ApiCache();

// Cache key generators
export const getCacheKey = {
  prescriptions: (userId, role) => `prescriptions_${role}_${userId}`,
  appointments: (userId, role, filters = {}) => `appointments_${role}_${userId}_${JSON.stringify(filters)}`,
  patients: (userId) => `patients_${userId}`,
  labResults: (userId, role) => `labResults_${role}_${userId}`,
  medicalRecords: (userId, role) => `medicalRecords_${role}_${userId}`,
  dashboardStats: (userId, role) => `dashboardStats_${role}_${userId}`,
};

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  prescriptions: 3 * 60 * 1000,    // 3 minutes
  appointments: 2 * 60 * 1000,     // 2 minutes
  patients: 10 * 60 * 1000,        // 10 minutes
  labResults: 5 * 60 * 1000,       // 5 minutes
  medicalRecords: 5 * 60 * 1000,   // 5 minutes
  dashboardStats: 1 * 60 * 1000,   // 1 minute
};

export default apiCache;
