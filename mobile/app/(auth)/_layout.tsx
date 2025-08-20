import Color from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Slot } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function RootLayout() {
  const { theme } = useThemeContext();
  const themeColors = Color[theme];
  const brandColors = Color.brand;

  return (
    <View style={[styles.content, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: brandColors.primary }]}>
        <View style={styles.logoCircle}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>MediConnect</Text>
        <Text style={styles.tagline}>Bringing healthcare to your doorstep</Text>
      </View>
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  header: {
    width: "100%",
    alignItems: "center",
  },
  logoCircle: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 15,
    marginTop: 60,
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#ffffff",
  },
  tagline: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 20,
  },
});
