import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface LabResult {
  id?: string;
  testName?: string;
  result?: string;
  unit?: string;
  normalRange?: string;
  status?: string;
  resultDate?: string;
  notes?: string;
}

interface LabResultModalProps {
  visible: boolean;
  onClose: () => void;
  result: LabResult | null;
}

const LabResultModal: React.FC<LabResultModalProps> = ({ visible, onClose, result }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  if (!visible) return null;

  // Handle missing result data
  const resultData = result || {
    testName: 'Unknown Test',
    result: 'N/A',
    unit: '',
    normalRange: 'N/A',
    status: 'Unknown',
    resultDate: new Date().toISOString(),
    notes: 'No additional notes available'
  };

  return (
    <Modal visible={visible} transparent animationType="slide" presentationStyle="fullScreen">
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Enhanced Header */}
            <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
              <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FF980015' }]}>
                    <Ionicons name="flask" size={24} color="#FF9800" />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={[styles.title, { color: themeColors.text }]}>
                      Lab Results
                    </Text>
                    <Text style={[styles.subtitle, { color: themeColors.subText }]}>
                      {resultData.testName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.closeButton, { backgroundColor: themeColors.background }]} 
                  onPress={onClose}
                >
                  <Ionicons name="close" size={24} color={themeColors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

              {/* Test Information Card */}
              <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                    Test Information
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#4CAF5015' }]}>
                    <Text style={[styles.statusText, { color: '#4CAF50' }]}>NORMAL</Text>
                  </View>
                </View>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Test Name</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {resultData.testName}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Reference ID</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {resultData.id || 'LAB-' + Date.now().toString().slice(-8)}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Collection Date</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {resultData.resultDate ? new Date(resultData.resultDate).toLocaleDateString() : new Date().toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Status</Text>
                      <Text style={[styles.value, { color: '#4CAF50' }]}>
                        {resultData.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Results Card */}
              <View style={[styles.resultsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                  Test Results
                </Text>
                
                <View style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={[styles.resultName, { color: themeColors.text }]}>Result Value</Text>
                    <View style={[styles.resultBadge, { backgroundColor: '#4CAF5015' }]}>
                      <Text style={[styles.resultStatus, { color: '#4CAF50' }]}>Normal</Text>
                    </View>
                  </View>
                  <Text style={[styles.resultValue, { color: themeColors.text }]}>
                    {resultData.result} {resultData.unit}
                  </Text>
                  <Text style={[styles.resultRange, { color: themeColors.subText }]}>
                    Normal Range: {resultData.normalRange}
                  </Text>
                </View>
                
                {resultData.notes && resultData.notes !== 'No additional notes available' && (
                  <View style={[styles.notesSection, { backgroundColor: themeColors.background }]}>
                    <Text style={[styles.notesTitle, { color: themeColors.text }]}>Notes</Text>
                    <Text style={[styles.notesText, { color: themeColors.subText }]}>
                      {resultData.notes}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.downloadButton, { backgroundColor: '#FF9800' }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Download Report</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.actionButton, styles.shareButton, { backgroundColor: themeColors.border }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-outline" size={20} color={themeColors.text} />
                  <Text style={[styles.actionButtonText, { color: themeColors.text }]}>Share</Text>
                </TouchableOpacity>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modal: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resultsCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: 'uppercase',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultItem: {
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultName: {
    fontSize: 16,
    fontWeight: "600",
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  resultStatus: {
    fontSize: 12,
    fontWeight: "700",
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  resultRange: {
    fontSize: 14,
    fontWeight: "500",
  },
  notesSection: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  downloadButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: 'white',
  },
});

export default LabResultModal;
