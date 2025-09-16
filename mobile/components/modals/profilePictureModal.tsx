import React, { useState } from "react";
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import Avatar from "@/components/avatar.component";
import PhotoSheet from "./photoSheet";

const { width, height } = Dimensions.get("window");

interface ProfilePictureModalProps {
  visible: boolean;
  onClose: () => void;
  onEditPress: () => void;
  imageUrl?: string;
  firstName?: string;
  lastName?: string;
}

export default function ProfilePictureModal({
  visible,
  onClose,
  onEditPress,
  imageUrl,
  firstName,
  lastName,
}: ProfilePictureModalProps) {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);

  const handleEditPress = () => {
    setShowPhotoSheet(true);
  };

  const handlePhotoSheetClose = () => {
    setShowPhotoSheet(false);
  };

  const handleTakePhoto = () => {
    setShowPhotoSheet(false);
    onEditPress();
  };

  const handleChoosePhoto = () => {
    setShowPhotoSheet(false);
    onEditPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          {/* Profile Picture Display */}
          <View style={styles.imageWrapper}>
            <TouchableOpacity 
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.profileImage} />
              ) : (
                <Avatar
                  firstName={firstName}
                  lastName={lastName}
                  size={200}
                  textStyle={{ fontSize: 60, color: "#fff" }}
                  containerStyle={{ backgroundColor: brand.primary }}
                />
              )}
              
              {/* Edit Overlay - Now properly contained */}
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Photo Selection Sheet */}
        <PhotoSheet
          visible={showPhotoSheet}
          onClose={handlePhotoSheetClose}
          onTakePhoto={handleTakePhoto}
          onChoosePhoto={handleChoosePhoto}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: 200,
    height: 200,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#f0f0f0",
  },
  editOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    height: 40,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
});