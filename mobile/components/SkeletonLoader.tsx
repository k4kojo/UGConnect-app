import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

interface SkeletonProps {
  width?: number | "auto" | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      theme === "dark" ? "#2A2A2A" : "#E0E0E0",
      theme === "dark" ? "#3A3A3A" : "#F0F0F0",
    ],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    />
  );
};

// Medication Card Skeleton
export const MedicationCardSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View
      style={[
        styles.medicationCard,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardLeft}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.cardInfo}>
            <Skeleton width={120} height={16} borderRadius={4} />
            <View style={styles.cardMeta}>
              <Skeleton width={80} height={12} borderRadius={4} />
              <Skeleton width={60} height={12} borderRadius={4} />
            </View>
          </View>
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </View>

      <View style={styles.cardFooter}>
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton width={80} height={32} borderRadius={8} />
      </View>
    </View>
  );
};

// Consultation History Item Skeleton
export const ConsultationItemSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View
      style={[
        styles.consultationItem,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <View style={styles.consultationLeft}>
        <Skeleton width={48} height={48} borderRadius={24} />
        <View style={styles.consultationInfo}>
          <Skeleton width={140} height={16} borderRadius={4} />
          <Skeleton
            width={100}
            height={12}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
          <Skeleton
            width={80}
            height={12}
            borderRadius={4}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>
      <Skeleton width={80} height={14} borderRadius={4} />
    </View>
  );
};

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View
      style={[
        styles.statsCard,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <Skeleton width={40} height={40} borderRadius={20} />
      <Skeleton
        width={24}
        height={20}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />
      <Skeleton
        width={60}
        height={12}
        borderRadius={4}
        style={{ marginTop: 4 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  medicationCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cardInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardMeta: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  consultationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  consultationLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  consultationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  statsCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});

export default Skeleton;
