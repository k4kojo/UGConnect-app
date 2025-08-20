import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import User from "./user.component";

type TabProps = {
  tab: number;
};

const Participants = ({ tab }: TabProps) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    tab === 0 && (
      <View
        style={[
          styles.container,
          {
            backgroundColor: themeColors.subCard,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: themeColors.text }]}>
          Participants
        </Text>
        <User
          initials="Dr"
          name="Dr. Kofi Mensah"
          specialty="General Practice"
          role="Doctor"
        />
        <View style={{ marginTop: 10 }}>
          <User name="Jane Doe" role="Patient" />
        </View>
      </View>
    )
  );
};

export default Participants;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    width: "100%",
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
  },
});
