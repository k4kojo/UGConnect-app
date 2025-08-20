import { CACHE_KEYS, cacheService } from './cacheService';

// Define cache invalidation rules for different API endpoints
const CACHE_INVALIDATION_RULES = {
  // Appointments
  'POST:/api/v0/appointments': ['appointments'],
  'PUT:/api/v0/appointments': ['appointments'],
  'DELETE:/api/v0/appointments': ['appointments'],
  
  // Chat
  'POST:/api/v0/chat-messages': ['chat'],
  'PUT:/api/v0/chat-messages': ['chat'],
  'DELETE:/api/v0/chat-messages': ['chat'],
  
  // User profile
  'PUT:/api/v0/user': ['user_profile', 'patient_profile'],
  'PUT:/api/v0/patient-profile': ['patient_profile'],
  
  // Notifications
  'PUT:/api/v0/notifications': ['notifications'],
  
  // Lab results
  'POST:/api/v0/lab-results': ['lab_results'],
  'PUT:/api/v0/lab-results': ['lab_results'],
  
  // Medical records
  'POST:/api/v0/medical-records': ['medical_records'],
  'PUT:/api/v0/medical-records': ['medical_records'],
  
  // Prescriptions
  'POST:/api/v0/prescriptions': ['prescriptions'],
  'PUT:/api/v0/prescriptions': ['prescriptions'],
  
  // Payments
  'POST:/api/v0/payments': ['payments'],
  'PUT:/api/v0/payments': ['payments'],
  
  // Reviews
  'POST:/api/v0/user-feedbacks': ['reviews'],
  'PUT:/api/v0/user-feedbacks': ['reviews'],
} as const;

// Helper function to get cache invalidation patterns for an endpoint
function getCacheInvalidationPatterns(method: string, url: string): string[] {
  const key = `${method}:${url}`;
  const patterns = CACHE_INVALIDATION_RULES[key as keyof typeof CACHE_INVALIDATION_RULES];
  return patterns ? [...patterns] : [];
}

// Cache interceptor for axios
export function createCacheInterceptor() {
  return {
    // Request interceptor (optional - for logging)
    request: (config: any) => {
      if (__DEV__) {
        console.log(`[CacheInterceptor] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    
    // Response interceptor - invalidate cache on successful modifications
    response: async (response: any) => {
      const { method, url } = response.config;
      
      // Only invalidate cache for successful modifications (2xx status)
      if (response.status >= 200 && response.status < 300) {
        const patterns = getCacheInvalidationPatterns(method, url);
        
        if (patterns.length > 0) {
          await Promise.allSettled(
            patterns.map(pattern => cacheService.invalidatePattern(pattern))
          );
          
          if (__DEV__) {
            console.log(`[CacheInterceptor] Invalidated patterns:`, patterns);
          }
        }
      }
      
      return response;
    },
    
    // Error interceptor
    error: (error: any) => {
      if (__DEV__) {
        console.error(`[CacheInterceptor] API Error:`, error.response?.status, error.config?.url);
      }
      return Promise.reject(error);
    }
  };
}

// Manual cache invalidation helpers
export const invalidateCacheForAppointment = async (appointmentId?: string) => {
  await cacheService.invalidatePattern('appointments');
  if (appointmentId) {
    await cacheService.delete(CACHE_KEYS.APPOINTMENT_DETAILS(appointmentId));
  }
};

export const invalidateCacheForChat = async (roomId?: string) => {
  await cacheService.invalidatePattern('chat');
  if (roomId) {
    await cacheService.delete(CACHE_KEYS.CHAT_MESSAGES(roomId));
  }
};

export const invalidateCacheForUser = async () => {
  await cacheService.delete(CACHE_KEYS.USER_PROFILE);
  await cacheService.delete(CACHE_KEYS.PATIENT_PROFILE);
};

export const invalidateCacheForNotifications = async () => {
  await cacheService.delete(CACHE_KEYS.NOTIFICATIONS);
};

// Batch cache invalidation
export const invalidateMultipleCaches = async (patterns: string[]) => {
  await Promise.allSettled(
    patterns.map(pattern => cacheService.invalidatePattern(pattern))
  );
  
  if (__DEV__) {
    console.log(`[CacheInterceptor] Batch invalidated patterns:`, patterns);
  }
};
