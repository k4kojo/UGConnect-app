import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard } from "react-native";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface Prescription {
  id?: number;
  appointmentId?: string;
  doctorId?: string;
  medication?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  instructions?: string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

type Props = {
  visible: boolean;
  onClose: () => void;
  prescription: Prescription | null;
};

const PrescriptionModal: React.FC<Props> = ({ visible, onClose, prescription }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  if (!visible) return null;

  // Handle missing prescription data
  const prescriptionData = prescription || {
    id: Date.now(),
    medication: 'Unknown Medication',
    dosage: 'N/A',
    frequency: 'N/A',
    duration: 'N/A',
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    instructions: 'No instructions available'
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
                  <View style={[styles.iconContainer, { backgroundColor: '#4CAF5015' }]}>
                    <Ionicons name="medkit" size={24} color="#4CAF50" />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={[styles.title, { color: themeColors.text }]}>
                      Prescription
                    </Text>
                    <Text style={[styles.subtitle, { color: themeColors.subText }]}>
                      {prescriptionData.medication}
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
              {/* Prescription Information Card */}
              <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                    Prescription Details
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: '#4CAF5015' }]}>
                    <Text style={[styles.statusText, { color: '#4CAF50' }]}>ACTIVE</Text>
                  </View>
                </View>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Medication</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {prescriptionData.medication}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Dosage</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {prescriptionData.dosage}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Frequency</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {prescriptionData.frequency}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Duration</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {prescriptionData.duration}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Prescribed Date</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {prescriptionData.createdAt ? new Date(prescriptionData.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={[styles.label, { color: themeColors.subText }]}>Prescription ID</Text>
                      <Text style={[styles.value, { color: themeColors.text }]}>
                        {prescriptionData.id ? `RX-${prescriptionData.id}` : 'RX-' + Date.now().toString().slice(-6)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Instructions Card */}
              <View style={[styles.instructionsCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                  Instructions
                </Text>
                
                <View style={[styles.instructionItem, { backgroundColor: themeColors.background }]}>
                  <View style={styles.instructionIcon}>
                    <Ionicons name="time-outline" size={20} color="#4CAF50" />
                  </View>
                  <Text style={[styles.instructionText, { color: themeColors.text }]}>
                    Take {prescriptionData.frequency} with food
                  </Text>
                </View>
                
                <View style={[styles.instructionItem, { backgroundColor: themeColors.background }]}>
                  <View style={styles.instructionIcon}>
                    <Ionicons name="warning-outline" size={20} color="#FF9800" />
                  </View>
                  <Text style={[styles.instructionText, { color: themeColors.text }]}>
                    Complete the full course even if you feel better
                  </Text>
                </View>
                
                <View style={[styles.instructionItem, { backgroundColor: themeColors.background }]}>
                  <View style={styles.instructionIcon}>
                    <Ionicons name="information-circle-outline" size={20} color="#2196F3" />
                  </View>
                  <Text style={[styles.instructionText, { color: themeColors.text }]}>
                    {prescriptionData.instructions}
                  </Text>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.downloadButton, { backgroundColor: '#4CAF50' }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="download-outline" size={20} color="white" />
                  <Text style={styles.actionButtonText}>Download PDF</Text>
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
  instructionsCard: {
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
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  instructionIcon: {
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
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

export default PrescriptionModal;
