import AppointmentCard, { AppointmentCardItem } from "@/components/appointmentCard";
import Button from "@/components/button.component";
import ConfirmStartCallModal from "@/components/modals/confirmStartCallModal";
import AppointmentCardSkeleton from "@/components/skeleton/AppointmentCardSkeleton";
import TopHeader from "@/components/top-header.component";
import EmptyState from "@/components/EmptyState";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useCachedAppointments } from "@/hooks/useCachedData";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Appointments = () => {
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">(
    "upcoming"
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState<any>(null);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;
  const { t } = useLanguage();

  // Cache-aware data fetching
  const {
    data: appointments,
    doctors,
    isLoading,
    isRefreshing,
    error,
    refresh,
    clearError
  } = useCachedAppointments();

  const onRefresh = React.useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  }, [refresh]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return appointments.filter((a: any) => new Date(a.appointmentDate).getTime() >= now);
  }, [appointments]);

  const past = useMemo(() => {
    const now = Date.now();
    return appointments.filter((a: any) => new Date(a.appointmentDate).getTime() < now);
  }, [appointments]);

  const handleJoinCall = (appt: any) => {
    setActiveAppointment(appt);
    setModalVisible(true);
  };

  const handleConfirmCall = () => {
    setModalVisible(false);
    router.push("/appointment/video-room");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TopHeader screen="appointments" />

      {/* Enhanced Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        {["upcoming", "past"].map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab ? [styles.activeTab, { backgroundColor: brandColors.primary }] : styles.inactiveTab,
            ]}
            onPress={() => setSelectedTab(tab as "upcoming" | "past")}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === tab ? "#fff" : themeColors.text },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {selectedTab === tab && (
              <View style={styles.tabIndicator}>
                <Text style={[styles.tabCount, { color: "#fff" }]}>
                  {tab === "upcoming" ? upcoming.length : past.length}
                </Text>
              </View>
            )}
          </Pressable>
        ))} 
      </View>


      <ScrollView
          contentContainerStyle={[
            styles.appointmentCardContainer,
            { backgroundColor: themeColors.background },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.text}
            />
          }
        >
          {isLoading ? (
            <AppointmentCardSkeleton count={3} />
          ) : (
            <>
              {((selectedTab === "upcoming" && upcoming.length === 0) || 
                (selectedTab === "past" && past.length === 0)) ? (
                <EmptyState
                  icon={selectedTab === "upcoming" ? "calendar-outline" : "checkmark-circle-outline"}
                  title={selectedTab === "upcoming" ? "No Upcoming Appointments" : "No Past Appointments"}
                  subtitle={selectedTab === "upcoming" 
                    ? "You don't have any scheduled appointments yet. Book your first consultation!" 
                    : "You haven't completed any appointments yet."
                  }
                />
              ) : (
                <AppointmentCard
                  isPast={selectedTab === "past"}
                  items={(selectedTab === "upcoming" ? upcoming : past).map((appt: any) => {
                    const when = new Date(appt.appointmentDate);
                    const dateStr = when.toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    });
                    const timeStr = when.toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    });
                    const doc = (doctors || []).find((d: any) => String(d.doctorId) === String(appt.doctorId));
                    const docName = doc ? `${doc.firstName ?? ""} ${doc.lastName ?? ""}`.trim() || "Doctor" : (appt.doctorName || "Doctor");
                    return {
                      id: appt.appointmentId,
                      doctorName: docName,
                      specialty: (doc && doc.specialization) || appt.doctorSpecialization || appt.appointmentMode,
                      date: dateStr,
                      time: timeStr,
                      type: /online/i.test(appt.appointmentMode) ? "Video Call" : "In-Person",
                      imageUrl: doc && (doc as any).avatarUrl ? (doc as any).avatarUrl : undefined,
                    } as AppointmentCardItem;
                  })}
                  onJoinCall={(item) => {
                    const found = appointments.find((a: any) => String(a.appointmentId) === String(item.id));
                    if (found) handleJoinCall(found);
                  }}
                  onMessage={(item) => {
                    const found = appointments.find((a: any) => String(a.appointmentId) === String(item.id));
                    const docId = found?.doctorId ? String(found.doctorId) : "";
                    const docName = item.doctorName || "Doctor";
                    router.push({ pathname: "/appointment/chat", params: { doctorId: docId, doctorName: docName } });
                  }}
                />
              )}
            </>
          )}
        </ScrollView>
        
        {/* Enhanced Bottom Action */}
          <TouchableOpacity 
            style={[styles.bookButton, { backgroundColor: brandColors.primary }]}
            onPress={() => router.push("/appointment/schedule")}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.bookButtonText}>
              {t("appointments.book")}
            </Text>
          </TouchableOpacity>

      <ConfirmStartCallModal
        visible={modalVisible}
        onConfirm={handleConfirmCall}
        onCancel={() => setModalVisible(false)}
        appointmentDate={activeAppointment?.appointmentDate ?? null}
        doctorName={"Doctor"}
      />
    </View>
  );
};

export default Appointments;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginVertical: 20,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  tabCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  appointmentCardContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  bottomAction: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
