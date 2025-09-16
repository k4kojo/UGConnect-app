import api from './api';

export type NotificationItem = {
  id: number;
  userId: string | null;
  type:
    | "appointment"
    | "lab_result"
    | "chat"
    | "system"
    | "payment"
    | "reminder"
    | string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  message: string;
  isRead: boolean;
  isGlobal: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

export const notificationService = {
  // Fetch all notifications for current user
  fetchNotifications: async (): Promise<NotificationItem[]> => {
    const res = await api.get("/api/v0/notifications/user/notifications");
    return res.data as NotificationItem[];
  },

  // Mark a specific notification as read
  markNotificationRead: async (id: number): Promise<void> => {
    await api.put(`/api/v0/notifications/notifications/${id}/read`);
  },

  // Mark all notifications as read
  markAllNotificationsRead: async (): Promise<void> => {
    await api.put("/api/v0/notifications/user/notifications/read-all");
  },

  // Delete a notification
  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/api/v0/notifications/notifications/${id}`);
  },

  // Get notification settings
  getNotificationSettings: async (): Promise<{
    emailNotifications: boolean;
    pushNotifications: boolean;
  }> => {
    const res = await api.get("/api/v0/notifications/settings");
    return res.data;
  },

  // Update notification settings
  updateNotificationSettings: async (settings: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
  }): Promise<void> => {
    await api.put("/api/v0/notifications/settings", settings);
  },

  // Get unread notification count
  getUnreadCount: async (): Promise<number> => {
    const res = await api.get("/api/v0/notifications/user/notifications/unread-count");
    return res.data.count;
  },
};
