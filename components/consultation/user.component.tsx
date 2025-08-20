import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

type UserProps = {
  initials?: string;
  name: string;
  specialty?: string;
  role: string;
};

const User = ({ initials, name, specialty, role }: UserProps) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  return (
    <View style={styles.doctorInfo}>
      <View>
        <View
          style={[styles.doctorAvatar, { backgroundColor: themeColors.avatar }]}
        >
          <Text
            style={{
              color: themeColors.text,
              fontSize: 22,
              fontWeight: "bold",
            }}
          >
            {initials}
          </Text>
        </View>
      </View>
      <View>
        <Text style={[styles.name, { color: themeColors.text }]}>{name}</Text>
        {specialty && (
          <Text style={{ color: themeColors.subText }}>{specialty}</Text>
        )}
        <View
          style={[
            styles.role,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={{ color: themeColors.subText }}>{role}</Text>
        </View>
      </View>
    </View>
  );
};

export default User;

const styles = StyleSheet.create({
  doctorInfo: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    gap: 15,
  },
  doctorAvatar: {
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
    borderRadius: 40,
  },
  name: {
    fontSize: 15,
    fontWeight: "bold",
  },
  role: {
    width: 80,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 20,
  },
});
