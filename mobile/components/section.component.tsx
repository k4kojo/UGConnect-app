import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = React.PropsWithChildren<{
  title: string;
  viewAll?: boolean;
  emptyMessage: string;
  destination?: string;
}>;

const Section = ({
  title,
  viewAll = true,
  emptyMessage,
  destination,
  children,
}: Props) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        {viewAll && destination && (
          <TouchableOpacity onPress={() => router.push(destination as any)}>
            <Text style={[styles.viewAll, { color: brandColors.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {children ? (
        children
      ) : (
        <View
          style={[
            styles.emptyBox,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.divider,
            },
          ]}
        >
          <Text style={{ color: themeColors.subText }}>{emptyMessage}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  viewAll: {
    fontWeight: "600",
    fontSize: 15,
  },
  emptyBox: {
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 1,
  },
});

export default Section;
