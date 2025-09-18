import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import Tabs from "@/components/consultation/tabs.component";
import ConsultationInfo from "@/components/consultation/consultationInfo.component";

interface ConsultationData {
  id?: string;
  doctor?: string;
  date?: string;
  duration?: string;
  type?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  clinicalNotes?: string;
  recordingDuration?: string;
}

interface ConsultationModalProps {
  visible: boolean;
  onClose: () => void;
  consultation: ConsultationData | null;
  selectedConsultationId?: string | null;
}

const TABS = [
  { label: "Overview" },
  { label: "Prescriptions", count: 2 },
  { label: "Lab Results", count: 2 },
  { label: "Chat" },
];

const ConsultationModal: React.FC<ConsultationModalProps> = ({ 
  visible, 
  onClose, 
  consultation,
  selectedConsultationId 
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const [tab, setTab] = React.useState(0);

  if (!visible) return null;

  // Handle missing consultation data
  const consultationData = consultation || {
    doctor: 'Dr. Kofi Mensah',
    date: 'Jan 15, 2024',
    duration: '45 minutes',
    type: 'Follow-up',
    chiefComplaint: 'Patient reports persistent headaches and fatigue over the past two weeks. No fever or other symptoms reported.',
    diagnosis: 'Tension headache likely due to stress and poor sleep hygiene. Recommend lifestyle modifications and stress management techniques.',
    clinicalNotes: 'Patient reports improved blood pressure readings. Continue current medication regimen. Recommended lifestyle modifications including regular exercise and reduced sodium intake. Schedule follow-up in 4 weeks.',
    recordingDuration: '45:32'
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
                  <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '15' }]}>
                    <Ionicons name="document-text" size={24} color={brandColors.primary} />
                  </View>
                  <View style={styles.headerText}>
                    <Text style={[styles.title, { color: themeColors.text }]}>
                      Consultation Details
                    </Text>
                    <Text style={[styles.subtitle, { color: themeColors.subText }]}>
                      Consultation with {consultationData.doctor}
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
              {/* Tab Bar */}
              <View style={styles.tabContainer}>
                <Tabs TABS={TABS} tab={tab} setTab={setTab} />
              </View>

              {/* Tab Content */}
              {tab === 0 && (
                <View style={styles.tabContent}>
                  {/* Consultation Overview Card */}
                  <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                        Consultation Overview
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: '#4CAF5015' }]}>
                        <Text style={[styles.statusText, { color: '#4CAF50' }]}>COMPLETED</Text>
                      </View>
                    </View>
                    
                    <View style={styles.infoGrid}>
                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Text style={[styles.label, { color: themeColors.subText }]}>Doctor</Text>
                          <Text style={[styles.value, { color: themeColors.text }]}>
                            {consultationData.doctor}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={[styles.label, { color: themeColors.subText }]}>Date</Text>
                          <Text style={[styles.value, { color: themeColors.text }]}>
                            {consultationData.date}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.infoRow}>
                        <View style={styles.infoItem}>
                          <Text style={[styles.label, { color: themeColors.subText }]}>Duration</Text>
                          <Text style={[styles.value, { color: themeColors.text }]}>
                            {consultationData.duration}
                          </Text>
                        </View>
                        <View style={styles.infoItem}>
                          <Text style={[styles.label, { color: themeColors.subText }]}>Type</Text>
                          <Text style={[styles.value, { color: themeColors.text }]}>
                            {consultationData.type}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Chief Complaint Card */}
                  <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                      Chief Complaint
                    </Text>
                    <View style={[styles.notesSection, { backgroundColor: themeColors.background }]}>
                      <Text style={[styles.notesText, { color: themeColors.text }]}>
                        {consultationData.chiefComplaint}
                      </Text>
                    </View>
                  </View>

                  {/* Diagnosis Card */}
                  <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                      Diagnosis
                    </Text>
                    <View style={[styles.notesSection, { backgroundColor: themeColors.background }]}>
                      <Text style={[styles.notesText, { color: themeColors.text }]}>
                        {consultationData.diagnosis}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {tab === 1 && (
                <View style={styles.tabContent}>
                  <ConsultationInfo tab={tab} consultationId={selectedConsultationId || undefined} />
                </View>
              )}

              {tab === 2 && (
                <View style={styles.tabContent}>
                  <ConsultationInfo tab={tab} consultationId={selectedConsultationId || undefined} />
                </View>
              )}

              {tab === 3 && (
                <View style={styles.tabContent}>
                  {/* Clinical Notes Card */}
                  <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                      Clinical Notes
                    </Text>
                    <View style={[styles.notesSection, { backgroundColor: themeColors.background }]}>
                      <Text style={[styles.notesText, { color: themeColors.text }]}>
                        {consultationData.clinicalNotes}
                      </Text>
                    </View>
                  </View>

                  {/* Consultation Recordings Card */}
                  <View style={[styles.infoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>
                      Consultation Recordings
                    </Text>
                    <View style={[styles.recordingItem, { backgroundColor: themeColors.background }]}>
                      <View style={styles.recordingIcon}>
                        <Ionicons name="play-circle-outline" size={24} color={brandColors.primary} />
                      </View>
                      <View style={styles.recordingInfo}>
                        <Text style={[styles.recordingTitle, { color: themeColors.text }]}>
                          Consultation Audio
                        </Text>
                        <Text style={[styles.recordingDuration, { color: themeColors.subText }]}>
                          Duration: {consultationData.recordingDuration}
                        </Text>
                      </View>
                      <TouchableOpacity style={[styles.playButton, { backgroundColor: brandColors.primary }]}>
                        <Ionicons name="play" size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
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
  tabContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  tabContent: {
    flex: 1,
    paddingBottom: 40,
  },
  infoCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
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
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
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
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  notesSection: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  recordingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  recordingIcon: {
    marginRight: 12,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  recordingDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ConsultationModal;
