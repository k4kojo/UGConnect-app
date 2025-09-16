import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/button.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { resetPassword } from "@/services/authService";

const COLORS = {
  text: "#0F172A",
  subtext: "#8DA1B4",
  primary: "#2E6BFF",
  border: "#E8EEF5",
  icon: "#90A3B3",
  error: "#EF4444",
  btnText: "#FFFFFF",
  btnBg: "#2E6BFF",
  btnBgDisabled: "#B6C3D1",
  placeholder: "#9CA3AF",
};

type PasswordFieldProps = {
  value: string;
  placeholder: string;
  onChangeText: (t: string) => void;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  error?: string;
};

const PasswordField: React.FC<PasswordFieldProps> = ({
  value,
  placeholder,
  onChangeText,
  returnKeyType,
  onSubmitEditing,
  error,
}) => {
  const [secure, setSecure] = useState(true);
  const [focused, setFocused] = useState(false);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          style={[
            styles.inputRow,
            {
              borderBottomColor: error
                ? themeColors.error
                : focused
                ? Colors.brand.primary
                : themeColors.border,
            },
          ]}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={
              error
                ? themeColors.error
                : focused
                ? Colors.brand.primary
                : themeColors.icon
            }
            style={{ marginRight: 10 }}
          />
          <TextInput
            style={[styles.input, { color: themeColors.text }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.placeholder}
            secureTextEntry={secure}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            autoCapitalize="none"
            textContentType="newPassword"
            autoComplete="password-new"
          />
          <Pressable hitSlop={10} onPress={() => setSecure((s) => !s)}>
            <Ionicons
              name={secure ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={error ? themeColors.error : themeColors.icon}
            />
          </Pressable>
        </View>
      </TouchableWithoutFeedback>
      {error && (
        <Text style={[styles.helperError, { color: themeColors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default function NewPasswordScreen() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { email, code } = useLocalSearchParams<{
    email: string;
    code: string;
  }>();

  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
  });

  const confirmRef = useRef<TextInput>(null);

  const validatePassword = (password: string, confirmPassword: string) => {
    const newErrors = {
      password: "",
      confirmPassword: "",
    };

    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return !newErrors.password && !newErrors.confirmPassword;
  };

  const onSubmit = async () => {
    const isValid = validatePassword(pwd, confirm);
    if (!isValid) return;
    if (!email || !code) {
      Alert.alert("Error", "Email or verification code missing.");
      return;
    }

    try {
      setLoading(true);
      const result = await resetPassword(email, code, pwd);
      if (!result.success) {
        Alert.alert("Error", result.error);
        return;
      }
      Alert.alert(
        "Password updated",
        "Your password has been changed successfully."
      );
      router.push("/sign-in");
    } catch (err: any) {
      Alert.alert("Error", "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (text: string) => {
    setPwd(text);
    if (errors.password) {
      validatePassword(text, confirm);
    }
  };

  const handleConfirmChange = (text: string) => {
    setConfirm(text);
    if (errors.confirmPassword) {
      validatePassword(pwd, text);
    }
  };

  const canSubmit = pwd.length >= 8 && pwd === confirm && pwd.length > 0;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: themeColors.background }]}
      edges={["top", "left", "right"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.backBtn}
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={30} color={themeColors.text} />
          </Pressable>
          <Text style={[styles.title, { color: themeColors.text }]}>
            New Password
          </Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: themeColors.subText }]}>
            Create a new password that is safe and easy to remember
          </Text>
          <View style={{ height: 24 }} />
          <PasswordField
            value={pwd}
            onChangeText={handlePasswordChange}
            placeholder="New Password"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            error={errors.password}
          />
          <View style={{ height: 16 }} />
          <PasswordField
            value={confirm}
            onChangeText={handleConfirmChange}
            placeholder="Confirm New Password"
            returnKeyType="done"
            onSubmitEditing={onSubmit}
            error={errors.confirmPassword}
          />
          <View style={{ flex: 1 }} />
        </View>
        <View style={styles.footer}>
          <Button
            title={loading ? "Updating..." : "Confirm New Password"}
            onPress={onSubmit}
            disabled={!canSubmit || loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 6 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: {
    fontSize: 15,
    marginTop: 8,
    lineHeight: 22,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1.5,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 16,
  },
  helperError: {
    marginTop: 6,
    fontSize: 13,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
