import FeatureCard from "@/components/feature-card.component";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type QuickActionsProps = {
  themeColors: any;
};

const QuickActionsSection = ({ themeColors }: QuickActionsProps) => {
  // For now, this section doesn't fetch; keeping a simple prop-based switch
  // You can pass a loading prop here if you later make it async
  const cards = [
    {
      title: "Book Appointment",
      icon: require("@/assets/images/calendar.png"),
      route: "/appointment/schedule",
    },
    {
      title: "Join Consultation",
      icon: require("@/assets/images/video.png"),
      route: "/tabs/consultation",
    },
    {
      title: "Lab Results",
      icon: require("@/assets/images/test_tube.png"),
      route: "/tabs/records",
    },
    {
      title: "Prescription",
      icon: require("@/assets/images/medical.png"),
      route: "/tabs/records",
    },
  ];

  return (
    <View>
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        Quick actions
      </Text>
      <View style={styles.actionsGrid}>
        {cards.map((card) => (
          <FeatureCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            pressable
            onPress={() => router.replace(card.route as any)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 10,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default QuickActionsSection;
