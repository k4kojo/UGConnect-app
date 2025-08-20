# Data Caching System

This document explains how the data caching system works in the hospital management system.

## Overview

The caching system prevents screens from reloading data every time you navigate to them. Data is loaded once when the app starts and cached for subsequent visits.

## How It Works

### 1. DataContext Provider

The `DataContext` wraps the entire application and manages cached data:

```jsx
// App.jsx
<AuthProvider>
  <DataProvider>
    <AppRoutes />
  </DataProvider>
</AuthProvider>
```

### 2. Cached Data Types

The system caches the following data types:

- **Doctor Data**: `doctorDashboard`, `doctorRecentActivity`, `doctorAppointments`, `doctorPatients`
- **Admin Data**: `adminDashboard`, `adminRecentActivity`, `adminAppointments`, `adminPatients`, etc.
- **Shared Data**: `prescriptions`, `labResults`, `consultations`, `notifications`, `chatRooms`, `chatMessages`

### 3. Cache Duration

Data is cached for **5 minutes** by default. After this time, the data is considered "stale" and will be refreshed on the next access.

### 4. Automatic Data Loading

When a user logs in, the system automatically loads initial data based on their role:

- **Doctors**: Dashboard stats and recent activity
- **Admins**: Dashboard stats and recent activity

## Usage Examples

### Using Cached Data in Components

```jsx
import { useData } from '../../contexts/DataContext.jsx';

const MyComponent = () => {
  const { data, loading, error, fetchPrescriptions } = useData();
  
  // Use cached data
  const prescriptions = data.prescriptions || [];
  
  // Load data if not already cached
  useEffect(() => {
    if (!data.prescriptions) {
      fetchPrescriptions();
    }
  }, [data.prescriptions, fetchPrescriptions]);
  
  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  
  return (
    <div>
      {loading ? <LoadingSpinner /> : (
        <DataTable data={prescriptions} />
      )}
    </div>
  );
};
```

### Force Refresh Data

```jsx
const { fetchPrescriptions } = useData();

// Force refresh (ignores cache)
const handleRefresh = () => {
  fetchPrescriptions(true); // true = force refresh
};
```

### Check if Data is Stale

```jsx
const { isDataStale } = useData();

// Check if prescriptions data is stale
const isStale = isDataStale('prescriptions');
```

## Benefits

1. **Faster Navigation**: Screens load instantly when data is cached
2. **Reduced API Calls**: Fewer requests to the backend
3. **Better UX**: No loading spinners on every navigation
4. **Automatic Refresh**: Data stays fresh with 5-minute cache duration

## Implementation Status

### ✅ Completed
- DataContext setup
- Doctor Dashboard caching
- Admin Dashboard caching
- Prescriptions screen caching
- Doctor Lab Results caching
- Doctor Consultations caching
- Doctor Patients caching
- Doctor Notifications caching
- Admin Lab Results caching
- Admin Consultations caching
- Admin Chat caching
- Admin Appointments caching

### 🔄 In Progress
- Testing and optimization

### 📋 To Do
- Add cache invalidation on data updates
- Add cache persistence across browser sessions
- Performance monitoring and optimization

## Best Practices

1. **Always check for cached data first**:
   ```jsx
   const prescriptions = data.prescriptions || [];
   ```

2. **Load data only if not cached**:
   ```jsx
   useEffect(() => {
     if (!data.prescriptions) {
       fetchPrescriptions();
     }
   }, [data.prescriptions, fetchPrescriptions]);
   ```

3. **Handle loading and error states**:
   ```jsx
   if (loading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   ```

4. **Use force refresh sparingly**:
   ```jsx
   // Only force refresh when user explicitly requests it
   const handleRefresh = () => fetchPrescriptions(true);
   ```

## Cache Management

### Clearing Cache
The cache is automatically cleared when:
- User logs out
- User switches roles
- App is refreshed

### Cache Keys
Each data type has a unique cache key:
- `doctorDashboard`
- `adminDashboard`
- `prescriptions`
- `labResults`
- etc.

### Cache Invalidation
Data becomes stale after 5 minutes. You can customize this by changing `CACHE_DURATION` in `DataContext.jsx`.
