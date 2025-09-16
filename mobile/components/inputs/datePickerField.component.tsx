// datePickerField.component.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

type Props = {
  label?: string;
  value?: string;
  show: boolean;
  date: Date;
  onToggle: () => void;
  onChange: (event: any, selectedDate?: Date) => void;
  onConfirm: () => void;
  displayDate: string;
  error?: string;
  inputStyles?: object;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date: Date | string) => {
  if (typeof date === "string") return date; // Already formatted
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function DatePickerField({
  label,
  value,
  show,
  date,
  onToggle,
  onChange,
  onConfirm,
  displayDate,
  error,
  inputStyles,
  placeholder = "YYYY-MM-DD", // Updated default placeholder
  minimumDate,
  maximumDate,
}: Props) {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  // Format the display date consistently
  const formattedDisplayDate = displayDate ? formatDate(displayDate) : "";

  return (
    <View style={styles.container}>
      {show && (
        <>
          <DateTimePicker
            value={typeof date === "string" ? new Date(date) : date}
            mode="date"
            display="spinner"
            onChange={onChange}
            style={{ height: 120 }}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            textColor={themeColors.text}
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onToggle}>
              <Text style={[styles.button, { color: brand.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm}>
              <Text style={[styles.button, { color: brand.primary }]}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!show && (
        <Pressable onPress={onToggle}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: error ? themeColors.error : themeColors.border,
                color: themeColors.text,
                backgroundColor: themeColors.card,
              },
              inputStyles,
            ]}
            value={formattedDisplayDate}
            placeholder={placeholder}
            placeholderTextColor={themeColors.placeholder}
            editable={false}
            onPressIn={onToggle}
          />
        </Pressable>
      )}

      {error ? (
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 10,
  },
  button: {
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
});
