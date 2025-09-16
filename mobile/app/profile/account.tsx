import DataCard from "@/components/data-card.component";
import Avatar from "@/components/avatar.component";
import ProfilePictureModal from "@/components/modals/profilePictureModal";
import PhotoSheet from "@/components/modals/photoSheet";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { loadPatientProfile } from "@/redux/profileSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { userService } from "@/services/userService";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserProfile = {
  nationalId: string;
  username: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  city: string;
  province: string;
  address: string;
};

export default function AccountInformationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, profile, isLoading } = useAppSelector((s) => s.profile);
  
  const [profilePictureModalVisible, setProfilePictureModalVisible] = useState(false);
  const [photoSheetVisible, setPhotoSheetVisible] = useState(false);
  const [localImageUrl, setLocalImageUrl] = useState<string | null>(null);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  useEffect(() => {
    dispatch(loadPatientProfile());
  }, [dispatch]);

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const requestPermissions = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await ImagePicker.requestMediaLibraryPermissionsAsync();
  };

  const takePhoto = async () => {
    console.log('takePhoto function called');
    try {
      console.log('Requesting permissions...');
      await requestPermissions();
      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      console.log('Camera result:', result);
      if (!result.canceled && result.assets) {
        const uploadedUrl = result.assets[0].uri;
        console.log('Selected image URI:', uploadedUrl);
        setLocalImageUrl(uploadedUrl);
        const uploadResult = await userService.uploadProfilePicture(uploadedUrl);
        if (uploadResult.success) {
          console.log('Profile picture uploaded successfully');
          // Refresh profile data
          dispatch(loadPatientProfile());
        } else {
          console.error('Profile picture upload failed:', uploadResult.error);
          // Reset local image on failure
          setLocalImageUrl(null);
        }
      }
    } catch (error) {
      console.error('Error in takePhoto:', error);
    } finally {
      setPhotoSheetVisible(false);
      setProfilePictureModalVisible(false);
    }
  };

  const choosePhoto = async () => {
    console.log('choosePhoto function called');
    try {
      console.log('Requesting permissions...');
      await requestPermissions();
      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      console.log('Image library result:', result);
      if (!result.canceled && result.assets) {
        const uploadedUrl = result.assets[0].uri;
        console.log('Selected image URI:', uploadedUrl);
        setLocalImageUrl(uploadedUrl);
        const uploadResult = await userService.uploadProfilePicture(uploadedUrl);
        if (uploadResult.success) {
          console.log('Profile picture uploaded successfully');
          // Refresh profile data
          dispatch(loadPatientProfile());
        } else {
          console.error('Profile picture upload failed:', uploadResult.error);
          // Reset local image on failure
          setLocalImageUrl(null);
        }
      }
    } catch (error) {
      console.error('Error in choosePhoto:', error);
    } finally {
      setPhotoSheetVisible(false);
      setProfilePictureModalVisible(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/tabs/profile")}> 
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Account Information</Text>
        <TouchableOpacity onPress={() => router.push("/profile/edit-account")}>
          <Ionicons name="create-outline" size={22} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <Avatar
            onPress={() => setProfilePictureModalVisible(true)}
            imageUrl={localImageUrl ?? user?.profilePicture}
            firstName={user?.firstName}
            lastName={user?.lastName}
            size={100}
            containerStyle={{ backgroundColor: brand.primary }}
            textStyle={{ color: "#fff", fontSize: 36 }}
          />
          <TouchableOpacity onPress={() => setPhotoSheetVisible(true)}>
            <Text style={[styles.editText, { color: brand.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Personal Info */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Personal</Text>
        <DataCard
          data={[
            { label: "National ID", value: profile?.nationalId ?? "—" },
            { label: "Username", value: profile?.username ?? "—" },
            { label: "First Name", value: user?.firstName ?? "—" },
            { label: "Last Name", value: user?.lastName ?? "—" },
            { label: "Date of Birth", value: (user?.dateOfBirth as string) ?? (profile?.dateOfBirth ?? "—") },
            { label: "Gender", value: profile?.gender ?? "—" },
          ]}
        />

        {/* Contact Info */}
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Contact</Text>
        <DataCard
          data={[
            { label: "Phone Number", value: (user?.phoneNumber as string) ?? "—" },
            { label: "Email", value: (user?.email as string) ?? "—" },
            { label: "City", value: profile?.city ?? "—" },
            { label: "Province", value: profile?.province ?? "—" },
            { label: "Address", value: profile?.address ?? "—", fullWidth: true },
          ]}
        />

        {/* Profile Picture Modal */}
        <ProfilePictureModal
          visible={profilePictureModalVisible}
          onClose={() => setProfilePictureModalVisible(false)}
          onEditPress={() => {
            setProfilePictureModalVisible(false);
            setPhotoSheetVisible(true);
          }}
          imageUrl={localImageUrl ?? user?.profilePicture}
          firstName={user?.firstName}
          lastName={user?.lastName}
        />

        {/* Photo Selection Sheet */}
        <PhotoSheet
          visible={photoSheetVisible}
          onClose={() => setPhotoSheetVisible(false)}
          onTakePhoto={takePhoto}
          onChoosePhoto={choosePhoto}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  editText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 10,
    marginTop: 12,
  },
});
