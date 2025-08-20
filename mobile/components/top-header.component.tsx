import Colors from "@/constants/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  screen?: "home" | "appointments" | "consult" | "records" | "profile";
  onLeftPress?: () => void;
  onRightPress?: () => void;
  unreadCount?: number;
};

export default function TopHeader({
  screen,
  onLeftPress,
  onRightPress,
  unreadCount = 0,
}: Props) {
  return (
    <View style={styles.topHeader}>
      {screen === "home" ? (
        <>
          <TouchableOpacity onPress={onLeftPress}>
            <MaterialCommunityIcons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRightPress} style={styles.notificationContainer}>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {unreadCount > 99 ? "99+" : String(unreadCount)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            {(screen ?? "").charAt(0).toUpperCase() + (screen ?? "").slice(1)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: "18%",
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: Colors.brand.primary,
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#fff",
  },
  notificationContainer: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
});