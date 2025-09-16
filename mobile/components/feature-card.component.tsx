import React, { useState } from "react";
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "../constants/colors";
import { useThemeContext } from "../context/ThemeContext";

type Props = {
  title: string;
  description?: string;
  icon?: ImageSourcePropType;
  pressable?: boolean;
  onPress?: () => void;
};

const FeatureCard = ({
  title,
  description,
  icon,
  pressable,
  onPress,
}: Props) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const scale = useState(new Animated.Value(1))[0];

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const CardContent = (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: themeColors.card, transform: [{ scale }] },
      ]}
    >
      {icon && <Image source={icon} style={styles.icon} />}
      <Text style={[styles.cardTitle, { color: themeColors.text }]}>
        {title}
      </Text>
      {description ? (
        <Text style={[styles.cardDescription, { color: themeColors.subText }]}>
          {description}
        </Text>
      ) : null}
    </Animated.View>
  );

  if (pressable) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        style={{ width: "47%" }}
      >
        {CardContent}
      </Pressable>
    );
  }

  return <View style={{ width: "47%" }}>{CardContent}</View>;
};

const styles = StyleSheet.create({
  card: {
    height: 140,
    padding: 15,
    borderRadius: 16,
    backgroundColor: "#fff",
    marginVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
    paddingTop: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginTop: 5,
  },
});

export default FeatureCard;
