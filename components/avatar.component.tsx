import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React, { useMemo } from "react";
import { Image, ImageStyle, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type AvatarProps = {
  imageUrl?: string | null;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  size?: number; // diameter
  imageStyle?: ImageStyle;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
  border?: boolean;
};

const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  firstName,
  lastName,
  fullName,
  size = 50,
  imageStyle,
  containerStyle,
  textStyle,
  border = true,
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const initials = useMemo(() => {
    const name = fullName && fullName.trim().length > 0
      ? fullName
      : [firstName, lastName].filter(Boolean).join(" ");
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    const value = `${first}${second}`.toUpperCase();
    return value || "?";
  }, [firstName, lastName, fullName]);

  const dimension: ImageStyle = { width: size, height: size, borderRadius: size / 2 } as const;

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          dimension,
          { backgroundColor: "transparent" },
          border && { borderWidth: 1, borderColor: themeColors.border },
          imageStyle,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        dimension as ViewStyle,
        styles.fallback,
        { backgroundColor: themeColors.card },
        border && { borderWidth: 1, borderColor: themeColors.border },
        containerStyle,
      ]}
    >
      <Text style={[styles.initials, { color: themeColors.text }, textStyle]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  initials: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default Avatar;
