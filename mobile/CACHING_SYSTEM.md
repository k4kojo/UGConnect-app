# Caching System Documentation

## Overview

The mobile app implements a comprehensive caching system to improve performance, reduce API calls, and provide a better user experience. The system includes automatic cache invalidation, TTL (Time To Live) management, and React hooks for easy integration.

## Architecture

### Core Components

1. **CacheService** (`services/cacheService.ts`)
   - Main caching engine with TTL support
   - AsyncStorage persistence
   - Automatic cleanup and size management
   - Pattern-based cache invalidation

2. **CachedAuthService** (`services/cachedAuthService.ts`)
   - Cached versions of auth service functions
   - Automatic cache invalidation helpers
   - Preloading functions for better UX

3. **Cache Hooks** (`hooks/useCache.ts`)
   - React hooks for easy cache integration
   - Specialized hooks for common data types
   - Auto-refresh capabilities

4. **Cache Interceptor** (`services/cacheInterceptor.ts`)
   - Automatic cache invalidation on API calls
   - Pattern-based invalidation rules
   - Manual invalidation helpers

## Features

### 🚀 Performance Benefits
- **Reduced API Calls**: Data is cached locally and reused
- **Faster Loading**: Cached data loads instantly
- **Offline Support**: Cached data available when offline
- **Bandwidth Savings**: Fewer network requests

### 🔄 Smart Cache Management
- **TTL (Time To Live)**: Automatic expiration of cached data
- **Size Limits**: Prevents memory overflow
- **Automatic Cleanup**: Removes expired items
- **Pattern Invalidation**: Smart cache invalidation

### 🎯 Easy Integration
- **React Hooks**: Simple hooks for components
- **Automatic Invalidation**: Cache updates when data changes
- **Loading States**: Built-in loading and error states
- **Force Refresh**: Manual refresh capabilities

## Usage

### Basic Usage with Hooks

```typescript
import { useDoctors, useAppointments, usePatientProfile } from '../hooks/useCache';

function MyComponent() {
  const { data: doctors, loading, refresh } = useDoctors();
  const { data: appointments } = useAppointments();
  const { data: profile } = usePatientProfile();

  if (loading) return <LoadingSpinner />;

  return (
    <View>
      <Text>Doctors: {doctors?.length}</Text>
      <Text>Appointments: {appointments?.length}</Text>
      <Text>Profile: {profile?.user?.firstName}</Text>
    </View>
  );
}
```

### Manual Cache Control

```typescript
import { cacheService, CACHE_KEYS, CACHE_TTL } from '../services/cacheService';

// Set cache manually
await cacheService.set('my-key', data, CACHE_TTL.MEDIUM);

// Get cached data
const data = await cacheService.get('my-key');

// Check if data exists
const exists = await cacheService.has('my-key');

// Delete specific cache
await cacheService.delete('my-key');

// Clear all cache
await cacheService.clear();
```

### Cache with Automatic Fetch

```typescript
import { cacheService } from '../services/cacheService';

const data = await cacheService.getOrFetch(
  'doctors',
  () => api.get('/doctors'),
  CACHE_TTL.MEDIUM
);
```

### Manual Cache Invalidation

```typescript
import { invalidateAppointmentsCache, invalidateUserProfileCache } from '../services/cachedAuthService';

// Invalidate specific cache types
await invalidateAppointmentsCache();
await invalidateUserProfileCache();

// Invalidate by pattern
await cacheService.invalidatePattern('appointments');
```

## Cache Keys and TTL

### Cache Keys
```typescript
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
  // ... more keys
};
```

### TTL Constants
```typescript
export const CACHE_TTL = {
  SHORT: 2 * 60 * 1000,      // 2 minutes
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
  PERSISTENT: 24 * 60 * 60 * 1000, // 24 hours
};
```

## Available Hooks

### Specialized Hooks
- `useDoctors()` - Cached doctors list
- `useAppointments(params?)` - Cached appointments with auto-refresh
- `usePatientProfile()` - Cached patient profile
- `useNotifications()` - Cached notifications with auto-refresh
- `useChatRooms()` - Cached chat rooms with auto-refresh
- `useChatMessages(roomId)` - Cached chat messages with auto-refresh

### Generic Hook
```typescript
const { data, loading, error, refresh, invalidate, isStale } = useCache({
  key: 'my-cache-key',
  fetchFn: () => api.get('/my-endpoint'),
  ttl: CACHE_TTL.MEDIUM,
  autoRefresh: true,
  refreshInterval: 5 * 60 * 1000, // 5 minutes
});
```

## Automatic Cache Invalidation

The system automatically invalidates cache when data is modified through API calls:

