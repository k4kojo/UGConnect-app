import Button from "@/components/button.component";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import OtpInput from "@/components/inputs/otpInput.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useResendCode } from "@/hooks/useResendCode";
import { resendResetToken, verifyResetToken } from "@/services/authService";

const RESEND_TIME_IN_SECONDS = 60;

export default function VerifyCodeScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const completed = code.length === 6;
  const { resendIn, startResendTimer } = useResendCode(RESEND_TIME_IN_SECONDS);
  const { email } = useLocalSearchParams<{ email: string }>();

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const handleResend = async () => {
    if (!email) {
      setError("Email not provided");
      return;
    }
    setIsResending(true);
    try {
      const result = await resendResetToken(email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      startResendTimer();
      setError("");
    } catch (err: any) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async () => {
    if (!completed) return;
    if (!email) {
      setError("Email not provided");
      return;
    }

    try {
      const result = await verifyResetToken(email, code);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push({
        pathname: "/accountRecovery/resetPassword",
        params: { email, code },
      });
    } catch (err: any) {
      setError("Failed to verify code. Please try again.");
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.contentContainer}>
              <Text style={[styles.title, { color: themeColors.text }]}>
                Verify Code
              </Text>
              <Text style={[styles.subtitle, { color: themeColors.subText }]}>
                Please enter the 6-digit code we sent to your email {email}
              </Text>
              <OtpInput
                value={code}
                onChange={(text) => {
                  setCode(text);
                  if (error) setError("");
                }}
                onComplete={handleVerify}
              />
              {error ? (
                <Text style={[styles.errorText, { color: themeColors.error }]}>
                  {error}
                </Text>
              ) : null}
              <Text style={[styles.resendText, { color: themeColors.subText }]}>
                {resendIn > 0 ? (
                  <>
                    Resend code in{" "}
                    <Text style={styles.boldText}>
                      00:{String(resendIn).padStart(2, "0")}
                    </Text>
                  </>
                ) : (
                  <Text
                    onPress={isResending ? undefined : handleResend}
                    style={[styles.resendLink, { color: Colors.brand.primary }]}
                  >
                    {isResending ? "Sending..." : "Resend code"}
                  </Text>
                )}
              </Text>
            </View>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.buttonContainer}>
                <Button
                  title="Continue"
                  onPress={handleVerify}
                  disabled={!completed}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
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
    lineHeight: 24,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "center",
  },
  resendText: {
    textAlign: "center",
    marginBottom: 60,
    fontSize: 16,
  },
  boldText: {
    fontWeight: "bold",
  },
  resendLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingBottom: Platform.select({ ios: 40, android: 20 }),
  },
});
