import React from "react";
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import Color from "@/constants/colors";

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: ImageSourcePropType;
  plain?: boolean;
};

const Button = ({
  title,
  onPress,
  disabled,
  style,
  textStyle,
  icon,
  plain = false,
}: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        plain ? styles.plainButton : styles.filledButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <View style={styles.content}>
        {icon && <Image source={icon} style={styles.icon} />}
        <Text
          style={[
            styles.buttonText,
            plain ? styles.plainText : styles.filledText,
            disabled && styles.disabledText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  baseButton: {
    padding: 15,
    borderRadius: 8,
    height: 52,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  filledButton: {
    backgroundColor: Color.brand.primary,
  },
  plainButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
    resizeMode: "contain",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 16,
  },
  filledText: {
    color: "#fff",
  },
  plainText: {
    color: "#000",
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#aaa",
  },
});
