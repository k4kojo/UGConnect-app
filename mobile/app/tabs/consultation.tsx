import React, { useEffect, useState } from "react";

import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import EmptyState from "@/components/EmptyState";
import { useAppointments, useDoctors } from "@/hooks/useCache";
import { ConsultationItemSkeleton } from "@/components/SkeletonLoader";
import ConsultationModal from "@/components/modals/consultationModal";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Consultation = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConsultationId, setSelectedConsultationId] = useState<string | null>(null);
  const [selectedConsultation, setSelectedConsultation] = useState<any>(null);

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

  const openModal = (consultationId?: string, consultationData?: any) => {
    setSelectedConsultationId(consultationId || null);
    setSelectedConsultation(consultationData || null);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedConsultationId(null);
    setSelectedConsultation(null);
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
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: brandColors.primary + '15' }]}>
              <Ionicons name="medical" size={24} color={brandColors.primary} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
                Consultation History
              </Text>
              <Text style={[styles.sectionSubtitle, { color: themeColors.subText }]}>
                View your past consultations and medical records
              </Text>
            </View>
          </View>
        </View>
        
        {isLoading ? (
          <View style={styles.skeletonContainer}>
            <ConsultationItemSkeleton />
            <ConsultationItemSkeleton />
            <ConsultationItemSkeleton />
            <ConsultationItemSkeleton />
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
              <TouchableOpacity
                style={[
                  styles.historyItem,
                  {
                    backgroundColor: themeColors.card,
                    borderColor: themeColors.border,
                  },
                ]}
                onPress={() => openModal(item.id, { 
                  doctor: item.doctor, 
                  date: item.date,
                  appointment: item.appointment 
                })}
                activeOpacity={0.7}
              >
                <View style={styles.historyContent}>
                  <View style={styles.historyLeft}>
                    <View style={[styles.doctorAvatar, { backgroundColor: brandColors.primary + '15' }]}>
                      <Ionicons name="person" size={20} color={brandColors.primary} />
                    </View>
                    <View style={styles.historyInfo}>
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
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, { backgroundColor: '#4CAF5015' }]}>
                          <Text style={[styles.statusText, { color: '#4CAF50' }]}>
                            Completed
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.historyRight}>
                    <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <EmptyState
            icon="medical-outline"
            title="No past consultations found"
          />
        )}
      </View>
      
      <ConsultationModal
        visible={modalVisible}
        onClose={closeModal}
        consultation={selectedConsultation}
        selectedConsultationId={selectedConsultationId}
      />
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
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  skeletonContainer: {
    flex: 1,
  },
  historyItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyDoctor: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: 'uppercase',
  },
  historyRight: {
    marginLeft: 12,
  },
});