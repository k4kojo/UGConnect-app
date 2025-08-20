import { GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from "@/config/env";
import { appleLogin, googleLogin, loginUser } from "@/redux/authThunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Button from "@/components/button.component";
import Divider from "@/components/divider.component";
import TextInputField from "@/components/inputs/textInputField.component";

import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { validateAuth } from "@/services/validateAuth";

const googleLogo = require("@/assets/images/google_logo.png");
const appleLogo = require("@/assets/images/apple_logo.png");

const SignInForm = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const router = useRouter();

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  const handleSubmit = async () => {
    const rawErrors = validateAuth({ email, password }, "signin");
    const newErrors = {
      email: rawErrors.email ?? "",
      password: rawErrors.password ?? "",
    };
    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg !== "");
    if (hasError) return;

    try {
      await dispatch(loginUser({ email, password }) as any).unwrap();
      router.replace("/tabs");
    } catch (err: unknown) {
      const e = err as Error;
      Alert.alert("Error", e.message || "Failed to sign in");
    }
  };

  React.useEffect(() => {
    const run = async () => {
      if (response?.type === "success") {
        const idToken = response.authentication?.idToken;
        if (idToken) {
          try {
            await dispatch(googleLogin(idToken) as any).unwrap();
            router.replace("/tabs");
          } catch (e: unknown) {
            const err = e as Error;
            Alert.alert("Google Sign-in failed", err.message || "Failed");
          }
        }
      }
    };
    run();
  }, [response, dispatch]);

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const profile = {
        firstName: credential.fullName?.givenName || undefined,
        lastName: credential.fullName?.familyName || undefined,
        email: credential.email || undefined,
      };
      await dispatch(
        appleLogin({ idToken: credential.identityToken as string, profile }) as any
      ).unwrap();
      router.replace("/tabs");
    } catch (e: unknown) {
      const err = e as Error & { code?: string };
      if (err.code === "ERR_CANCELED") return;
      Alert.alert("Apple Sign-in failed", err.message || "Failed");
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>{t("auth.signInTitle")}</Text>
      <Text style={[styles.subtitle, { color: themeColors.subText }]}>
        {t("auth.signInSubtitle")}
      </Text>

      <TextInputField
        placeholder="email@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: "" });
        }}
        error={errors.email}
      />

      <TextInputField
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: "" });
        }}
        error={errors.password}
      />

      <Button
        title={isLoading ? t("common.loading") : t("auth.signIn")}
        onPress={handleSubmit}
        disabled={isLoading}
      />

      <View style={styles.forgotContainer}>
        <TouchableOpacity onPress={() => router.push("/accountRecovery")}>
          <Text style={[styles.link, { color: brandColors.primary }]}>
            {t("auth.forgotPassword")}
          </Text>
        </TouchableOpacity>
      </View>

      <Divider />

      <Button
        icon={googleLogo}
        title={t("auth.signInWithGoogle")}
        onPress={() => promptAsync()}
        plain
        style={styles.oauthButton}
      />
      <Button
        icon={appleLogo}
        title={t("auth.signInWithApple")}
        onPress={handleAppleLogin}
        plain
        style={styles.oauthButton}
      />

      <Text style={[styles.footerText, { color: themeColors.text }]}> 
        {t("auth.signUpCta")} {" "}
        <Text
          style={[styles.link, { color: brandColors.primary }]}
          onPress={() => router.push("/sign-up")}
        >
          {t("auth.signUp")}
        </Text>
      </Text>
    </View>
  );
};

export default SignInForm;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  forgotContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 10,
    marginBottom: 10,
  },
  oauthButton: {
    marginBottom: 10,
    width: "100%",
  },
  footerText: {
    fontSize: 15,
    marginTop: 20,
  },
  link: {
    fontWeight: "600",
  },
});
