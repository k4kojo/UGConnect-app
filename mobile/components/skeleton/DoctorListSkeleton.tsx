import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";
import Skeleton from "./Skeleton";

type Props = {
  count?: number;
};

const DoctorListSkeleton: React.FC<Props> = ({ count = 8 }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View>
      {Array.from({ length: count }).map((_, idx) => (
        <View
          key={idx}
          style={[styles.card, { backgroundColor: themeColors.card }]}
        >
          <View style={styles.rowLeft}>
            <Skeleton width={50} height={50} borderRadius={25} style={{ backgroundColor: themeColors.subCard }} />
            <View style={styles.texts}>
              <Skeleton width={160} height={14} style={{ backgroundColor: themeColors.subCard }} />
              <Skeleton width={110} height={12} style={{ marginTop: 8, backgroundColor: themeColors.subCard }} />
              <Skeleton width={140} height={10} style={{ marginTop: 8, backgroundColor: themeColors.subCard }} />
            </View>
          </View>
          <View style={styles.rightCol}>
            <Skeleton width={60} height={14} style={{ backgroundColor: themeColors.subCard }} />
            <Skeleton width={120} height={28} borderRadius={6} style={{ marginTop: 8, backgroundColor: themeColors.subCard }} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
    alignItems: "center",
  },
  texts: {
    flex: 1,
  },
  rightCol: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

export default DoctorListSkeleton;


