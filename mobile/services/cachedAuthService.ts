import * as authService from './authService';
import { CACHE_KEYS, CACHE_TTL, cacheService } from './cacheService';

// Cached versions of auth service functions
export const cachedListDoctors = async (forceRefresh = false) => {
  return cacheService.getOrFetch(
    CACHE_KEYS.DOCTORS,
    () => authService.listDoctors(),
    CACHE_TTL.MEDIUM,
    forceRefresh
  );
};

export const cachedFetchPatientProfile = async (forceRefresh = false) => {
  return cacheService.getOrFetch(
    CACHE_KEYS.PATIENT_PROFILE,
    () => authService.fetchPatientProfile(),
    CACHE_TTL.LONG,
    forceRefresh
  );
};

export const cachedListAppointments = async (params?: { status?: string; limit?: number }, forceRefresh = false) => {
  const cacheKey = `${CACHE_KEYS.APPOINTMENTS}_${JSON.stringify(params || {})}`;
  return cacheService.getOrFetch(
    cacheKey,
    () => authService.listAppointments(params),
    CACHE_TTL.SHORT,
    forceRefresh
  );
};

export const cachedListChatRooms = async (forceRefresh = false) => {
  return cacheService.getOrFetch(
    CACHE_KEYS.CHAT_ROOMS,
    () => authService.listChatRooms(),
    CACHE_TTL.SHORT,
    forceRefresh
  );
};

export const cachedListRoomMessages = async (chatRoomId: string, forceRefresh = false) => {
  return cacheService.getOrFetch(
    CACHE_KEYS.CHAT_MESSAGES(chatRoomId),
    () => authService.listRoomMessages(chatRoomId),
    CACHE_TTL.SHORT,
    forceRefresh
  );
};

export const cachedFetchNotifications = async (forceRefresh = false) => {
  return cacheService.getOrFetch(
    CACHE_KEYS.NOTIFICATIONS,
    () => authService.fetchNotifications(),
    CACHE_TTL.SHORT,
    forceRefresh
  );
};

// Cache invalidation functions
export const invalidateAppointmentsCache = async () => {
  await cacheService.invalidatePattern('appointments');
};

export const invalidateChatCache = async () => {
  await cacheService.invalidatePattern('chat');
};

export const invalidateUserProfileCache = async () => {
  await cacheService.delete(CACHE_KEYS.USER_PROFILE);
  await cacheService.delete(CACHE_KEYS.PATIENT_PROFILE);
};

export const invalidateNotificationsCache = async () => {
  await cacheService.delete(CACHE_KEYS.NOTIFICATIONS);
};

export const invalidateAllCache = async () => {
  await cacheService.clear();
};

// Preload functions for better UX
export const preloadUserData = async () => {
  await Promise.allSettled([
    cacheService.preload(CACHE_KEYS.PATIENT_PROFILE, () => authService.fetchPatientProfile(), CACHE_TTL.LONG),
    cacheService.preload(CACHE_KEYS.APPOINTMENTS, () => authService.listAppointments(), CACHE_TTL.SHORT),
    cacheService.preload(CACHE_KEYS.NOTIFICATIONS, () => authService.fetchNotifications(), CACHE_TTL.SHORT),
  ]);
};

export const preloadDoctorsList = async () => {
  await cacheService.preload(CACHE_KEYS.DOCTORS, () => authService.listDoctors(), CACHE_TTL.MEDIUM);
};

// Export original functions for direct access when needed
export {
  authService, CACHE_KEYS,
  CACHE_TTL, cacheService
};

