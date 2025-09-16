import React, { useEffect, useState } from "react";

import ConsultationInfo from "@/components/consultation/consultationInfo.component";
import NotesAndRecordings from "@/components/consultation/notesAndRecordings";
import Participants from "@/components/consultation/participants.component";
import Tabs from "@/components/consultation/tabs.component";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import EmptyState from "@/components/EmptyState";
import { useAppointments, useDoctors } from "@/hooks/useCache";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const TABS = [
  { label: "Overview" },
  { label: "Prescriptions", count: 2 },
  { label: "Lab Results", count: 2 },
  { label: "Chat" },
];

const Consultation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState(0);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;

  // Cache service integration
  const { 
    data: appointments, 
    loading: appointmentsLoading, 
    refresh: refreshAppointments 
  } = useAppointments();
  
  const { 
    data: doctors, 
    loading: doctorsLoading, 
    refresh: refreshDoctors 
  } = useDoctors();

  const isLoading = appointmentsLoading || doctorsLoading;

  const openModal = (consultationId?: string) => {
    setSelectedConsultationId(consultationId || null);
    setModalVisible(true);
  };

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshAppointments(),
        refreshDoctors()
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshAppointments, refreshDoctors]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TopHeader screen="consult" />

      <View
        style={[styles.content, { backgroundColor: themeColors.background }]}
      >
        {/* Consultation History */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Consultation History
        </Text>
        
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: themeColors.subText }]}>
              Loading consultations...
            </Text>
          </View>
        ) : appointments && appointments.length > 0 ? (
          <FlatList
            data={appointments
              .filter((appt: any) => {
                // Only show past appointments
                const appointmentDate = new Date(appt.appointmentDate);
                const currentDate = new Date();
                // Set current date to start of day for accurate comparison
                currentDate.setHours(0, 0, 0, 0);
                appointmentDate.setHours(0, 0, 0, 0);
                return appointmentDate < currentDate;
              })
              .map((appt: any) => {
                const when = new Date(appt.appointmentDate);
                const dateStr = when.toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                const doc = (doctors || []).find((d: any) => String(d.doctorId) === String(appt.doctorId));
                const docName = doc ? `${doc.firstName ?? ""} ${doc.lastName ?? ""}`.trim() || "Doctor" : (appt.doctorName || "Doctor");
                
                return {
                  id: appt.appointmentId,
                  doctor: docName,
                  date: dateStr,
                  appointment: appt,
                };
              })}
            keyExtractor={(item) => item.id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={themeColors.text}
              />
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.historyItem,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
              >
                <View>
                  <Text
                    style={[styles.historyDoctor, { color: themeColors.text }]}
                  >
                    {item.doctor}
                  </Text>
                  <Text
                    style={[styles.historyDate, { color: themeColors.subText }]}
                  >
                    {item.date}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => openModal(item.id)}>
                  <Text
                    style={[styles.viewSummary, { color: brandColors.primary }]}
                  >
                    View summary
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <EmptyState
            icon="medical-outline"
            title="No past consultations found"
          />
        )}
      </View>
      <Modal
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.overlay}>
          <View
            style={[styles.modal, { backgroundColor: themeColors.background }]}
          >
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeBtn}
            >
              <Ionicons name="close" size={30} color={themeColors.text} />
            </TouchableOpacity>
            <View style={{ marginBottom: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 7,
                  marginBottom: 5,
                  marginLeft: -5,
                }}
              >
                <Ionicons
                  name="document-text-outline"
                  size={35}
                  color={themeColors.text}
                  style={{ fontWeight: "bold" }}
                />
                <Text
                  style={{
                    color: themeColors.text,
                    fontSize: 25,
                    fontWeight: "bold",
                  }}
                >
                  Consultation Details
                </Text>
              </View>
              <Text style={{ color: themeColors.subText }}>
                Consultation with Dr. Kofi Mensah
              </Text>
            </View>

            {/* Tab Bar */}
            <Tabs TABS={TABS} tab={tab} setTab={setTab} />

            {/* Tab Content */}
            <ScrollView
              style={{ flex: 1, width: "100%" }}
              contentContainerStyle={{
                paddingBottom: 32,
                alignItems: "center",
              }}
              showsVerticalScrollIndicator={false}
            >
              <ConsultationInfo tab={tab} consultationId={selectedConsultationId || undefined} />
              <Participants tab={tab} />
              <NotesAndRecordings
                tab={tab}
                title="Clinical Notes"
                content="Patient reports improved blood pressure readings. Continue current medication regimen. Recommended lifestyle modifications including regular exercise and reduced sodium intake. Schedule follow-up in 4 weeks."
              />
              <NotesAndRecordings tab={tab} title="Consultation Recordings">
                <View style={styles.customContent}>
                  <Text>I am tired</Text>
                </View>
              </NotesAndRecordings>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Consultation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  historyItem: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyDoctor: {
    fontWeight: "600",
    marginBottom: 3,
  },
  historyDate: {
    fontSize: 13,
  },
  viewSummary: {
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "100%",
    height: "100%",
    padding: 20,
  },
  closeBtn: {
    alignSelf: "flex-end",
  },
  customContent: {
    width: 328,
    height: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 6,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
  },
});