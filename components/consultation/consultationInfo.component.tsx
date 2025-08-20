import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

type ConsultationInfoProps = {
  tab: number;
};

const ConsultationInfo = ({ tab }: ConsultationInfoProps) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      {tab === 0 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          {/* Title */}
          <Text style={[styles.title, { color: themeColors.text }]}>
            Consultation Information
          </Text>

          {/* Date, Time, Status Row */}
          <View style={styles.rowBetween}>
            <View>
              <View style={styles.row}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    Date:{" "}
                  </Text>
                  2024-01-10
                </Text>
              </View>

              <View style={[styles.row, { marginTop: 8 }]}>
                <Ionicons
                  name="videocam-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    {" "}
                    Type:{" "}
                  </Text>
                  Video Call
                </Text>
              </View>
              <View style={[styles.row, { marginTop: 8 }]}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    {" "}
                    Duration:{" "}
                  </Text>
                  30m 47s
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                justifyContent: "space-between",
              }}
            >
              <View style={[styles.row, { marginBottom: 20 }]}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={themeColors.subText}
                />
                <Text style={[styles.label, { color: themeColors.subText }]}>
                  <Text style={[styles.bold, { color: themeColors.text }]}>
                    Time:{" "}
                  </Text>
                  10:00 AM
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: themeColors.success },
                ]}
              >
                <Text style={styles.statusBadgeText}>completed</Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { borderColor: themeColors.border }]} />

          {/* Reason for Visit */}
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Reason for Visit
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            Follow-up consultation for hypertension management
          </Text>

          {/* Diagnosis */}
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Diagnosis
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            Common Cold
          </Text>
        </View>
      )}
      {tab === 1 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Prescriptions
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            No prescriptions found.
          </Text>
        </View>
      )}
      {tab === 2 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Lab Results
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            No lab results found.
          </Text>
        </View>
      )}
      {tab === 3 && (
        <View
          style={[
            styles.consultDetailCard,
            {
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text }]}>
            Chat
          </Text>
          <Text style={[styles.sectionValue, { color: themeColors.subText }]}>
            No chat history found.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  consultDetailCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
    margin: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 18,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: -2,
  },
  label: {
    fontSize: 15,
    marginLeft: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginLeft: 8,
  },
  statusBadgeText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 18,
  },
  sectionLabel: {
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 2,
    fontSize: 16,
    color: "#111",
  },
  sectionValue: {
    color: "#4b5563",
    marginBottom: 8,
    fontSize: 15,
  },
});

export default ConsultationInfo;
