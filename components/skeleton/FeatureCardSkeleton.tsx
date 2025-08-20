import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

const FeatureCardSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={{ width: "47%" }}>
      <View style={[styles.card, { backgroundColor: themeColors.card }]}> 
        <Skeleton width={50} height={50} borderRadius={8} style={{ backgroundColor: themeColors.subCard }} />
        <Skeleton width={"80%"} height={12} style={{ marginTop: 10, backgroundColor: themeColors.subCard }} />
        <Skeleton width={"70%"} height={10} style={{ marginTop: 8, backgroundColor: themeColors.subCard }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 140,
    padding: 15,
    borderRadius: 16,
    marginVertical: 10,
    alignItems: "center",
  },
});

export default FeatureCardSkeleton;


