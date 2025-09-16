import NotificationSkeleton from "@/components/skeleton/NotificationSkeleton";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { readNotification } from "@/redux/notificationsSlice";
import { useAppDispatch } from "@/redux/store";
import { useNotifications } from "@/hooks/useCache";
import { invalidateCacheForNotifications } from "@/services/cacheInterceptor";
import { NotificationItem, notificationService } from "@/services";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import {
  RefreshControl, 
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from "react-native";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";

const NotificationScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  const dispatch = useAppDispatch();
  
  // Use cache service for notifications with auto-refresh
  const { 
    data: notifications, 
    loading: isLoading, 
    refresh: refreshNotifications,
    error: notificationError,
    invalidate: invalidateNotifications,
    isStale 
  } = useNotifications();
  
  const items = notifications || [];

  // Auto-refresh stale data in background
  useEffect(() => {
    if (isStale && !isLoading) {
      refreshNotifications();
    }
  }, [isStale, isLoading]);

  // Calculate unread count for potential badge display
  const unreadCount = useMemo(() => {
    return items.filter(n => !n.isRead).length;
  }, [items]);

  const load = useCallback(async () => {
    await refreshNotifications();
  }, []);

  useEffect(() => {
    if (!items || items.length === 0) {
      refreshNotifications();
    }
  }, [items?.length]);

  useFocusEffect(
    useCallback(() => {
      refreshNotifications();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refreshNotifications();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Simple grouping: unread first, then read
  const groupedNotifications = useMemo(() => {
    const unread = items.filter((n) => !n.isRead);
    const read = items.filter((n) => n.isRead);
    return [
      { date: "Unread", items: unread },
      { date: "Read", items: read },
    ];
  }, [items]);

  const getIcon = (type: string) => {
    switch (type) {
      case "chat":
        return "chatbubble-outline";
      case "reminder":
        return "alert-circle-outline";
      case "system":
        return "information-circle-outline";
      case "appointment":
        return "calendar-outline" as any;
      case "lab_result":
        return "flask-outline" as any;
      case "payment":
        return "card-outline" as any;
      default:
        return "notifications-outline";
    }
  };

  const handlePress = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        // Mark as read in Redux (for immediate UI update)
        dispatch(readNotification(Number(n.id)));
        
        // Invalidate cache to ensure fresh data on next load
        await invalidateCacheForNotifications();
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      // Delete notification via API
      await notificationService.deleteNotification(Number(notificationId));
      
      // Invalidate cache and refresh to get updated data
      await invalidateNotifications();
      await refreshNotifications();
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      
      // Handle specific error cases
      if (error?.response?.status === 403) {
        Alert.alert(
          "Permission Denied",
          "You don't have permission to delete this notification. Only system administrators or the notification owner can delete notifications.",
          [{ text: "OK" }]
        );
      } else if (error?.response?.status === 404) {
        Alert.alert(
          "Notification Not Found",
          "This notification has already been deleted or doesn't exist.",
          [{ text: "OK" }]
        );
        // Refresh the list to remove stale data
        await refreshNotifications();
      } else {
        Alert.alert(
          "Delete Failed",
          "Unable to delete notification. Please try again later.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const renderRightAction = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => handleDelete(notificationId)}
      >
        <Ionicons name="trash-outline" size={24} color="#fff" />
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: themeColors.background,
          paddingTop: 40,
        }}
      >
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t("notifications.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.text}
          />
        }
      >
        {isLoading ? (
          <NotificationSkeleton groups={2} itemsPerGroup={3} />
        ) : notificationError ? (
          <View style={{ padding: 16, alignItems: 'center' }}>
            <Text style={{ color: themeColors.subText, marginBottom: 10 }}>
              Failed to load notifications
            </Text>
            <TouchableOpacity 
              onPress={onRefresh}
              style={{ 
                backgroundColor: Colors.brand.primary, 
                paddingHorizontal: 16, 
                paddingVertical: 8, 
                borderRadius: 8 
              }}
            >
              <Text style={{ color: '#fff' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : items.length === 0 ? (
          <Text style={{ padding: 16, color: themeColors.subText }}>
            {t("notifications.empty")}
          </Text>
        ) : (
          groupedNotifications.map((group) => (
            <View key={group.date}>
              <Text style={[styles.dateHeader, { color: themeColors.subText }]}>
                {group.date}
              </Text>
              {group.items.map((notification) => (
                <Swipeable
                  key={notification.id}
                  renderRightActions={() => renderRightAction(String(notification.id))}
                >
                  <TouchableOpacity
                    onPress={() => handlePress(notification)}
                    style={[
                      styles.notificationItem,
                      {
                        backgroundColor: notification.isRead
                          ? "transparent"
                          : themeColors.card,
                        borderLeftColor: Colors.brand.primary,
                      },
                    ]}
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={getIcon(String(notification.type))}
                        size={20}
                        color={Colors.brand.primary}
                      />
                    </View>
                    <View style={styles.contentContainer}>
                      <Text
                        style={[styles.message, { color: themeColors.subText }]}
                      >
                        {notification.message}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
              ))}
            </View>
          ))
        )}
      </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  container: {
    padding: 16,
  },
  loaderContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  dateHeader: {
    fontSize: 14,
    marginVertical: 16,
    textTransform: "uppercase",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
  timestamp: {
    fontSize: 12,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  deleteAction: {
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  deleteText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});

export default NotificationScreen;
