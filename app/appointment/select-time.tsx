import StepHeader from "@/components/step-header-component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

const times = ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"];

export default function SelectTimeScreen() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState("");
  const [consultationType, setConsultationType] = useState("Video");
  const [selectedTime, setSelectedTime] = useState("");

  const { initials, name, specialty, doctorId, fee } = useLocalSearchParams();

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert("Select date and time before continuing");
      return;
    }

    router.push({
      pathname: "/appointment/confirm",
      params: {
        name,
        specialty,
        initials,
        doctorId,
        fee,
        date: selectedDate,
        time: selectedTime,
        consultationType,
      },
    });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
          <Text style={{ color: themeColors.text, fontSize: 18 }}>Back</Text>
        </TouchableOpacity>
      </View>

      <StepHeader step={2} />

      {/* Doctor Info */}
      <View
        style={[
          styles.doctorCard,
          {
            backgroundColor: themeColors.subCard,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: themeColors.avatar }]}>
          <Text style={[styles.avatarText, { color: themeColors.text }]}>
            {initials?.toString() ?? "Dr"}
          </Text>
        </View>
        <View>
          <Text style={[styles.doctorName, { color: themeColors.text }]}>
            {name ?? "Doctor Name"}
          </Text>
          <Text style={[styles.specialty, { color: themeColors.subText }]}>
            {specialty ?? "Specialty"}
          </Text>
        </View>
      </View>

      {/* Date */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        Select Date
      </Text>
      <View style={[styles.box, { backgroundColor: themeColors.subCard }]}>
        <Calendar
          minDate={new Date().toISOString().split("T")[0]}
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: Colors.brand.primary,
              selectedTextColor: "white",
            },
          }}
          theme={{
            backgroundColor: themeColors.subCard,
            calendarBackground: themeColors.subCard,
            dayTextColor: themeColors.text,
            monthTextColor: themeColors.text,
            arrowColor: Colors.brand.accent,
            todayTextColor: Colors.brand.accent,
          }}
        />
      </View>

      {/* Appointment Type */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        Appointment Type
      </Text>
      <View style={styles.boxRow}>
        {["Video", "In-Person"].map((type) => {
          const isActive = consultationType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setConsultationType(type)}
              style={[
                styles.consultTypeBtn,
                {
                  backgroundColor: isActive
                    ? Colors.brand.primary
                    : themeColors.card,
                  borderColor: isActive
                    ? Colors.brand.primary
                    : themeColors.border,
                },
              ]}
            >
              <Ionicons
                name={type === "Video" ? "videocam-outline" : "person-outline"}
                color={isActive ? "#fff" : themeColors.text}
                size={18}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.consultTypeText,
                  {
                    color: isActive ? "#fff" : themeColors.text,
                  },
                ]}
              >
                {type === "Video" ? "Video Call" : "In-Person"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Time Slots */}
      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        Available Times
      </Text>
      <View style={styles.timeGrid}>
        {times.map((time) => {
          const isActive = selectedTime === time;
          return (
            <TouchableOpacity
              key={time}
              onPress={() => setSelectedTime(time)}
              style={[
                styles.timeBtn,
                {
                  backgroundColor: isActive
                    ? Colors.brand.primary
                    : themeColors.card,
                  borderColor: isActive
                    ? Colors.brand.primary
                    : themeColors.border,
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={isActive ? "#fff" : themeColors.text}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.timeText,
                  {
                    color: isActive ? "#fff" : themeColors.text,
                  },
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueBtn, { backgroundColor: Colors.brand.accent }]}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  doctorCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  specialty: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },
  box: {
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    marginBottom: 20,
  },
  boxRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  consultTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  consultTypeText: {
    fontSize: 14,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },
  timeBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
  },
  continueBtn: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 50,
  },
  continueText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
