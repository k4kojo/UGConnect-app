import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  name: string;
  specialty: string;
  date: string;
  time: string;
  type: string;      // e.g., "Video Call" | "In-Person"
  location: string;  // optional to show elsewhere
  image?: string;
  onJoinCall?: () => void;
  onChat?: () => void;
};

const getInitials = (fullName: string) => {
  if (!fullName) return "";
  const parts = fullName.trim().split(/\s+/).slice(0, 3);
  return parts.map(p => p[0]?.toUpperCase() || "").join("");
};

const DoctorCard = ({
  name,
  specialty,
  date,
  time,
  type,
  location,
  image,
  onJoinCall,
  onChat,
}: Props) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  const t = (type || "").toLowerCase();
  const isVideo = t.includes("video");
  const typeLabel = isVideo ? "Video Call" : "In-Person";
  const typeIcon = isVideo ? "videocam-outline" : "person-outline";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          // iOS shadow
          shadowColor: "#000",
        },
      ]}
    >
      {/* Header: Avatar + Name/Specialty + Type Badge */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.initialsAvatar,
                { backgroundColor: theme === "dark" ? "#2C2C2C" : "#EEF2F6" },
              ]}
            >
              <Text style={[styles.initialsText, { color: themeColors.subText }]}>
                {getInitials(name)}
              </Text>
            </View>
          )}

          <View>
            <Text style={[styles.name, { color: themeColors.text }]}>{name}</Text>
            <Text style={[styles.specialty, { color: themeColors.subText }]}>
              {specialty}
            </Text>
          </View>
        </View>

        {/* Type badge on the right */}
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor: isVideo ? "#111" : (theme === "dark" ? "#2C2C2C" : "#EFF1F3"),
            },
          ]}
        >
          <Ionicons
            name={typeIcon as any}
            size={14}
            color={isVideo ? "#fff" : themeColors.text}
          />
          <Text
            style={[
              styles.typeBadgeText,
              { color: isVideo ? "#fff" : themeColors.text },
            ]}
            numberOfLines={1}
          >
            {typeLabel}
          </Text>
        </View>
      </View>

      {/* Info row: date + time (icons) */}
      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="calendar-outline" size={16} color={themeColors.subText} />
          <Text style={[styles.infoText, { color: themeColors.subText }]}>{date}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color={themeColors.subText} />
          <Text style={[styles.infoText, { color: themeColors.subText }]}>{time}</Text>
        </View>
      </View>

      {/* Actions aligned right: outline buttons */}
      <View style={styles.actionsRow}>
        {isVideo && (
          <TouchableOpacity
            onPress={onJoinCall}
            style={[
              styles.outlineButton,
              {
                borderColor: themeColors.border,
                backgroundColor: theme === "dark" ? "#1A1A1A" : "#fff",
              },
            ]}
          >
            <Ionicons name="videocam-outline" size={18} color={themeColors.text} />
            <Text style={[styles.outlineButtonText, { color: themeColors.text }]}>
              Join Call
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onChat}
          style={[
            styles.outlineButton,
            {
              borderColor: themeColors.border,
              backgroundColor: theme === "dark" ? "#1A1A1A" : "#fff",
            },
          ]}
        >
          <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
          <Text style={[styles.outlineButtonText, { color: themeColors.text }]}>
            Message
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DoctorCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    // Android shadow
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  initialsAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initialsText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  name: {
    fontWeight: "800",
    fontSize: 18,
  },
  specialty: {
    fontSize: 14,
    marginTop: 2,
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 4,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 14,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 14,
  },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});