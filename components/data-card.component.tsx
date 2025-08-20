import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

const DataCard = ({
  data,
}: {
  data: { label: string; value: string; fullWidth?: boolean }[];
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  return (
    <View style={[styles.card, { backgroundColor: themeColors.subCard }]}>
      {data.map((item, index) => (
        <View
          key={index}
          style={[
            styles.dataItem,
            item.fullWidth ? styles.fullWidth : undefined,
          ]}
        >
          <Text style={[styles.dataLabel, { color: themeColors.subText }]}>
            {item.label}
          </Text>
          <Text style={[styles.dataValue, { color: themeColors.text }]}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  dataItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  fullWidth: {
    flexDirection: "column",
  },
  dataLabel: {
    fontSize: 12,
    // color: "#6b7280",
    marginBottom: 4,
  },
  dataValue: {
    fontSize: 14,
    // color: "#111827",
    fontWeight: "600",
  },
});

export default DataCard;
