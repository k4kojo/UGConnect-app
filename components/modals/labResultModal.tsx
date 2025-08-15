import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const LabResultModal = ({ visible, onClose, result }: { visible: boolean, onClose: () => void, result: any }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <Modal visible={visible} transparent animationType="slide" presentationStyle="fullScreen">
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.card }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView>
              <View style={styles.header}>
                <TouchableOpacity style={{ position: "absolute", top: 0, right: 0, }} onPress={onClose}>
                  <Ionicons name="close" size={24} color={themeColors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: themeColors.text }]}>
                  Lab Report - Complete Blood Count
                </Text>
                <Text style={[styles.subtitle, { color: themeColors.subText }]}>
                  Detailed laboratory test results and interpretation
                </Text>
              </View>

              <View style={[styles.section, { backgroundColor: themeColors.subCard }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                  Complete Blood Count
                </Text>
                <Text style={[styles.reference, { color: themeColors.subText }]}>
                  Reference: LAB-1754585993198
                </Text>

                <View style={styles.infoGrid}>
                  <View style={styles.infoColumn}>
                    <Text style={[styles.label, { color: themeColors.subText }]}>
                      Patient
                    </Text>
                    <Text style={[styles.value, { color: themeColors.text }]}>
                      John Doe
                    </Text>

                    <Text style={[styles.label, { color: themeColors.subText }]}>
                      Laboratory
                    </Text>
                    <Text style={[styles.value, { color: themeColors.text }]}>
                      Ghana Medical Laboratory Services
                    </Text>
                  </View>

                  <View style={styles.infoColumn}>
                    <Text style={[styles.label, { color: themeColors.subText }]}>
                      Physician
                    </Text>
                    <Text style={[styles.value, { color: themeColors.text }]}>
                      Dr. Akosua Frimpong
                    </Text>

                    <Text style={[styles.label, { color: themeColors.subText }]}>
                      Specimen
                    </Text>
                    <Text style={[styles.value, { color: themeColors.text }]}>
                      Blood
                    </Text>
                  </View>

                  <View style={styles.infoColumn}>
                    <Text style={[styles.label, { color: themeColors.subText }]}>
                      Collection Date
                    </Text>
                    <Text style={[styles.value, { color: themeColors.text }]}>
                      2024-01-08
                    </Text>

                    <Text style={[styles.label, { color: themeColors.subText }]}>
                      Report Date
                    </Text>
                    <Text style={[styles.value, { color: themeColors.text }]}>
                      2024-01-08
                    </Text>
                  </View>
                </View>

                <Text style={styles.status}>NORMAL</Text>
              </View>

              <View style={[styles.section, { backgroundColor: themeColors.subCard }]}>
                <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                  Test Results
                </Text>

                <View style={styles.tableHeader}>
                  <Text style={[styles.cellLabel, { color: themeColors.subText }]}>
                    Parameter
                  </Text>
                  <Text style={[styles.cellLabel, { color: themeColors.subText }]}>
                    Result
                  </Text>
                  <Text style={[styles.cellLabel, { color: themeColors.subText }]}>
                    Unit
                  </Text>
                  <Text style={[styles.cellLabel, { color: themeColors.subText }]}>
                    Ref. Range
                  </Text>
                  <Text style={[styles.cellLabel, { color: themeColors.subText }]}>
                    Status
                  </Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.cell}>White Blood Cell Count</Text>
                  <Text style={styles.cell}>7.2</Text>
                  <Text style={styles.cell}>×10³/μL</Text>
                  <Text style={styles.cell}>4.0–11.0</Text>
                  <Text style={[styles.cell, styles.normal]}>Normal</Text>
                </View>

                <View style={styles.tableRow}>
                  <Text style={styles.cell}>Red Blood Cell Count</Text>
                  <Text style={styles.cell}>4.5</Text>
                  <Text style={styles.cell}>×10⁶/μL</Text>
                  <Text style={styles.cell}>4.2–5.4</Text>
                  <Text style={[styles.cell, styles.normal]}>Normal</Text>
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
  },
  section: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  reference: {
    fontSize: 12,
    color: "#555",
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoColumn: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#444",
  },
  value: {
    fontSize: 13,
    marginBottom: 8,
    color: "#000",
  },
  status: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "black",
    color: "white",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 8,
    marginBottom: 6,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  cellLabel: {
    fontSize: 12,
    fontWeight: "600",
    width: "20%",
    color: "#333",
  },
  cell: {
    fontSize: 12,
    width: "20%",
    color: "#333",
  },
  normal: {
    color: "green",
    fontWeight: "600",
  },
});

export default LabResultModal;
