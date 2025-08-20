import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  label?: string
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
};

export default function TextInputField({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
}: Props) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const getKeyboardType = (): KeyboardTypeOptions => {
    if (placeholder.toLowerCase().includes("email")) return "email-address";
    if (placeholder.toLowerCase().includes("phone")) return "phone-pad";
    return "default";
  };

  const showToggle = secureTextEntry;

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={themeColors.placeholder}
          style={[
            styles.input,
            {
              borderColor: error ? themeColors.error : themeColors.border,
              color: themeColors.text,
              backgroundColor: themeColors.card,
            },
            showToggle && { paddingRight: 40 },
          ]}
          value={value}
          keyboardType={getKeyboardType()}
          autoCapitalize="none"
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
        />
        {showToggle && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.icon}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={22}
              color={themeColors.placeholder}
            />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 12,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  icon: {
    position: "absolute",
    right: 10,
    top: 14,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-start",
  },
});
