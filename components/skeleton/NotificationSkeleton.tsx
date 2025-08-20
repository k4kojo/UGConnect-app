import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

type Props = {
  groups?: number; // number of date groups
  itemsPerGroup?: number; // items per date group
};

const NotificationSkeleton: React.FC<Props> = ({ groups = 1, itemsPerGroup = 3 }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={styles.container}>
      {Array.from({ length: groups }).map((_, gi) => (
        <View key={`g_${gi}`}>
          <Skeleton width={120} height={14} borderRadius={6} style={{ marginVertical: 16, backgroundColor: themeColors.subCard }} />
          {Array.from({ length: itemsPerGroup }).map((__, ii) => (
            <View
              key={`i_${gi}_${ii}`}
              style={[styles.row, { backgroundColor: themeColors.subCard, borderColor: themeColors.border }]}
            >
              <Skeleton width={40} height={40} borderRadius={20} style={{ backgroundColor: themeColors.subCard }} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width={"80%"} height={12} style={{ backgroundColor: themeColors.subCard }} />
                <Skeleton width={"55%"} height={10} style={{ marginTop: 6, backgroundColor: themeColors.subCard }} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
});

export default NotificationSkeleton;


