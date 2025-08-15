import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

type TabProps = {
  tab: number;
  title: string;
  content?: string;
  children?: React.ReactNode;
};

const NotesAndRecordings = ({ tab, title, content, children }: TabProps) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  if (tab !== 0) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.subCard,
          borderColor: themeColors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>

      {content ? (
        <Text style={[styles.customContent, { color: themeColors.subText }]}>
          {content}
        </Text>
      ) : (
        <View style={styles.customContent}>{children}</View>
      )}
    </View>
  );
};

export default NotesAndRecordings;

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
  contentText: {
    width: 328,
    height: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  customContent: {
    width: 328,
    padding: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
});
