import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  appointmentDate?: string | Date | null;
  doctorName?: string;
};

const ConfirmStartCallModal: React.FC<Props> = ({
  visible,
  onConfirm,
  onCancel,
  appointmentDate,
  doctorName,
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;

  const timeText = useMemo(() => {
    if (!appointmentDate) return "";
    const d = new Date(appointmentDate);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  }, [appointmentDate]);

  const initials = useMemo(() => {
    const name = (doctorName || "Doctor").trim();
    const parts = name.split(/\s+/);
    const a = parts[0]?.[0] || "D";
    const b = parts[1]?.[0] || "R";
    return `${a}${b}`.toUpperCase();
  }, [doctorName]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modal, { backgroundColor: themeColors.card }]}> 
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <Text style={[styles.modalDoctorName, { color: themeColors.text }]}>
            {doctorName || "Doctor"}
          </Text>

          <View style={styles.modalRow}>
            <Ionicons name="time-outline" size={18} color={themeColors.subText} />
            <Text style={[styles.modalText, { color: themeColors.subText }]}>
              {timeText}
            </Text>
            <Ionicons name="videocam-outline" size={18} color={themeColors.subText} style={{ marginLeft: 8 }} />
            <Text style={[styles.modalText, { color: themeColors.subText }]}>Video Call</Text>
          </View>

          <Text style={[styles.modalMessage, { color: themeColors.text }]}>Ready to start your video consultation?</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.startBtn, { backgroundColor: brandColors.secondary }]} onPress={onConfirm}>
              <Ionicons name="videocam" size={18} color="#fff" />
              <Text style={styles.startText}>Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: themeColors.border }]} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export default ConfirmStartCallModal;


