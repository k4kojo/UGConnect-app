import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

const DashboardSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={styles.wrapper}>
      {/* Top bar */}
      <View style={styles.headerRow}>
        <Skeleton width={120} height={36} borderRadius={12} style={{ backgroundColor: themeColors.subCard }} />
        <Skeleton width={48} height={36} borderRadius={12} style={{ backgroundColor: themeColors.subCard }} />
      </View>

      {/* Welcome card */}
      <Skeleton height={60} borderRadius={14} style={{ marginTop: 16, backgroundColor: themeColors.subCard }} />

      {/* Section title */}
      <Skeleton width={180} height={18} borderRadius={8} style={{ marginTop: 24, backgroundColor: themeColors.subCard }} />
      {/* Appointment item */}
      <Skeleton height={64} borderRadius={12} style={{ marginTop: 12, backgroundColor: themeColors.subCard }} />
      <Skeleton width={"80%"} height={10} borderRadius={8} style={{ marginTop: 10, backgroundColor: themeColors.subCard }} />
      <Skeleton height={50} borderRadius={12} style={{ marginTop: 12, backgroundColor: themeColors.subCard }} />

      {/* Another section title */}
      <Skeleton width={160} height={18} borderRadius={8} style={{ marginTop: 26, backgroundColor: themeColors.subCard }} />
      <Skeleton height={50} borderRadius={12} style={{ marginTop: 12, backgroundColor: themeColors.subCard }} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default DashboardSkeleton;


