import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PhotoSheetProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
}

const PhotoSheet: React.FC<PhotoSheetProps> = ({ 
  visible, 
  title = "Edit profile picture", 
  onClose, 
  onTakePhoto, 
  onChoosePhoto 
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;
  const isIOS = Platform.OS === "ios";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose} 
      />
      
      <View style={styles.sheetContainer}>
        <View style={[styles.sheet, { backgroundColor: themeColors.card }]}> 
          <View style={styles.handle} />
          <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
          
          <TouchableOpacity style={styles.item} onPress={onTakePhoto}>
            <Ionicons name="camera-outline" size={22} color={themeColors.text} />
            <Text style={[styles.itemText, { color: themeColors.text }]}>
              Take photo
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.item} onPress={onChoosePhoto}>
            <Ionicons name="image-outline" size={22} color={themeColors.text} />
            <Text style={[styles.itemText, { color: themeColors.text }]}>
              Choose from library
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.item, styles.cancelItem]} 
            onPress={onClose}
          >
            <Text style={[styles.cancelText, { color: brand.primary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  sheetContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
    // Let the content determine the height instead of fixed height
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#999",
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
  },
  cancelItem: {
    justifyContent: "center",
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default PhotoSheet;