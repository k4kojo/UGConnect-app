import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import React from "react";
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  selected: string;
  onClose: () => void;
  onSelect: (lang: string) => void;
};

const LanguageSheet: React.FC<Props> = ({ visible, selected, onClose, onSelect }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const isIOS = Platform.OS === "ios";

  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle={isIOS ? "pageSheet" : "overFullScreen"}
      transparent={!isIOS}
      onRequestClose={onClose}
    >
      {!isIOS && (
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      )}
      <View style={[styles.container, { backgroundColor: themeColors.background }]}> 
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}> 
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.headerBtn, { color: themeColors.text }]}>Close</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Language</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.list}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.item, { borderBottomColor: themeColors.border }]}
              onPress={() => onSelect(lang.code)}
            >
              <Text style={[styles.itemText, { color: themeColors.text }]}>{lang.label}</Text>
              {selected === lang.code ? (
                <Text style={{ color: Colors.brand.primary, fontWeight: "600" }}>✓</Text>
              ) : (
                <View style={{ width: 16 }} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerBtn: {
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    fontSize: 16,
  },
});

export default LanguageSheet;


