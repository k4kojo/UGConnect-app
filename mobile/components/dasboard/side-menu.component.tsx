import Colors from "@/constants/colors";
import { useHandleLogout } from "@/hooks/useHandleLogout";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type SideMenuProps = {
  menuSlide: Animated.Value;
  menuVisible: boolean;
  closeMenu: () => void;
  toggleTheme: () => void;
  theme: "light" | "dark";
};

const SideMenu = ({
  menuSlide,
  menuVisible,
  closeMenu,
  toggleTheme,
  theme,
}: SideMenuProps) => {
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { handleLogout } = useHandleLogout();

  if (!menuVisible) return null;

  return (
    <Animated.View
      style={[
        styles.sideMenu,
        {
          right: menuSlide,
          backgroundColor: themeColors.card,
        },
      ]}
    >
      <TouchableOpacity style={styles.menuCloseBtn} onPress={closeMenu}>
        <Ionicons name="close" size={24} color={themeColors.text} />
      </TouchableOpacity>

      <Text style={[styles.menuTitle, { color: themeColors.text }]}>Menu</Text>

      {/* Menu Items */}
      <MenuSection themeColors={themeColors} brandColors={brandColors} onLogout={handleLogout} />

      {/* Theme Toggle */}
      <View
        style={[
          styles.themeToggleContainer,
          { borderTopColor: themeColors.divider },
        ]}
      >
        <TouchableOpacity style={styles.themeToggleRow} onPress={toggleTheme}>
          <Text style={[styles.themeToggleText, { color: themeColors.text }]}>
            {theme === "light" ? "Light Mode" : "Dark Mode"}
          </Text>
          <Ionicons
            name={theme === "dark" ? "sunny" : "moon"}
            size={24}
            color={themeColors.subText}
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const MenuSection = ({ themeColors, brandColors, onLogout }: any) => (
  <>
    <MenuButton
      icon="person-outline"
      label="Profile"
      onPress={() => router.replace("/tabs/profile")}
      themeColors={themeColors}
    />

    <MenuButton
      icon="document-text-outline"
      label="Medical Records"
      onPress={() => router.push("/profile/medical-record")}
      themeColors={themeColors}
    />

    <MenuButton
      icon="settings-outline"
      label="Settings"
      onPress={() => router.replace("/profile/settings")}
      themeColors={themeColors}
    />

    <MenuButton
      icon="help-circle-outline"
      label="Help & Support"
      onPress={() => router.push("/profile/settings")}
      themeColors={themeColors}
    />

    <MenuButton
      icon="log-out-outline"
      label="Logout"
      themeColors={themeColors}
      textColor={themeColors.error}
      iconColor={themeColors.error}
      onPress={onLogout}
    />
  </>
);

const MenuButton = ({
  icon,
  label,
  onPress,
  themeColors,
  textColor,
  iconColor,
}: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress || undefined}>
    {icon && (
      <Ionicons name={icon} size={18} color={iconColor || themeColors.text} />
    )}
    <Text style={{ color: textColor || themeColors.text }}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  sideMenu: {
    position: "absolute",
    paddingTop: 80,
    top: 0,
    bottom: 0,
    width: Dimensions.get("window").width / 1.5,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 10,
    zIndex: 101,
  },
  menuCloseBtn: {
    alignSelf: "flex-end",
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  themeToggleContainer: {
    marginTop: "auto",
    borderTopWidth: 1,
    paddingTop: 20,
  },
  themeToggleText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  themeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  // Add other relevant styles...
});

export default SideMenu;
