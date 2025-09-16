import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import Button from "@/components/button.component";
import TextInputField from "@/components/inputs/textInputField.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { requestPasswordReset } from "@/services/authService";

export default function RecoverAccountScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const handleRequestReset = async () => {
    if (!email) {
      setError("Please enter your email");
      return;
    }
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      // Navigate to OTP screen and pass email
      router.push({ pathname: "/accountRecovery/getOTP", params: { email } });
    } catch (err: any) {
      setError("Failed to request reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={themeColors.text} />
          </Pressable>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Reset Password
          </Text>
        </View>
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.subtitle,
              { color: themeColors.subText || "#6b7280" },
            ]}
          >
            Enter your email address, and we will send a verification code to
            reset your password.
          </Text>
          <TextInputField
            placeholder="email@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError("");
            }}
            error={error}
          />
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.buttonContainer}>
            <Button 
              title={isLoading ? "Sending..." : "Get OTP"} 
              onPress={handleRequestReset}
              disabled={isLoading}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    gap: 12,
  },
  backButton: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
