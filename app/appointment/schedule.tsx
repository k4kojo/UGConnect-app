import Loader from "@/components/loader.component";
import StepHeader from "@/components/step-header-component";
import Colors from "@/constants/colors";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { fetchDoctors } from "@/redux/doctorsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";

type DoctorItem = {
  id: number;
  doctorId: string | null;
  specialization: string;
  licenseNumber: string;
  bio?: string | null;
  reviews: number;
  rating: number;
  experienceYears?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

const ScheduleAppointment = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useAppDispatch();
  const { items: doctors, isLoading } = useAppSelector((s) => s.doctors);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const filteredDoctors = useMemo(() => doctors.filter((doc) => {
    const name = `${doc.firstName ?? ""} ${doc.lastName ?? ""}`.trim();
    const specialty = doc.specialization ?? "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);
  }), [doctors, searchQuery]);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await dispatch(fetchDoctors());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/tabs/appointment")}>
          <Ionicons name="chevron-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>
          {t("schedule.bookAppointment")}
        </Text>
      </View>

      {/* Step Header */}
      <StepHeader step={1} />

      <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
        {t("schedule.chooseDoctor")}
      </Text>

      {/* Search + Filter */}
      <View style={styles.searchRow}>
        <TextInput
          placeholder={t("schedule.searchPlaceholder")}
          style={[
            styles.searchInput,
            { color: themeColors.text, borderColor: themeColors.border },
          ]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => {
            // Optional: Toggle specialty filter dropdown here
          }}
        >
          <Ionicons name="filter-outline" size={20} color={themeColors.text} />
        </TouchableOpacity>
      </View>

      {/* Doctor List */}
      {isLoading ? (
        <Loader 
          fullScreen 
          backgroundColor={themeColors.background}
          color={Colors.brand.primary}
        />
      ) : filteredDoctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.subText }]}>
            {searchQuery ? t("schedule.emptySearch") : t("schedule.emptyAll")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.text}
            />
          }
          renderItem={({ item }) => (
            <View
              style={[styles.doctorCard, { backgroundColor: themeColors.card }]}
            >
              <View style={styles.doctorCardLeft}>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                      style={[
                        styles.avatarPlaceholder,
                        { backgroundColor: themeColors.avatar },
                      ]}
                    />
                    <View>
                      <Text style={[styles.doctorName, { color: themeColors.text }]}>
                        {(item.firstName || item.lastName)
                          ? `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim()
                          : "Doctor"}
                      </Text>
                      <Text
                        style={[styles.subText, { color: themeColors.subText }]}
                      >
                        {item.specialization}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Ionicons name="star" color="orange" size={14} />
                        <Text
                          style={[
                            styles.ratingText,
                            { color: themeColors.subText },
                          ]}
                        >
                          {item.rating} ({item.reviews} reviews)
                        </Text>
                      </View>
                      <View style={{ flexDirection: "row", gap: 2 }}>
                        <Ionicons
                          name="location-outline"
                          size={14}
                          color={themeColors.text}
                        />
                         {item.email ? (
                           <Text style={[styles.subText, { color: themeColors.subText }]}> 
                             {item.email}
                           </Text>
                         ) : null}
                      </View>
                    </View>
                  </View>
                  <View style={styles.consultationTypes}>
                    <Text
                      style={[
                        styles.consultationType,
                        { color: themeColors.text },
                      ]}
                    >
                      Video
                    </Text>
                    <Text
                      style={[
                        styles.consultationType,
                        { color: themeColors.text },
                      ]}
                    >
                      In-Person
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.priceColumn}>
                <Text style={[styles.priceText, { color: "green" }]}>
                  ₵{(item.experienceYears ? Number(item.experienceYears) : 100) * 1}
                </Text>
                <Text style={[styles.subText, { color: themeColors.subText }]}>
                  {t("schedule.consultationFee")}
                </Text>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => {
                    router.push({
                      pathname: "/appointment/select-time",
                      params: {
                        doctorId: item.doctorId ?? "",
                        name: `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim(),
                        specialty: item.specialization,
                        fee: ((item.experienceYears ? Number(item.experienceYears) : 100) * 1).toString(),
                        rating: (item.rating ?? 0).toString(),
                        reviews: (item.reviews ?? 0).toString(),
                      },
                    });
                  }}
                >
                  <Text style={styles.selectBtnText}>{t("schedule.selectDoctor")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  doctorCard: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  doctorCardLeft: {
    flexDirection: "row",
    gap: 12,
    flex: 1,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  subText: {
    fontSize: 13,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    marginLeft: 6,
  },
  consultationTypes: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  consultationType: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
    fontSize: 12,
    color: "#333",
  },
  priceColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "green",
  },
  selectBtn: {
    backgroundColor: Colors.brand.primary,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  selectBtnText: {
    color: "#fff",
    fontSize: 13,
  },
});

export default ScheduleAppointment;
