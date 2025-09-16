import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

const SectionSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Skeleton width={160} height={18} borderRadius={8} style={{ backgroundColor: themeColors.subCard }} />
        <Skeleton width={64} height={18} borderRadius={8} style={{ backgroundColor: themeColors.subCard }} />
      </View>
      <View style={[styles.box, { backgroundColor: themeColors.subCard, borderColor: themeColors.border }]}>
        <Skeleton width={"90%"} height={12} style={{ backgroundColor: themeColors.subCard }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 30,
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  box: {
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
  },
});

export default SectionSkeleton;


