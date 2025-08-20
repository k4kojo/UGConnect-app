import LanguageSheet from "@/components/modals/languageSheet";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { useHandleLogout } from "@/hooks/useHandleLogout";
import { deleteAccount as deleteAccountApi } from "@/services/authService";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const { loggingOut, handleLogout } = useHandleLogout();

  const { theme, toggleTheme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;
  const { language, setLanguage, t } = useLanguage();
  const [langModal, setLangModal] = useState(false);

  const rateApp = () => {
    const url = Platform.select({
      ios: "itms-apps://itunes.apple.com/app/id000000000?action=write-review",
      android: "market://details?id=com.yourapp.bundle",
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const openUrl = (url: string) => Linking.openURL(url).catch(() => {});

  const deleteAccount = () =>
    Alert.alert("Delete Account", "This cannot be undone. Continue?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          try {
            const res = await deleteAccountApi();
            if (!res.success) {
              Alert.alert("Delete failed", res.error || "Could not delete account");
              return;
            }
            router.replace("/(auth)/sign-in");
          } catch (e: any) {
            Alert.alert("Delete failed", e?.message || "Could not delete account");
          }
        } },
    ]);

  const Item = ({
    label,
    onPress,
    rightIcon,
  }: {
    label: string;
    onPress?: () => void;
    rightIcon?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderColor: themeColors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.rowLabel, { color: themeColors.text }]}>
        {label}
      </Text>
      {rightIcon ?? (
        <Ionicons
          name="chevron-forward"
          size={16}
          color={themeColors.subText}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t("settings.title")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* General */}
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>{t("settings.general")}</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={[styles.row, { borderColor: themeColors.border }]}>
          <Text style={[styles.rowLabel, { color: themeColors.text }]}>{t("settings.notifications")}</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: themeColors.border, true: brand.primary }}
            thumbColor={"#fff"}
          />
        </View>

        <Item label="Contact Us" onPress={() => router.push("../contact")} />
      </View>

      {/* Preferences */}
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>{t("settings.preferences")}</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <View style={[styles.row, { borderColor: themeColors.border }]}>
          <Text style={[styles.rowLabel, { color: themeColors.text }]}>{t("settings.darkMode")}</Text>
          <Switch
            value={theme === "dark"}
            onValueChange={toggleTheme}
            trackColor={{ false: themeColors.border, true: brand.primary }}
            thumbColor={"#fff"}
          />
        </View>
        <View style={[styles.row, { borderColor: themeColors.border }]}>
          <Text style={[styles.rowLabel, { color: themeColors.text }]}>{t("settings.analytics")}</Text>
          <Switch
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
            trackColor={{ false: themeColors.border, true: brand.primary }}
            thumbColor={"#fff"}
          />
        </View>
        <View style={[styles.row, { borderColor: themeColors.border }]}>
          <Text style={[styles.rowLabel, { color: themeColors.text }]}>{t("settings.marketingEmails")}</Text>
          <Switch
            value={marketingEmails}
            onValueChange={setMarketingEmails}
            trackColor={{ false: themeColors.border, true: brand.primary }}
            thumbColor={"#fff"}
          />
        </View>
        <Item label={`${t("settings.language")} (${language.toUpperCase()})`} onPress={() => setLangModal(true)} />
      </View>

      {/* App */}
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>{t("settings.app")}</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Item label={t("settings.rateApp")} onPress={rateApp} />
        <Item label={t("settings.licenses")} onPress={() => openUrl("https://your.app/licenses")} />
        <Item label={t("settings.terms")} onPress={() => router.push("../legal/terms")} />
      </View>

      {/* About */}
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>{t("settings.about")}</Text>

      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Item label={t("settings.privacy")} onPress={() => router.push("../legal/privacy")} />
        <Item label={t("settings.aboutUs")} onPress={() => router.push("../about")} />
        <Item label={t("settings.faq")} onPress={() => router.push("../help/faq")} />
        <Item label={t("settings.legal")} onPress={() => router.push("../legal")} />
      </View>

      {/* Account */}
      <Text style={[styles.sectionTitle, { color: themeColors.subText }]}>{t("settings.account")}</Text>
      <View
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
        ]}
      >
        <Item label={t("settings.changePassword")} onPress={() => router.push("/accountRecovery")} />
        <Item
          label={t("settings.deleteAccount")}
          onPress={deleteAccount}
          rightIcon={<Ionicons name="trash-outline" size={16} color={themeColors.error} />}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logout}
        disabled={loggingOut}
      >
        <Text style={[styles.logoutText, loggingOut && { opacity: 0.5 }, { color: themeColors.error }]}>
          {loggingOut ? t("settings.loggingOut") : t("settings.logout")}
        </Text>
      </TouchableOpacity>
      <LanguageSheet
        visible={langModal}
        selected={language}
        onClose={() => setLangModal(false)}
        onSelect={async (code) => {
          await setLanguage(code as any);
          setLangModal(false);
        }}
      />
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontSize: 15,
  },
  logout: {
    paddingVertical: 20,
    marginTop: 30,
    alignItems: "center",
  },
  logoutText: {
    fontWeight: "600",
    fontSize: 15,
  },
});
