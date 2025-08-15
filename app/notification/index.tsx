import NotificationSkeleton from "@/components/skeleton/NotificationSkeleton";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { fetchNotifications, readNotification } from "@/redux/notificationsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { NotificationItem } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshControl, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const NotificationScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  const dispatch = useAppDispatch();
  const { items, isLoading } = useAppSelector((s) => s.notifications);

  const load = useCallback(async () => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchNotifications());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

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
      dispatch(readNotification(Number(n.id)));
    }
  };

  return (
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
                <TouchableOpacity
                  key={notification.id}
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
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
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
});

export default NotificationScreen;
