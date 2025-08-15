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

type Props = {
  visible: boolean;
  title?: string;
  onClose: () => void;
  onTakePhoto: () => void;
  onChoosePhoto: () => void;
};

const PhotoSheet: React.FC<Props> = ({ visible, title = "Edit profile picture", onClose, onTakePhoto, onChoosePhoto }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;
  const isIOS = Platform.OS === "ios";

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      transparent={true}
      onRequestClose={onClose}
    >
      {!isIOS && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      )}
      <View style={[styles.sheet, { backgroundColor: themeColors.card }]}> 
        <View style={styles.handle} />
        <Text style={[styles.title, { color: themeColors.text }]}>{title}</Text>
        <TouchableOpacity style={styles.item} onPress={onTakePhoto}>
          <Ionicons name="camera-outline" size={22} color={themeColors.text} />
          <Text style={[styles.itemText, { color: themeColors.text }]}>Take photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.item} onPress={onChoosePhoto}>
          <Ionicons name="image-outline" size={22} color={themeColors.text} />
          <Text style={[styles.itemText, { color: themeColors.text }]}>Choose photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.item, { justifyContent: "center" }]} onPress={onClose}>
          <Text style={[styles.cancel, { color: brand.primary }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "42%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 20,
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
    marginBottom: 8,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 14,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
  },
  cancel: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default PhotoSheet;
