import Avatar from "@/components/avatar.component";
import Loader from "@/components/loader.component";
import PhotoSheet from "@/components/modals/photoSheet";
import SettingItem from "@/components/settings-item";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { getStoredUser, updateCurrentUser } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
    profilePicture?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const user = await getStoredUser();
        if (user) {
          setProfile({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profilePicture: user.profilePicture,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const fullName = `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim();

  const requestPermissions = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const takePhoto = async () => {
    try {
      await requestPermissions();
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        setLocalImageUrl(result.assets[0].uri);
        const uploadedUrl = result.assets[0].uri;

      await updateCurrentUser({ profilePicture: uploadedUrl });
      setProfile((p) => (p ? { ...p, profilePicture: uploadedUrl } : p));
      }
    } finally {
      setSheetVisible(false);
    }
  };

  const choosePhoto = async () => {
    try {
      await requestPermissions();
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets) {
        setLocalImageUrl(result.assets[0].uri);
        const uploadedUrl = result.assets[0].uri;

      await updateCurrentUser({ profilePicture: uploadedUrl });
      setProfile((p) => (p ? { ...p, profilePicture: uploadedUrl } : p));
      }
    } finally {
      setSheetVisible(false);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      const user = await getStoredUser();
      if (user) {
        setProfile({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
          profilePicture: user.profilePicture,
        });
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (isLoading) {
    return (
      <Loader 
        fullScreen 
        backgroundColor={themeColors.background}
        color={brand.primary}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }} edges={["top"]}>
      <ScrollView
        style={[styles.container, { backgroundColor: themeColors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.text}
          />
        }
      >
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.header, { color: themeColors.text }]}>Profile</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={26} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: brand.primary }]}>
        <TouchableOpacity onPress={() => setSheetVisible(true)}>
        <Avatar
          imageUrl={localImageUrl ?? profile?.profilePicture}
          firstName={profile?.firstName}
          lastName={profile?.lastName}
          size={80}
          containerStyle={{ marginRight: 20, backgroundColor: "rgba(255,255,255,0.2)" }}
          border={false}
          textStyle={{ color: "#fff", fontSize: 28 }}
        />
        </TouchableOpacity>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{fullName}</Text>
          <Text style={styles.email}>{profile?.email || ""}</Text>
        </View>
      </View>

      {/* Section */}
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>General</Text>

      <View style={styles.section}>
        <SettingItem
          icon="person"
          label="Account Information"
          caption="Change your account information"
          onPress={() => router.push("/profile/account")}
        />
        <SettingItem
          icon="medical"
          label="Medical Records"
          caption="View your medical records"
          onPress={() => router.push("/profile/medical-record")}
        />
        <SettingItem
          icon="business"
          label="Hospital Information"
          caption="Manage hospital preferences"
          onPress={() => router.push("/profile/hospital")}
        />
        <SettingItem
          icon="shield-checkmark"
          label="Insurance"
          caption="Manage insurance details"
          onPress={() => router.push("/profile/insurance")}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>Preferences</Text>

      <View style={styles.section}>
        <SettingItem
          icon="settings"
          label="Settings"
          caption="App preferences and notifications"
          onPress={() => router.push("/profile/settings")}
        />
      </View>

      <PhotoSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onTakePhoto={takePhoto}
        onChoosePhoto={choosePhoto}
      />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: { fontSize: 24, fontWeight: "bold" },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  userInfo: { flex: 1 },
  name: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  email: { color: "rgba(255,255,255,0.8)", fontSize: 16 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
  },
  section: { marginBottom: 20 },
});
