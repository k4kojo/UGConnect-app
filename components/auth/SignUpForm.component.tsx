import { registerUser } from "@/redux/authThunks";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import * as Localization from "expo-localization";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PhoneInput from "react-native-phone-number-input";

import Button from "@/components/button.component";
import Colors from "@/constants/colors";
import Divider from "../divider.component";
import DatePickerField from "../inputs/datePickerField.component";
import PhoneInputField from "../inputs/phoneInputField.component";
import TextInputField from "../inputs/textInputField.component";

import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { validateAuth } from "@/services/validateAuth";

const SignUpForm = () => {
  const appleLogo = require("@/assets/images/apple_logo.png");
  const googleLogo = require("@/assets/images/google_logo.png");

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const PhoneInputRef = useRef<PhoneInput>(null);
  const countryCode = Localization.getLocales()[0]?.regionCode ?? "GH";

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { t } = useLanguage();

  const [agree, setAgree] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "set") {
      setDate(selectedDate || new Date());
    } else {
      toggleDatePicker();
    }
  };

  const confirmDate = () => {
    const formattedDate = date.toISOString().split("T")[0]; // "YYYY-MM-DD"
    setDateOfBirth(formattedDate);
    toggleDatePicker();
  };

  const handleSubmit = async () => {
    if (!dateOfBirth || isNaN(new Date(dateOfBirth).getTime())) {
      setErrors({ ...errors, dateOfBirth: "Invalid date" });
      return;
    }

    const rawErrors = validateAuth(
      {
        firstName,
        lastName,
        email,
        phoneNumber,
        dateOfBirth,
        password,
        confirmPassword,
      },
      "signup"
    );

    const newErrors = {
      firstName: rawErrors.firstName ?? "",
      lastName: rawErrors.lastName ?? "",
      email: rawErrors.email ?? "",
      dateOfBirth: rawErrors.dateOfBirth ?? "",
      phoneNumber: rawErrors.phoneNumber ?? "",
      password: rawErrors.password ?? "",
      confirmPassword: rawErrors.confirmPassword ?? "",
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((msg) => msg !== "");
    if (hasError) return;

    try {
      const result = (await dispatch(
        registerUser({
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
          dateOfBirth,
        }) as any
      ).unwrap()) as any;

      alert("Sign up successful! Please verify your email.");
      router.push({
        pathname: "/verify-email",
        params: { email, token: result?.token },
      });
    } catch (err: unknown) {
      const e = err as Error;
      alert(e.message || "An unexpected error occurred");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>{t("auth.signUpTitle")}</Text>
      <Text style={[styles.subtitle, { color: themeColors.subText }]}>
        {t("auth.signUpSubtitle")}
      </Text>

      {/* Fields */}
      <TextInputField
        placeholder="First name"
        value={firstName}
        onChangeText={setFirstName}
        error={errors.firstName}
      />

      <TextInputField
        placeholder="Last name"
        value={lastName}
        onChangeText={setLastName}
        error={errors.lastName}
      />

      <TextInputField
        placeholder="email@example.com"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: "" });
        }}
        error={errors.email}
      />

      <DatePickerField
        show={showDatePicker}
        date={date}
        placeholder="Date of Birth"
        onToggle={toggleDatePicker}
        onChange={handleDateChange}
        onConfirm={confirmDate}
        displayDate={dateOfBirth}
        error={errors.dateOfBirth}
        minimumDate={new Date(1900, 0, 1)}
        maximumDate={new Date()}
      />

      <PhoneInputField
        phoneInputRef={PhoneInputRef}
        value={phoneNumber}
        setValue={setPhoneNumber}
        defaultCode={countryCode}
        error={errors.phoneNumber}
      />

      <TextInputField
        placeholder="Create password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) {
            setErrors({ ...errors, password: "" });
          }
        }}
        secureTextEntry
        error={errors.password}
      />

      <TextInputField
        placeholder="Confirm password"
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (errors.confirmPassword) {
            setErrors({ ...errors, confirmPassword: "" });
          }
        }}
        secureTextEntry
        error={errors.confirmPassword}
      />

      {/* Agreement Checkbox */}
      <View style={styles.checkboxRow}>
        <TouchableOpacity
          style={[
            styles.checkbox,
            {
              backgroundColor: agree ? brandColors.primary : "transparent",
              borderColor: themeColors.border,
            },
          ]}
          onPress={() => setAgree(!agree)}
        >
          {agree && (
            <Text style={[styles.checkmark, { color: themeColors.text }]}>
              ✔
            </Text>
          )}
        </TouchableOpacity>
        <Text style={[styles.checkboxText, { color: themeColors.text }]}>
          I agree to the{" "}
          <Text style={[styles.link, { color: brandColors.primary }]}>
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text style={[styles.link, { color: brandColors.primary }]}>
            Privacy Policy
          </Text>
        </Text>
      </View>

      <Button
        title={isLoading ? t("common.loading") : t("auth.signUp")}
        onPress={handleSubmit}
        disabled={!agree || isLoading}
      />

      <Divider />

      {/* OAuth */}
      <Button
        icon={googleLogo}
        title={t("auth.signUpWithGoogle")}
        style={styles.oauthButton}
        onPress={() =>
          router.push("http://192.168.8.125:3000/api/v0/user/auth/google")
        }
        plain
      />
      <Button
        icon={appleLogo}
        title={t("auth.signUpWithApple")}
        style={styles.oauthButton}
        onPress={() =>
          router.push("http://192.168.8.125:3000/api/v0/user/auth/apple")
        }
        plain
      />

      <Text style={[styles.footerText, { color: themeColors.text }]}> 
        {t("auth.signUpCta")} {" "}
        <Text
          style={[styles.link, { color: brandColors.primary }]}
          onPress={() => router.replace("/sign-in")}
        >
          {t("auth.signIn")}
        </Text>
      </Text>
    </ScrollView>
  );
};

export default SignUpForm;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
  },
  checkboxText: {
    fontSize: 13,
    flex: 1,
    flexWrap: "wrap",
  },
  link: {
    fontWeight: "600",
  },
  oauthButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    width: "100%",
  },
  footerText: {
    fontSize: 15,
    marginVertical: 10,
  },
});
