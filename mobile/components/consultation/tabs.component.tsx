import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";

type Tab = {
  label: string;
  count?: number; // count is optional
};

type TabsProps = {
  TABS: Tab[];
  tab: number;
  setTab: (index: number) => void;
};

const Tabs = ({ TABS, tab, setTab }: TabsProps) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  return (
    <View
      style={{
        width: "100%",
        borderBottomWidth: 1,
        borderBottomColor: themeColors.border,
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map((t, i) => (
          <TouchableOpacity
            key={t.label}
            style={[
              styles.tabBtn,
              tab === i && { backgroundColor: Colors.brand.primary },
            ]}
            onPress={() => setTab(i)}
          >
            <Text
              style={[
                [styles.tabBtnText, { color: themeColors.subText }],
                tab === i && { color: "#fff" },
              ]}
            >
              {t.label}
              {t.count ? (
                <Text style={styles.tabCount}> ({t.count})</Text>
              ) : null}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    height: "100%",
  },
  tabBtn: {
    alignSelf: "flex-start",
    borderRadius: 7,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 6,
  },
  tabBtnText: {
    color: "#fff",
    fontWeight: "500",
    fontSize: 16,
  },
  tabCount: {
    fontSize: 13,
    paddingHorizontal: 8,
    borderRadius: 999,
    marginLeft: 6,
  },
});
