import Avatar from "@/components/avatar.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { createDoctorFeedback, listDoctors } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type DoctorProfile = {
  id: number;
  doctorId: string | null;
  specialization: string;
  licenseNumber: string;
  bio?: string | null;
  reviews: number;
  rating: number;
  experienceYears?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

const DoctorProfileScreen = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const params = useLocalSearchParams<{ doctorId?: string }>();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const doctors = await listDoctors();
        const found = doctors.find((d: any) => String(d.doctorId) === String(params.doctorId || ""));
        setDoctor(found || null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.doctorId]);

  const fullName = useMemo(() => {
    if (!doctor) return "Doctor";
    const n = `${doctor.firstName ?? ""} ${doctor.lastName ?? ""}`.trim();
    return n || "Doctor";
  }, [doctor]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Doctor Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Top identity */}
        <View style={{ alignItems: "center", marginTop: 16, marginBottom: 12 }}>
          <Avatar size={96} fullName={fullName} containerStyle={{ backgroundColor: Colors.brand.avatarBg, borderColor: Colors.brand.avatarBg }} />
          <Text style={[styles.name, { color: themeColors.text, marginTop: 10 }]}>{fullName}</Text>
          <Text style={[styles.sub, { color: themeColors.subText }]}>{doctor?.specialization || "Specialist"}</Text>
          <Text style={[styles.sub, { color: themeColors.subText, marginTop: 4 }]}>
            <Ionicons name="star" size={14} color="orange" /> {Number(doctor?.rating ?? 0).toFixed(1)} ({Math.round(Number(doctor?.reviews ?? 0))} reviews)
          </Text>
        </View>

        {/* Quick actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: themeColors.subCard }]}
            onPress={() => router.push({ pathname: "/appointment/select-time", params: { doctorId: doctor?.doctorId ?? "" } })}>
            <Ionicons name="call-outline" size={18} color={themeColors.text} />
            <Text style={{ color: themeColors.text }}>Audio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: themeColors.subCard }]}
            onPress={() => router.push({ pathname: "/appointment/video-room" })}>
            <Ionicons name="videocam-outline" size={18} color={themeColors.text} />
            <Text style={{ color: themeColors.text }}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: themeColors.subCard }]}
            onPress={() => router.push({ pathname: "/appointment/chat", params: { doctorId: doctor?.doctorId ?? "", doctorName: fullName } })}>
            <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
            <Text style={{ color: themeColors.text }}>Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Info rows */}
        <View style={[styles.listRow, { borderBottomColor: themeColors.border }]}> 
          <Ionicons name="mail-outline" size={18} color={themeColors.subText} />
          <Text style={[styles.listText, { color: themeColors.text }]}>{doctor?.email || "Not provided"}</Text>
        </View>
        <View style={[styles.listRow, { borderBottomColor: themeColors.border }]}> 
          <Ionicons name="call-outline" size={18} color={themeColors.subText} />
          <Text style={[styles.listText, { color: themeColors.text }]}>{doctor?.phoneNumber || "Not provided"}</Text>
        </View>
        <View style={[styles.listRow, { borderBottomColor: themeColors.border }]}> 
          <Ionicons name="briefcase-outline" size={18} color={themeColors.subText} />
          <Text style={[styles.listText, { color: themeColors.text }]}>Experience: {doctor?.experienceYears || "-"} yrs</Text>
        </View>
        <View style={[styles.listRow, { borderBottomColor: themeColors.border }]}> 
          <Ionicons name="shield-checkmark-outline" size={18} color={themeColors.subText} />
          <Text style={[styles.listText, { color: themeColors.text }]}>License: {doctor?.licenseNumber || "-"}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 14 }]}>About</Text>
        <Text style={[styles.bio, { color: themeColors.subText, marginBottom: 10 }]}>{doctor?.bio || "No bio provided."}</Text>

        <View style={{ marginTop: 20 }}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Give Feedback</Text>
          <DoctorFeedback doctorId={doctor?.doctorId || ""} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: "600" },
  name: { fontSize: 18, fontWeight: "700" },
  sub: { fontSize: 14 },
  actionsRow: { flexDirection: "row", justifyContent: "space-between", marginHorizontal: 16, marginBottom: 12, gap: 10 },
  actionBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center", gap: 6 },
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, gap: 10 },
  listText: { fontSize: 14 },
  sectionTitle: { marginTop: 16, marginBottom: 6, fontWeight: "600", fontSize: 16 },
  bio: { fontSize: 14, lineHeight: 20 },
  ctaBtn: { marginTop: 16, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  ctaText: { color: "#fff", fontWeight: "600" },
});

export default DoctorProfileScreen;

// Inline feedback component (simple stars + comment)
const DoctorFeedback: React.FC<{ doctorId: string }> = ({ doctorId }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!doctorId || sending) return;
    try {
      setSending(true);
      await createDoctorFeedback({ doctorId, rating, comment });
      setSent(true);
      setComment("");
    } catch (e) {
      // optional: toast
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ borderWidth: 1, borderColor: themeColors.border, borderRadius: 12, padding: 12 }}>
      <Text style={{ color: themeColors.text, marginBottom: 6 }}>Rate this doctor</Text>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity key={n} onPress={() => setRating(n)}>
            <Ionicons name={n <= rating ? "star" : "star-outline"} size={22} color="orange" />
          </TouchableOpacity>
        ))}
      </View>
      <TextInput
        placeholder="Write a short comment"
        placeholderTextColor={themeColors.subText}
        value={comment}
        onChangeText={setComment}
        multiline
        style={{
          borderWidth: 1,
          borderColor: themeColors.border,
          backgroundColor: themeColors.card,
          color: themeColors.text,
          borderRadius: 8,
          minHeight: 80,
          padding: 10,
        }}
      />
      <TouchableOpacity
        style={{
          marginTop: 10,
          backgroundColor: Colors.brand.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: "center",
          opacity: sending ? 0.6 : 1,
        }}
        disabled={sending}
        onPress={handleSubmit}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>{sent ? "Sent" : "Submit"}</Text>
      </TouchableOpacity>
    </View>
  );
};


