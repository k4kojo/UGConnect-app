import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

type LoaderProps = {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  backgroundColor?: string;
};

const Loader: React.FC<LoaderProps> = ({ 
  size = "large", 
  color, 
  fullScreen = false,
  backgroundColor 
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  
  if (fullScreen) {
    return (
      <View style={[styles.fullScreenContainer, { backgroundColor }]}>
        <ActivityIndicator size={size} color={themeColors.text} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={themeColors.text} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Loader;
