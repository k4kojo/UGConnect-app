import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../constants/colors";
import { useThemeContext } from "../context/ThemeContext";

const SettingItem = ({
  icon,
  label,
  caption,
  onPress,
  color,
}: {
  icon: any;
  label: string;
  caption?: string;
  onPress?: () => void;
  color?: string;
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.settingItem,
        { backgroundColor: themeColors.card, borderColor: themeColors.border },
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.itemLabel, { color: themeColors.text }]}>
          {label}
        </Text>
        {!!caption && (
          <Text style={[styles.itemCaption, { color: themeColors.subText }]}>
            {caption}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    marginVertical: 8,
    borderRadius: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  itemCaption: {
    fontSize: 12,
    color: "#888",
  },
});

export default SettingItem;
