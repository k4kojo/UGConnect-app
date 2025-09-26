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
  Alert,
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tempImageUri, setTempImageUri] = useState<string | null>(null);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  useEffect(() => {
    dispatch(loadPatientProfile());
  }, [dispatch]);

  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  // Validate if URL is a proper image URL
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false;
    
    try {
      // Check for data URIs (base64 images from server)
      if (url.startsWith('data:image/')) {
        // Validate data URI format
        const dataUriRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,([A-Za-z0-9+/=]+)$/;
        return dataUriRegex.test(url);
      }
      
      // Check for file URIs (local images)
      if (url.startsWith('file://')) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = validExtensions.some(ext => 
          url.toLowerCase().includes(ext)
        );
        
        // Check for obviously invalid filenames
        const hasInvalidChars = /[<>:"|?*]/.test(url.split('/').pop() || '');
        
        return hasValidExtension && !hasInvalidChars;
      }
      
      // Check for HTTP/HTTPS URLs
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const hasValidExtension = validExtensions.some(ext => 
          url.toLowerCase().includes(ext)
        );
        return hasValidExtension;
      }
      
      return false;
    } catch (error) {
      console.error('URL validation error:', error);
      return false;
    }
  };

  // Get the current profile picture URL with proper fallback
  const getCurrentProfilePicture = (): string | undefined => {
    let result = tempImageUri || user?.profilePicture || null;
    
    // Validate the URL before using it
    if (result && !isValidImageUrl(result)) {
      console.warn('Invalid profile picture URL detected:', result);
      result = null; // Fall back to initials
    }
    
    // Add cache-busting parameter to HTTP/HTTPS URLs only (not data URIs)
    if (result && !tempImageUri && user?.profilePicture && isValidImageUrl(result) && 
        (result.startsWith('http://') || result.startsWith('https://'))) {
      const separator = result.includes('?') ? '&' : '?';
      result = `${result}${separator}t=${Date.now()}`;
    }
    return result || undefined; // Convert null to undefined
  };

  // Request permissions with user-friendly error handling
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!cameraPermission.granted || !libraryPermission.granted) {
        Alert.alert(
          "Permissions Required",
          "Camera and photo library access are needed to update your profile picture.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      Alert.alert("Error", "Failed to request permissions. Please try again.");
      return false;
    }
  };

  // Validate and process selected image
  const processSelectedImage = async (imageUri: string): Promise<string | null> => {
    try {
      // Basic validation
      if (!imageUri) {
        throw new Error("No image selected");
      }
      
      // Validate image format
      const fileExtension = imageUri.split('.').pop()?.toLowerCase();
      const supportedFormats = ['jpg', 'jpeg', 'png'];
      
      if (fileExtension && !supportedFormats.includes(fileExtension)) {
        console.warn('Unsupported image format:', fileExtension);
        // Still try to process it, but log the warning
      }

      // You can add image compression here if needed
      // For now, return the original URI
      return imageUri;
    } catch (error) {
      console.error('Image processing failed:', error);
      Alert.alert("Error", "Failed to process the selected image. Please try again.");
      return null;
    }
  };

  // Upload image with progress tracking and error handling
  const uploadProfilePicture = async (imageUri: string): Promise<boolean> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress updates (you can implement real progress if your API supports it)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadResult = await userService.uploadProfilePicture(imageUri);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadResult.success) {
        console.log('Upload successful, updated user data:', uploadResult.data);
        console.log('New profile picture URL:', uploadResult.data?.profilePicture);
        
        // Small delay to ensure server has processed the image
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refresh profile data to get updated server URL
        await dispatch(loadPatientProfile());
        
        // Clear temp image after successful server refresh
        setTempImageUri(null);
        
        Alert.alert(
          "Success",
          "Profile picture updated successfully!",
          [{ text: "OK" }]
        );
        
        return true;
      } else {
        throw new Error(uploadResult.error || "Upload failed");
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      
      // Clear temp image on failure
      setTempImageUri(null);
      
      Alert.alert(
        "Upload Failed",
        error.message || "Failed to update profile picture. Please try again.",
        [{ text: "OK" }]
      );
      
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image selection from camera or library
  const handleImageSelection = async (source: 'camera' | 'library') => {
    try {
      // Request permissions first
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      let result: ImagePicker.ImagePickerResult;
      
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImageUri = result.assets[0].uri;
        
        // Process the selected image
        const processedImageUri = await processSelectedImage(selectedImageUri);
        if (!processedImageUri) return;

        // Set temp image for immediate display
        setTempImageUri(processedImageUri);
        
        // Upload the image
        const uploadSuccess = await uploadProfilePicture(processedImageUri);
        
        if (!uploadSuccess) {
          // If upload failed, clear the temp image
          setTempImageUri(null);
        }
      }
    } catch (error) {
      console.error('Image selection failed:', error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    } finally {
      // Close modals
      setPhotoSheetVisible(false);
      setProfilePictureModalVisible(false);
    }
  };

  // Simplified wrapper functions for backward compatibility
  const takePhoto = async () => {
    await handleImageSelection('camera');
  };

  const choosePhoto = async () => {
    await handleImageSelection('library');
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
          <View style={styles.avatarContainer}>
            <Avatar
              onPress={() => setProfilePictureModalVisible(true)}
              imageUrl={getCurrentProfilePicture()}
              firstName={user?.firstName}
              lastName={user?.lastName}
              size={100}
              containerStyle={{ backgroundColor: brand.primary }}
              textStyle={{ color: "#fff", fontSize: 36 }}
            />
            
            {/* Upload Progress Overlay */}
            {isUploading && (
              <View style={styles.uploadOverlay}>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
                </View>
                <Text style={styles.uploadText}>Uploading... {uploadProgress}%</Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            onPress={() => setPhotoSheetVisible(true)}
            disabled={isUploading}
            style={[styles.editButton, isUploading && styles.editButtonDisabled]}
          >
            <Text style={[styles.editText, { color: isUploading ? themeColors.subText : brand.primary }]}>
              {isUploading ? "Uploading..." : "Edit"}
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
          imageUrl={getCurrentProfilePicture()}
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
  avatarContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  progressContainer: {
    width: 60,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  uploadText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  editButton: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editButtonDisabled: {
    opacity: 0.5,
  },
  editText: {
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
