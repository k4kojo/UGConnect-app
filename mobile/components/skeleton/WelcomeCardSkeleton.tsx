import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

const WelcomeCardSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={[styles.card, { backgroundColor: themeColors.card }]}> 
      <View style={styles.rowBetween}>
        <Skeleton width={180} height={18} style={{ backgroundColor: themeColors.subCard }} />
        <Skeleton width={50} height={50} borderRadius={25} style={{ backgroundColor: themeColors.subCard }} />
      </View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Skeleton width={32} height={16} borderRadius={6} style={{ backgroundColor: themeColors.subCard }} />
          <Skeleton width={90} height={12} borderRadius={6} style={{ marginTop: 6, backgroundColor: themeColors.subCard }} />
        </View>
        <View style={styles.summaryItem}>
          <Skeleton width={32} height={16} borderRadius={6} style={{ backgroundColor: themeColors.subCard }} />
          <Skeleton width={70} height={12} borderRadius={6} style={{ marginTop: 6, backgroundColor: themeColors.subCard }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginTop: -20,
    borderRadius: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryItem: {
    alignItems: "center",
  },
});

export default WelcomeCardSkeleton;


