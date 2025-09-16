import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React, { useMemo, useRef } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (val: string) => void;
  onComplete?: (val: string) => void;
}

const OtpInput = ({ value, onChange, onComplete }: OtpInputProps) => {
  const inputRef = useRef<TextInput>(null);
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    onChange(cleaned);
    if (cleaned.length === OTP_LENGTH && onComplete) {
      onComplete(cleaned);
    }
  };

  const boxes = useMemo(() => {
    const chars = value.split("");
    return Array.from({ length: OTP_LENGTH }).map((_, i) => chars[i] ?? "");
  }, [value]);

  const handleBoxPress = () => {
    inputRef.current?.focus();
  };

  return (
    <TouchableWithoutFeedback onPress={handleBoxPress}>
      <View style={styles.codeContainer}>
        {boxes.map((char, idx) => {
          const isFilled = idx < value.length;
          return (
            <View
              key={idx}
              style={[styles.otpInput, isFilled ? styles.filledBox : null, { borderColor: themeColors.border }]}
            >
              <Text style={[styles.otpChar, { color: themeColors.text }]}>{char}</Text>
            </View>
          );
        })}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={OTP_LENGTH}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
          autoComplete={
            Platform.select({ ios: "one-time-code", android: "sms-otp" }) as any
          }
          importantForAutofill="yes"
          caretHidden
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default OtpInput;

const styles = StyleSheet.create({
  codeContainer: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  filledBox: {
    borderColor: Colors.brand.primary,
  },
  otpChar: {
    fontSize: 22,
    fontWeight: "bold",
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
});
