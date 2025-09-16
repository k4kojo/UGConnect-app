import Loader from "@/components/loader.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import type { LabResult as MedicalLabResult, MedicalRecord as MedicalRecordType, Prescription as MedicalPrescription } from "@/services/medicalRecordsService";
import { useLabResults, useMedicalRecords, usePrescriptions } from "@/hooks/useCache";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function MedicalRecordScreen() {
  const router = useRouter();
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const [refreshing, setRefreshing] = useState(false);

  const {
    data: medicalRecords,
    loading: loadingMedical,
    error: errorMedical,
    refresh: refreshMedical,
  } = useMedicalRecords();

  const {
    data: prescriptions,
    loading: loadingPrescriptions,
    error: errorPrescriptions,
    refresh: refreshPrescriptions,
  } = usePrescriptions();

  const {
    data: labResults,
    loading: loadingLabResults,
    error: errorLabResults,
    refresh: refreshLabResults,
  } = useLabResults();

  const isLoading = loadingMedical || loadingPrescriptions || loadingLabResults;
  const anyError = errorMedical || errorPrescriptions || errorLabResults;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshMedical(),
        refreshPrescriptions(),
        refreshLabResults(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refreshMedical, refreshPrescriptions, refreshLabResults]);

  const medicalItems = useMemo(() => (medicalRecords ?? []) as MedicalRecordType[], [medicalRecords]);
  const prescriptionItems = useMemo(() => (prescriptions ?? []) as MedicalPrescription[], [prescriptions]);
  const labResultItems = useMemo(() => (labResults ?? []) as MedicalLabResult[], [labResults]);

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/tabs/profile")}> 
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>Medical Records</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <Loader fullScreen backgroundColor={themeColors.background} color={Colors.brand.primary} />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={themeColors.text} />}
        >
          {anyError && (
            <View style={[styles.banner, { backgroundColor: themeColors.subCard, borderColor: themeColors.border }]}> 
              <Text style={{ color: themeColors.text }}>Failed to load some data. Pull to refresh.</Text>
            </View>
          )}

          {/* Medical Records Section */}
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Medical Records</Text>
          {medicalItems.length === 0 ? (
            <Text style={{ color: themeColors.subText, marginBottom: 16 }}>No medical records available.</Text>
          ) : (
            <View style={styles.cardList}>
              {medicalItems.map((rec) => (
                <View key={`med-${rec.id}`} style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}> 
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>{rec.diagnosis}</Text>
                    <Text style={{ color: themeColors.subText }}>{formatDate(rec.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Prescriptions Section */}
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Prescriptions</Text>
          {prescriptionItems.length === 0 ? (
            <Text style={{ color: themeColors.subText, marginBottom: 16 }}>No prescriptions available.</Text>
          ) : (
            <View style={styles.cardList}>
              {prescriptionItems.map((p) => (
                <View key={`presc-${p.id}`} style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}> 
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>{p.medication}</Text>
                    <Text style={{ color: themeColors.subText }}>{formatDate(p.createdAt)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Lab Results Section */}
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Lab Results</Text>
          {labResultItems.length === 0 ? (
            <Text style={{ color: themeColors.subText, marginBottom: 16 }}>No lab results available.</Text>
          ) : (
            <View style={styles.cardList}>
              {labResultItems.map((l) => (
                <View key={`lab-${l.id}`} style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}> 
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: themeColors.text }]}>{l.testName}</Text>
                    <Text style={{ color: themeColors.subText }}>{formatDate(l.resultDate)}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 12,
  },
  banner: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  cardList: {
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
});
