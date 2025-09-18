import Loader from "@/components/loader.component";
import EmptyState from "@/components/EmptyState";
import LabResultModal from "@/components/modals/labResultModal";
import PrescriptionModal from "@/components/modals/prescriptionsModal";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import type { MedicalRecord, LabResult as MedicalLabResult, Prescription as MedicalPrescription } from "@/services/medicalRecordsService";
import { useLabResults, useMedicalRecords, usePrescriptions } from "@/hooks/useCache";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

type RecordItem = {
  id: string;
  title: string;
  date?: string;
  type: "lab" | "prescription" | "medical" | "header";
  data?: MedicalRecord | MedicalPrescription | MedicalLabResult;
};

const RecordCard = ({
  item,
  onPress,
}: {
  item: RecordItem;
  onPress: () => void;
}) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  const getIcon = () => {
    switch (item.type) {
      case "prescription":
        return "medkit";
      case "lab":
        return "flask-outline";
      case "medical":
        return "document-text-outline";
      default:
        return "document-outline";
    }
  };

  const icon = (
    <Ionicons
      name={getIcon() as any}
      size={24}
      color={brand.primary}
    />
  );

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.cardLeft}>
        {icon}
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.recordTitle, { color: themeColors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.recordDate, { color: themeColors.subText }]}>
            {item.date}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.actionButton,
          { backgroundColor: themeColors.background },
        ]}
        onPress={onPress}
      >
        <Text style={[styles.actionText, { color: brand.primary }]}>
          {item.type === "prescription" ? "Download" : "View"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const Records = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecordItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  // Cached queries
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

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper function to convert API data to RecordItem format
  const convertToRecordItems = (medicalRecords: MedicalRecord[], prescriptions: MedicalPrescription[], labResults: MedicalLabResult[]): RecordItem[] => {
    const items: RecordItem[] = [];

    // Add medical records
    if (medicalRecords.length > 0) {
      items.push({ id: "medical-header", title: "Medical Records", type: "header" });
      medicalRecords.forEach((record) => {
        items.push({
          id: `medical-${record.id}`,
          title: record.diagnosis,
          date: formatDate(record.createdAt),
          type: "medical",
          data: record
        });
      });
    }

    // Add prescriptions
    if (prescriptions.length > 0) {
      items.push({ id: "prescription-header", title: "Prescriptions", type: "header" });
      prescriptions.forEach((prescription) => {
        items.push({
          id: `prescription-${prescription.id}`,
          title: prescription.medication,
          date: formatDate(prescription.createdAt),
          type: "prescription",
          data: prescription
        });
      });
    }

    // Add lab results
    if (labResults.length > 0) {
      items.push({ id: "lab-header", title: "Lab Results", type: "header" });
      labResults.forEach((labResult) => {
        items.push({
          id: `lab-${labResult.id}`,
          title: labResult.testName,
          date: formatDate(labResult.resultDate),
          type: "lab",
          data: labResult
        });
      });
    }

    return items;
  };

  // Combined loading and error states
  const isLoading = loadingMedical || loadingPrescriptions || loadingLabResults;

  useEffect(() => {
    if (errorMedical || errorPrescriptions || errorLabResults) {
      console.error('Error loading records:', errorMedical || errorPrescriptions || errorLabResults);
      Alert.alert('Error', 'Failed to load medical records. Please try again.');
    }
  }, [errorMedical, errorPrescriptions, errorLabResults]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        refreshMedical(),
        refreshPrescriptions(),
        refreshLabResults(),
      ]);
    } catch (err: any) {
      console.error('Error refreshing records:', err);
      Alert.alert('Error', 'Failed to refresh records');
    } finally {
      setRefreshing(false);
    }
  }, [refreshMedical, refreshPrescriptions, refreshLabResults]);

  const recordItems = useMemo(() => {
    const meds = medicalRecords ?? [];
    const prescs = prescriptions ?? [];
    const labs = labResults ?? [];
    return convertToRecordItems(meds, prescs, labs);
  }, [medicalRecords, prescriptions, labResults]);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return recordItems;
    const query = searchQuery.toLowerCase();
    return recordItems.filter(
      (item) =>
        (item.title && item.title.toLowerCase().includes(query)) ||
        (item.date && item.date.toLowerCase().includes(query))
    );
  }, [recordItems, searchQuery]);

  const handleItemPress = (item: RecordItem) => {
    if (item.type === "header") return;
    setSelectedItem(item);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedItem(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopHeader screen="records" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: themeColors.card, borderColor: themeColors.border },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={themeColors.subText}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Search records..."
            placeholderTextColor={themeColors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Records List */}
      {isLoading ? (
        <Loader 
          fullScreen 
          backgroundColor={themeColors.background}
          color={Colors.brand.primary}
        />
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title={searchQuery ? "No records found matching your search" : "No medical records available"}
        />
      ) : (
        <FlatList
          data={filteredRecords}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecordCard item={item} onPress={() => handleItemPress(item)} />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.text}
            />
          }
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: themeColors.card }]}>
            {selectedItem?.type === "lab" ? (
              <LabResultModal
                visible={modalVisible}
                onClose={closeModal}
                result={selectedItem.data as MedicalLabResult}
              />
            ) : selectedItem?.type === "prescription" ? (
              <PrescriptionModal
                visible={modalVisible}
                onClose={closeModal}
                prescription={selectedItem.data as MedicalPrescription}
              />
            ) : selectedItem?.type === "medical" ? (
              <View style={styles.medicalRecordModal}>
                <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                  Medical Record
                </Text>
                <Text style={[styles.modalText, { color: themeColors.text }]}>
                  <Text style={styles.bold}>Diagnosis:</Text> {(selectedItem.data as MedicalRecord)?.diagnosis}
                </Text>
                <Text style={[styles.modalText, { color: themeColors.text }]}>
                  <Text style={styles.bold}>Treatment:</Text> {(selectedItem.data as MedicalRecord)?.treatment}
                </Text>
                {(selectedItem.data as MedicalRecord)?.notes && (
                  <Text style={[styles.modalText, { color: themeColors.text }]}>
                    <Text style={styles.bold}>Notes:</Text> {(selectedItem.data as MedicalRecord)?.notes}
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: Colors.brand.primary }]}
                  onPress={closeModal}
                >
                  <Text style={[styles.closeButtonText, { color: 'white' }]}>Close</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordDate: {
    fontSize: 14,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.brand.primary,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
  },
  medicalRecordModal: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  bold: {
    fontWeight: "bold",
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Records;
