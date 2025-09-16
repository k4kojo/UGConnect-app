import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

type Props = {
  count?: number;
};

const AppointmentCardSkeleton: React.FC<Props> = ({ count = 2 }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.card,
            { backgroundColor: themeColors.subCard, borderColor: themeColors.border },
          ]}
        >
          <View style={styles.row}>
            <Skeleton width={44} height={44} borderRadius={22} style={{ backgroundColor: themeColors.subCard }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Skeleton width={"70%"} height={14} style={{ backgroundColor: themeColors.subCard }} />
              <Skeleton width={"40%"} height={12} style={{ marginTop: 8, backgroundColor: themeColors.subCard }} />
            </View>
            <Skeleton width={90} height={22} borderRadius={12} style={{ backgroundColor: themeColors.subCard }} />
          </View>
          <View style={{ marginTop: 14 }}>
            <Skeleton width={"55%"} height={12} style={{ backgroundColor: themeColors.subCard }} />
            <Skeleton width={"35%"} height={12} style={{ marginTop: 8, backgroundColor: themeColors.subCard }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default AppointmentCardSkeleton;


