import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

import { router } from "expo-router";

import Button from "@/components/button.component";
import FeatureCard from "@/components/feature-card.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";

const calender = require("@/assets/images/calendar.png");
const video = require("@/assets/images/video.png");
const prescription = require("@/assets/images/medical.png");
const shield = require("@/assets/images/shield.png");

export default function Index() {

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: themeColors.background },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t("authIndex.welcomeTitle")}
          </Text>
          <Text
            style={[styles.sectionDescription, { color: themeColors.subText }]}
          >
            {t("authIndex.welcomeDescription")}
          </Text>
        </View>

        <View style={styles.grid}>
          <FeatureCard
            title={t("authIndex.features.video.title")}
            description={t("authIndex.features.video.description")}
            icon={video}
          />
          <FeatureCard
            title={t("authIndex.features.booking.title")}
            description={t("authIndex.features.booking.description")}
            icon={calender}
          />
          <FeatureCard
            title={t("authIndex.features.prescriptions.title")}
            description={t("authIndex.features.prescriptions.description")}
            icon={prescription}
          />
          <FeatureCard
            title={t("authIndex.features.records.title")}
            description={t("authIndex.features.records.description")}
            icon={shield}
          />
        </View>

        <View style={[styles.whyBox, { backgroundColor: themeColors.subCard }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t("authIndex.whyChoose")}
          </Text>

          <View style={styles.bullet}>
            <Image
              source={require("@/assets/images/clock.png")}
              style={styles.bulletIcon}
            />
            <View>
              <Text style={[styles.bulletTitle, { color: themeColors.text }]}>
                {t("authIndex.bullets.saveTimeTitle")}
              </Text>
              <Text
                style={[styles.bulletSubtitle, { color: themeColors.subText }]}
              >
                {t("authIndex.bullets.saveTimeDesc")}
              </Text>
            </View>
          </View>

          <View style={styles.bullet}>
            <Text style={styles.bulletIcon}>🧑‍⚕️</Text>
            <View>
              <Text style={[styles.bulletTitle, { color: themeColors.text }]}>
                {t("authIndex.bullets.qualityCareTitle")}
              </Text>
              <Text
                style={[styles.bulletSubtitle, { color: themeColors.subText }]}
              >
                {t("authIndex.bullets.qualityCareDesc")}
              </Text>
            </View>
          </View>

          <View style={styles.bullet}>
            <Text style={styles.bulletIcon}>🔐</Text>
            <View>
              <Text style={[styles.bulletTitle, { color: themeColors.text }]}>
                {t("authIndex.bullets.privacyFirstTitle")}
              </Text>
              <Text
                style={[styles.bulletSubtitle, { color: themeColors.subText }]}
              >
                {t("authIndex.bullets.privacyFirstDesc")}
              </Text>
            </View>
          </View>
        </View>

        <Button title={t("authIndex.getStarted")} onPress={() => router.push("/sign-up")} />

        <Text style={[styles.footer, { color: themeColors.text }]}>
          {t("authIndex.alreadyHaveAccount")} {" "}
          <Text
            onPress={() => {
              router.push("/(auth)/sign-in");
            }}
            style={styles.link}
          >
            {t("auth.signIn")}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  content: {
    width: "90%",
    paddingBottom: 30,
  },
  welcomeSection: {
    marginBottom: 20,
    alignItems: "center",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 5,
    textAlign: "center",
  },
  sectionDescription: {
    textAlign: "center",
    color: "#555",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  whyBox: {
    padding: 15,
    borderRadius: 8,
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bulletIcon: {
    width: 30,
    height: 30,
    fontSize: 20,
    marginRight: 10,
    marginTop: 2,
  },
  bulletTitle: {
    fontWeight: "bold",
    fontSize: 14,
  },
  bulletSubtitle: {
    fontSize: 12,
    color: "#555",
  },
  footer: {
    fontSize: 15,
    //color: "#999",
    textAlign: "center",
  },
  link: {
    color: Colors.brand.primary,
    //fontWeight: "bold",
  },
});
