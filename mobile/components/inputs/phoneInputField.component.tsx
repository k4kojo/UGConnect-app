import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React, { RefObject } from "react";
import { StyleSheet, Text, View } from "react-native";
import PhoneInput from "react-native-phone-number-input";

type Props = {
  label?: string;
  phoneInputRef: RefObject<PhoneInput | null>;
  value: string;
  setValue: (val: string) => void;
  defaultCode: string;
  error?: string;
};

export default function PhoneInputField({
  label,
  phoneInputRef,
  value,
  setValue,
  defaultCode,
  error,
}: Props) {
  const PhoneInputComponent = PhoneInput as any;

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View style={{ width: "100%" }}>
      <PhoneInputComponent
        ref={phoneInputRef}
        defaultValue={value}
        defaultCode={defaultCode}
        layout="first"
        onChangeFormattedText={(text: string) => setValue(text)}
        containerStyle={[
          styles.container,
          { borderColor: error ? themeColors.error : themeColors.border },
        ]}
        textContainerStyle={[
          styles.textContainer,
          { backgroundColor: themeColors.card },
        ]}
        codeTextStyle={[styles.countryCodeText, { color: themeColors.text }]}
        textInputStyle={[styles.inputText, { color: themeColors.text }]}
        textInputProps={{
          placeholder: "Phone number",
          placeholderTextColor: themeColors.placeholder,
        }}
        flagButtonStyle={[
          styles.flagButton,
          { backgroundColor: themeColors.card },
        ]}
      />
      {error && (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 45,
    flexDirection: "row",
    borderWidth: 1,
    marginBottom: 12,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  textContainer: {
    backgroundColor: "transparent",
    paddingVertical: 0,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    flex: 1,
    justifyContent: "center",
  },
  flagButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  countryCodeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputText: {
    fontSize: 14,
    paddingLeft: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
