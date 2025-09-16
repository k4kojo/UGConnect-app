import AppointmentCard, { AppointmentCardItem } from "@/components/appointmentCard";
import Button from "@/components/button.component";
import ConfirmStartCallModal from "@/components/modals/confirmStartCallModal";
import AppointmentCardSkeleton from "@/components/skeleton/AppointmentCardSkeleton";
import TopHeader from "@/components/top-header.component";
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
  View
} from "react-native";

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

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.subCard}]}>
        {["upcoming", "past"].map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab ? styles.activeTab : styles.inactiveTab,
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
              {selectedTab === "upcoming" && upcoming.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Text style={{ color: themeColors.subText, fontSize: 14 }}>
                    {t("appointments.noPending")}
                  </Text>
                </View>
              ) : null}

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

            </>
          )}
        </ScrollView>
        <View style={{ margin: 20 }}>
          <Button
            title={t("appointments.book")}
            onPress={() => router.push("/appointment/schedule")}
          />
        </View>

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
  tabContainer: {
    flexDirection: "row",
    marginVertical: 20,
    marginHorizontal: 20,
    borderRadius: 50,
    padding: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: Colors.brand.primary,
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  appointmentCardContainer: {
    paddingHorizontal: 10,
  },
});
