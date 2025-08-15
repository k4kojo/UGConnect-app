import AppointmentCard, { AppointmentCardItem } from "@/components/appointmentCard";
import Button from "@/components/button.component";
import ConfirmStartCallModal from "@/components/modals/confirmStartCallModal";
import AppointmentCardSkeleton from "@/components/skeleton/AppointmentCardSkeleton";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { fetchAppointments } from "@/redux/appointmentsSlice";
import { fetchDoctors } from "@/redux/doctorsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

  // API-driven appointments via Redux
  const dispatch = useAppDispatch();
  const { items: appointments, isLoading } = useAppSelector((s: any) => s.appointments);
  const { items: doctors } = useAppSelector((s: any) => s.doctors);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      dispatch(fetchDoctors());
    }
  }, [dispatch]);

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchAppointments());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

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
      <View
        style={[styles.tabContainer, { backgroundColor: themeColors.subCard }]}
      >
        {["upcoming", "past"].map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab && { backgroundColor: brandColors.primary },
            ]}
            onPress={() => setSelectedTab(tab as "upcoming" | "past")}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === tab ? "#fff" : themeColors.text },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === "upcoming" ? `(${upcoming.length})` : `(${past.length})`}
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
              refreshing={refreshing}
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
                onMessage={() => router.push("/appointment/chat")}
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
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  appointmentCardContainer: {
    paddingHorizontal: 10,
  },
});
