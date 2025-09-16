import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Divider() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={styles.dividerContainer}>
      <View
        style={[styles.divider, { backgroundColor: themeColors.divider }]}
      />
      <Text style={[styles.orText, { color: themeColors.subText }]}>or</Text>
      <View
        style={[styles.divider, { backgroundColor: themeColors.divider }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: "500",
  },
});