### Invalidation Rules
```typescript
const CACHE_INVALIDATION_RULES = {
  'POST:/api/v0/appointments': ['appointments'],
  'PUT:/api/v0/appointments': ['appointments'],
  'DELETE:/api/v0/appointments': ['appointments'],
  'POST:/api/v0/chat-messages': ['chat'],
  'PUT:/api/v0/user': ['user_profile', 'patient_profile'],
  // ... more rules
};
```

### Manual Invalidation Helpers
```typescript
import { invalidateCacheForAppointment, invalidateCacheForChat } from '../services/cacheInterceptor';

await invalidateCacheForAppointment(appointmentId);
await invalidateCacheForChat(roomId);
```

## Configuration

### Cache Service Configuration
```typescript
const cacheService = new CacheService({
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxCacheSize: 100,          // Maximum items
  enableLogging: __DEV__,     // Enable in development
});
```

### Hook Configuration
```typescript
const { data } = useCache({
  key: 'my-key',
  fetchFn: () => api.get('/endpoint'),
  ttl: CACHE_TTL.MEDIUM,      // Override default TTL
  autoRefresh: true,          // Enable auto-refresh
  refreshInterval: 2 * 60 * 1000, // 2 minutes
});
```

## Debugging and Monitoring

### Cache Manager Component
```typescript
import { CacheManager } from '../components/CacheManager';

// Show cache manager in development
{__DEV__ && <CacheManager visible={showCacheManager} />}
```

### Cache Statistics
```typescript
import { useCacheManagement } from '../hooks/useCache';

const { cacheStats, getStats, clearCache } = useCacheManagement();

console.log('Cache stats:', cacheStats);
```

### Development Logging
Cache operations are logged in development mode:
```
[CacheService] Cached item: doctors TTL: 300000
[CacheService] Cache hit: appointments
[CacheInterceptor] Invalidated patterns: ['appointments']
```

## Best Practices

### 1. Choose Appropriate TTL
- **Short TTL** (2-5 min): Frequently changing data (notifications, chat)
- **Medium TTL** (5-15 min): Moderately changing data (appointments, doctors)
- **Long TTL** (15+ min): Rarely changing data (user profiles, settings)

### 2. Use Auto-Refresh Wisely
- Enable for real-time data (chat, notifications)
- Disable for static data (user profiles, settings)

### 3. Handle Loading States
```typescript
const { data, loading, error } = useDoctors();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;
```

### 4. Invalidate Cache Appropriately
- Use automatic invalidation for most cases
- Use manual invalidation for complex scenarios
- Consider user actions that should trigger invalidation

### 5. Monitor Cache Performance
- Use cache statistics in development
- Monitor cache hit rates
- Adjust TTL values based on usage patterns

## Migration Guide

### From Direct API Calls
```typescript
// Before
const [doctors, setDoctors] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.get('/doctors').then(setDoctors).finally(() => setLoading(false));
}, []);

// After
const { data: doctors, loading } = useDoctors();
```

### From Manual Cache Management
```typescript
// Before
const [cachedData, setCachedData] = useState(null);
const [lastFetch, setLastFetch] = useState(0);

const fetchData = async () => {
  const now = Date.now();
  if (cachedData && now - lastFetch < 5 * 60 * 1000) {
    return cachedData;
  }
  const data = await api.get('/endpoint');
  setCachedData(data);
  setLastFetch(now);
  return data;
};

// After
const { data, refresh } = useCache({
  key: 'endpoint',
  fetchFn: () => api.get('/endpoint'),
  ttl: CACHE_TTL.MEDIUM,
});
```

## Troubleshooting

### Common Issues

1. **Cache Not Updating**
   - Check TTL settings
   - Verify cache invalidation rules
   - Use force refresh: `refresh(true)`

2. **Memory Issues**
   - Reduce `maxCacheSize`
   - Lower TTL values
   - Clear cache periodically

3. **Stale Data**
   - Check invalidation patterns
   - Verify API response status codes
   - Use manual invalidation if needed

### Debug Commands
```typescript
// Check cache status
const stats = await cacheService.getStats();
console.log('Cache stats:', stats);

// Clear specific cache
await cacheService.invalidatePattern('appointments');

// Force refresh all data
await Promise.all([
  refreshDoctors(),
  refreshAppointments(),
  refreshProfile(),
]);
```

## Performance Metrics

### Expected Improvements
- **API Calls**: 60-80% reduction
- **Loading Times**: 50-70% faster
- **User Experience**: Smoother navigation
- **Offline Capability**: Basic functionality without network

### Monitoring
- Cache hit rates
- Memory usage
- API call frequency
- User interaction responsiveness

## Future Enhancements

1. **Background Sync**: Sync data in background
2. **Conflict Resolution**: Handle data conflicts
3. **Compression**: Compress cached data
4. **Analytics**: Cache performance analytics
5. **Smart Preloading**: Predict user needs
