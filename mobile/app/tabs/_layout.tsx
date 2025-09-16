import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brand.primary,
        tabBarInactiveTintColor: themeColors.inactive,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          borderTopColor: themeColors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointment"
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "calendar-clear" : "calendar-clear-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="consultation"
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "videocam" : "videocam-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="records"
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "folder" : "folder-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person-circle-sharp" : "person-circle-outline"}
              size={25}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
