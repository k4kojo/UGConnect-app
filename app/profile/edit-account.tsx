import Button from "@/components/button.component";
import DatePickerField from "@/components/inputs/datePickerField.component";
import PhoneInputField from "@/components/inputs/phoneInputField.component";
import TextInputField from "@/components/inputs/textInputField.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { loadPatientProfile, savePatientProfile } from "@/redux/profileSlice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import PhoneInput from "react-native-phone-number-input";

export default function EditAccountScreen() {
  const router = useRouter();
  const phoneInputRef = useRef<PhoneInput>(null);
  const dispatch = useAppDispatch();
  const { user, profile, isLoading } = useAppSelector((s) => s.profile);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [errors, setErrors] = useState({
    dateOfBirth: "",
  });

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  const [form, setForm] = useState({
    nationalId: "",
    username: "",
    firstName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    city: "",
    province: "",
    address: "",
  });

  useEffect(() => {
    dispatch(loadPatientProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        nationalId: profile.nationalId ?? "",
        username: profile.username ?? "",
        firstName: user?.firstName ?? "",
        lastName: user?.lastName ?? "",
        gender: profile.gender ?? "",
        dateOfBirth: profile.dateOfBirth ?? "",
        phoneNumber: user?.phoneNumber ?? "",
        email: user?.email ?? "",
        city: profile.city ?? "",
        province: profile.province ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await dispatch(savePatientProfile({
        nationalId: form.nationalId || null,
        username: form.username || null,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        phoneNumber: form.phoneNumber || null,
        email: form.email || null,
        city: form.city || null,
        province: form.province || null,
        address: form.address || null,
      })).unwrap();
      Alert.alert("Success", "Profile updated", [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Error", e?.response?.data?.error || e?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDatePicker = () => setShowDatePicker(!showDatePicker);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setDate(currentDate);
    setDateOfBirth(currentDate.toISOString().split("T")[0]);
  };

  const confirmDate = () => {
    setShowDatePicker(false);
  };

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
          Edit Account
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Personal Information
        </Text>

        <TextInputField
          label="National ID"
          value={form.nationalId}
          onChangeText={(text) => setForm({ ...form, nationalId: text })}
          placeholder="Enter national ID"
        />

        <TextInputField
          label="Username"
          value={form.username}
          onChangeText={(text) => setForm({ ...form, username: text })}
          placeholder="Enter username"
        />

        <TextInputField
          label="First Name"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
          placeholder="Enter first name"
        />

        <TextInputField
          label="Last Name"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
          placeholder="Enter last name"
        />

        <TextInputField
          label="Gender"
          value={form.gender}
          onChangeText={(text) => setForm({ ...form, gender: text })}
          placeholder="Enter gender"
        />

<DatePickerField
        show={showDatePicker}
        date={date}
        placeholder="Date of Birth"
        onToggle={toggleDatePicker}
        onChange={handleDateChange}
        onConfirm={confirmDate}
        displayDate={dateOfBirth}
        error={errors.dateOfBirth}
        minimumDate={new Date(1900, 0, 1)}
        maximumDate={new Date()}
      />

        <PhoneInputField
          label="Phone Number"
          phoneInputRef={phoneInputRef}
          value={form.phoneNumber}
          setValue={(text: any) => setForm({ ...form, phoneNumber: text })}
          defaultCode="GH"
        />

        <TextInputField
          label="Email"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          placeholder="Enter email"
        />

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Address Information
        </Text>

        <TextInputField
          label="City"
          value={form.city}
          onChangeText={(text) => setForm({ ...form, city: text })}
          placeholder="Enter city"
        />

        <TextInputField
          label="Province"
          value={form.province}
          onChangeText={(text) => setForm({ ...form, province: text })}
          placeholder="Enter province"
        />

        <TextInputField
          label="Address"
          value={form.address}
          onChangeText={(text) => setForm({ ...form, address: text })}
          placeholder="Enter full address"
        />

        <View style={styles.buttonContainer}>
          <Button
            title={isSaving ? "Saving..." : "Save Changes"}
            onPress={handleSubmit}
            disabled={isSaving}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 30,
  },
});
