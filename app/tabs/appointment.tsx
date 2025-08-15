import Button from "@/components/button.component";
import DoctorCard from "@/components/doctor-card";
import Loader from "@/components/loader.component";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { fetchAppointments } from "@/redux/appointmentsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchAppointments());
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

      {isLoading ? (
        <Loader 
          fullScreen 
          backgroundColor={themeColors.background}
          color={brandColors.primary}
        />
      ) : (
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
          {selectedTab === "upcoming" && upcoming.length === 0 ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <Text style={{ color: themeColors.subText, fontSize: 14 }}>
                {t("appointments.noPending")}
              </Text>
            </View>
          ) : null}

          {(selectedTab === "upcoming" ? upcoming : past).map((appt: any) => {
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
            return (
              <DoctorCard
                key={appt.appointmentId}
                name={appt.doctorName || "Doctor"}
                specialty={appt.doctorSpecialization || appt.appointmentMode}
                date={dateStr}
                time={timeStr}
                type={appt.appointmentMode}
                location={"—"}
                image={"https://randomuser.me/api/portraits/men/1.jpg"}
                onJoinCall={() => handleJoinCall(appt)}
                onChat={() => router.push("/appointment/chat")}
              />
            );
          })}

          <View style={{ marginTop: 20 }}>
            <Button
              title={t("appointments.book")}
              onPress={() => router.push("/appointment/schedule")}
            />
          </View>
        </ScrollView>
      )}

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: themeColors.card }]}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>DR</Text>
            </View>

            <Text style={[styles.modalDoctorName, { color: themeColors.text }]}>Doctor</Text>
            <View style={styles.modalRow}>
              <Ionicons
                name="time-outline"
                size={18}
                color={themeColors.subText}
              />
              <Text style={[styles.modalText, { color: themeColors.subText }]}>
                {activeAppointment
                  ? new Date(activeAppointment.appointmentDate).toLocaleTimeString(undefined, {
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : ""}
              </Text>
              <Ionicons
                name="videocam-outline"
                size={18}
                color={themeColors.subText}
                style={{ marginLeft: 8 }}
              />
              <Text style={[styles.modalText, { color: themeColors.subText }]}>
                Video Call
              </Text>
            </View>

            <Text style={[styles.modalMessage, { color: themeColors.text }]}>
              Ready to start your video consultation?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.startBtn,
                  { backgroundColor: brandColors.secondary },
                ]}
                onPress={handleConfirmCall}
              >
                <Ionicons name="videocam" size={18} color="#fff" />
                <Text style={styles.startText}>Start</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: themeColors.border },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelText, { color: themeColors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 20,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 10,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  modalDoctorName: {
    fontWeight: "600",
    fontSize: 18,
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalText: {
    marginLeft: 4,
    fontSize: 14,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 22,
  },
  modalActions: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    marginRight: 8,
  },
  startText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  cancelBtn: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  cancelText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
