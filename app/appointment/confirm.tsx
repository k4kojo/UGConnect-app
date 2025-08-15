import { createAppointment as createAppointmentAction } from "@/redux/appointmentsSlice";
import { useAppDispatch } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import StepHeader from "@/components/step-header-component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

const ConfirmScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const router = useRouter();
  const dispatch = useAppDispatch();
  const [reason, setReason] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const { initials, name, specialty, date, time, consultationType, fee, doctorId } =
    useLocalSearchParams();

  const consultationFee = Number(fee) || 0;
  const platformFee = 10.0;
  const total = consultationFee + platformFee;

  console.log(typeof fee);

  const to24Hour = (t: string): string => {
    if (!t) return "09:00";
    const trimmed = t.trim();
    // Handle formats like "9:00 AM" / "10:30 PM"
    const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
      let hours = parseInt(ampmMatch[1], 10);
      const minutes = ampmMatch[2];
      const period = ampmMatch[3].toUpperCase();
      if (period === "PM" && hours < 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return `${String(hours).padStart(2, "0")}:${minutes}`;
    }
    // Fallback for already 24h like "09:00"
    const simple = trimmed.match(/^(\d{2}):(\d{2})$/);
    if (simple) return trimmed;
    return "09:00";
  };

  const handleConfirm = async () => {
    if (!selectedMethod) {
      alert("Please choose a payment method");
      return;
    }
    try {
      const hhmm = to24Hour(time as string);
      const isoDate = new Date(`${date}T${hhmm}:00`).toISOString();
      const res = await dispatch(createAppointmentAction({
        doctorId: (doctorId as string) || "",
        appointmentDate: isoDate,
        appointmentAmount: String(total),
        appointmentMode: consultationType === "In-Person" ? "In-person" : "Online",
        reasonForVisit: reason || undefined,
        paymentMethod:
          selectedMethod === "Credit/Debit Card"
            ? "Credit Card"
            : (selectedMethod as any),
      })).unwrap();
      router.replace("/appointment/success");
    } catch (e: any) {
      const message = typeof e === "string" ? e : (e?.response?.data?.error || e?.message || "Failed to book appointment");
      alert(message);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 20,
        }}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={22} color={themeColors.text} />
        <Text style={{ fontSize: 18, color: themeColors.text }}>Back</Text>
      </TouchableOpacity>

      <StepHeader step={3} />

      {/* Row layout */}
      <View style={styles.rowWrap}>
        {/* Appointment Details */}
        <View style={[styles.card, { backgroundColor: themeColors.subCard }]}>
          <Text style={[styles.cardHeading, { color: themeColors.text }]}>
            Appointment Details
          </Text>
          <View style={styles.docRow}>
            <View
              style={[styles.avatar, { backgroundColor: themeColors.avatar }]}
            >
              <Text style={[styles.avatarText, { color: themeColors.text }]}>
                {initials?.toString() ?? "Dr"}
              </Text>
            </View>
            <View>
              <Text style={[styles.docName, { color: themeColors.text }]}>
                {name ?? "Doctor Name"}
              </Text>
              <Text style={[styles.grayText, { color: themeColors.subText }]}>
                {specialty ?? "Specialty"}
              </Text>
            </View>
          </View>

          <View style={styles.iconRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={themeColors.text}
            />
            <Text style={[styles.rowText, { color: themeColors.subText }]}>
              {date ? new Date(date.toString()).toDateString() : "Date"}
            </Text>
          </View>
          <View style={styles.iconRow}>
            <Ionicons name="time-outline" size={16} color={themeColors.text} />
            <Text style={[styles.rowText, { color: themeColors.subText }]}>
              {time ?? "Time"}
            </Text>
          </View>
          <View style={styles.iconRow}>
            <Ionicons
              name="person-outline"
              size={16}
              color={themeColors.text}
            />
            <Text style={[styles.rowText, { color: themeColors.subText }]}>
              {consultationType === "In-Person"
                ? "In-Person Visit"
                : "Video Call"}
            </Text>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[styles.card, { backgroundColor: themeColors.subCard }]}>
          <Text style={[styles.cardHeading, { color: themeColors.text }]}>
            Payment Summary
          </Text>
          <View style={styles.rowBetween}>
            <Text style={[styles.grayText, { color: themeColors.subText }]}>
              Consultation Fee
            </Text>
            <Text style={[styles.feeText, { color: themeColors.text }]}>
              ₵{consultationFee}
            </Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={[styles.grayText, { color: themeColors.subText }]}>
              Platform Fee
            </Text>
            <Text style={[styles.feeText, { color: themeColors.text }]}>
              ₵{platformFee}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={[styles.totalText, { color: themeColors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalText, { color: themeColors.text }]}>
              ₵{total}
            </Text>
          </View>
        </View>
      </View>

      {/* Reason for Visit */}
      <View style={[styles.card, { backgroundColor: themeColors.subCard }]}>
        <Text style={[styles.cardHeading, { color: themeColors.text }]}>
          Reason for Visit
        </Text>
        <TextInput
          placeholder="Please describe your symptoms or reason for the appointment..."
          multiline
          style={[styles.textArea, { color: themeColors.subText }]}
          value={reason}
          onChangeText={setReason}
        />
      </View>

      {/* Payment Methods */}
      <View style={[styles.card, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.cardHeading, { color: themeColors.text }]}>
          Payment Method
        </Text>
        <View style={styles.payOptions}>
          {["MTN MoMo", "Telecel Cash", "Credit/Debit Card"].map((method) => (
            <TouchableOpacity
              key={method}
              style={[
                styles.paymentBtn,
                {
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
                selectedMethod === method && {
                  backgroundColor: Colors.brand.primary,
                  borderColor: "none",
                },
              ]}
              onPress={() => setSelectedMethod(method)}
            >
              <Ionicons
                name={
                  method === "Credit/Debit Card"
                    ? "card-outline"
                    : "phone-portrait-outline"
                }
                size={18}
                color={selectedMethod === method ? "#fff" : themeColors.text}
              />
              <Text
                style={[
                  styles.paymentBtnText,
                  selectedMethod === method
                    ? { color: "#fff" }
                    : { color: themeColors.text },
                ]}
              >
                {method}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Fields */}
        {selectedMethod === "MTN MoMo" || selectedMethod === "Telecel Cash" ? (
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: themeColors.text }]}>
              Mobile Money Number
            </Text>
            <TextInput
              placeholder="Enter mobile number"
              keyboardType="phone-pad"
              style={[
                styles.input,
                {
                  color: themeColors.placeholder,
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                },
              ]}
            />
          </View>
        ) : null}

        {selectedMethod === "Credit/Debit Card" && (
          <View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                Card Number
              </Text>
              <TextInput
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.card,
                    color: themeColors.placeholder,
                    borderColor: themeColors.border,
                  },
                ]}
              />
            </View>
            <View style={styles.cardDetailsRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                  Expiry
                </Text>
                <TextInput
                  placeholder="MM/YY"
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.card,
                      color: themeColors.placeholder,
                      borderColor: themeColors.border,
                    },
                  ]}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: themeColors.text }]}>
                  CVV
                </Text>
                <TextInput
                  placeholder="123"
                  keyboardType="numeric"
                  secureTextEntry
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.card,
                      color: themeColors.placeholder,
                      borderColor: themeColors.border,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Confirm Button */}
      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: Colors.brand.primary }]}
        onPress={handleConfirm}
      >
        <Text style={[styles.submitText, {color: themeColors.text}]}>Confirm & Pay ₵{total}</Text>
      </TouchableOpacity>
    </ScrollView>
      </KeyboardAvoidingView>
  );
};

export default ConfirmScreen;

// STYLES
const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flex: 1,
  },
  rowWrap: {
    gap: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "600",
  },
  docName: {
    fontWeight: "600",
    fontSize: 15,
  },
  grayText: {
    fontSize: 13,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 3,
  },
  rowText: {
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 8,
  },
  feeText: {
    fontSize: 14,
  },
  totalText: {
    fontSize: 15,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    textAlignVertical: "top",
    fontSize: 14,
  },
  payOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  paymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  paymentBtnText: {
    fontSize: 14,
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  cardDetailsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  submitBtn: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 40,
  },
  submitText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
