import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";

import Button from "@/components/button.component";
import OtpInput from "@/components/inputs/otpInput.component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useResendCode } from "@/hooks/useResendCode";
import { resendVerification, verifyEmail } from "@/services/authService";

const OTP_LENGTH = 6;
const RESEND_TIME_IN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const completed = code.length === OTP_LENGTH;
  const { resendIn, startResendTimer } = useResendCode(RESEND_TIME_IN_SECONDS);
  const { email, token: signupToken } = useLocalSearchParams<{ email: string; token?: string }>();
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();
  
  const handleVerify = async () => {
    if (!completed) return;
    setIsVerifying(true);
    try {
      const result = await verifyEmail(email, code);
      if (result.success) {
        // Persist signup token (issued on sign-up) so auth gate allows tabs
        if (signupToken) {
          await AsyncStorage.setItem("authToken", String(signupToken));
        }
        router.replace("/tabs");
      } else {
        setError(result.error);
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email not provided");
      return;
    }
    setIsResending(true);
    try {
      const result = await resendVerification(email);
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {t("auth.verifyEmailTitle")}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.subText }]}>
            {t("accountRecovery.enterCodeFor", { email: String(email) })}
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
                {t("auth.resendCode")} {" "}
                <Text style={{ fontWeight: "bold", color: themeColors.text }}>
                  00:{String(resendIn).padStart(2, "0")}
                </Text>
              </>
            ) : (
              <Text
                onPress={handleResend}
                style={[styles.resendLink, { color: Colors.brand.primary }]}
                disabled={isResending}
              >
                {isResending ? t("accountRecovery.sending") : t("auth.resendCode")}
              </Text>
            )}
          </Text>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.buttonContainer}>
            <Button
              title={isVerifying ? t("auth.verifying") : t("common.continue")}
              onPress={handleVerify}
              disabled={!completed || isVerifying}
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
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
  resendLink: {
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  buttonContainer: {
    paddingBottom: 20,
  },
});
