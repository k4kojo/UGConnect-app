import React, { useState } from "react";

import ConsultationInfo from "@/components/consultation/consultationInfo.component";
import NotesAndRecordings from "@/components/consultation/notesAndRecordings";
import Participants from "@/components/consultation/participants.component";
import Tabs from "@/components/consultation/tabs.component";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  Image,
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

  const openModal = () => {
    setModalVisible(true);
  };

  const upcomingConsultation = {
    doctor: "Dr. Derick Agyeman",
    specialty: "General Physician",
    date: "16 June, 2025",
    time: "11:00AM",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
  };

  const consultationHistory = [
    {
      id: "1",
      doctor: "Dr. Kwame Appiah",
      date: "May 20, 2024",
    },
    {
      id: "2",
      doctor: "Dr. Aisha Owusu",
      date: "May 20, 2024",
    },
    {
      id: "3",
      doctor: "Dr. Clemet Adjei",
      date: "May 20, 2024",
    },
  ];

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      // Add any data reload logic here if needed
      await new Promise((r) => setTimeout(r, 600));
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TopHeader screen="consult" />

      <View
        style={[styles.content, { backgroundColor: themeColors.background }]}
      >
        {/* Upcoming Consultation */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Upcoming Consultations
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.doctorRow}>
            <Image
              source={{ uri: upcomingConsultation.image }}
              style={styles.avatar}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.doctorName, { color: themeColors.text }]}>
                {upcomingConsultation.doctor}
              </Text>
              <Text style={[styles.specialty, { color: themeColors.subText }]}>
                {upcomingConsultation.specialty}
              </Text>
            </View>
          </View>

          <Text style={[styles.datetime, { color: themeColors.subText }]}>
            {upcomingConsultation.date} | {upcomingConsultation.time}
          </Text>
          <TouchableOpacity
            style={[
              styles.joinButton,
              { backgroundColor: brandColors.primary },
            ]}
          >
            <Text style={styles.joinButtonText}>Join Consultation</Text>
          </TouchableOpacity>
        </View>

        {/* Consultation History */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Consultation History
        </Text>
        <FlatList
          data={consultationHistory}
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
              <TouchableOpacity onPress={openModal}>
                <Text
                  style={[styles.viewSummary, { color: brandColors.primary }]}
                >
                  View summary
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
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
              <ConsultationInfo tab={tab} />
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
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    marginRight: 10,
  },
  doctorName: {
    fontWeight: "600",
    fontSize: 15,
  },
  specialty: {
    fontStyle: "italic",
  },
  datetime: {
    marginTop: 5,
    marginBottom: 15,
  },
  joinButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "600",
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
});