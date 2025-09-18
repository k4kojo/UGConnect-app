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
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

  const getIconColor = () => {
    switch (item.type) {
      case "prescription":
        return "#4CAF50";
      case "lab":
        return "#FF9800";
      case "medical":
        return "#2196F3";
      default:
        return brand.primary;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case "prescription":
        return "Prescription";
      case "lab":
        return "Lab Result";
      case "medical":
        return "Medical Record";
      default:
        return "Record";
    }
  };

  if (item.type === "header") {
    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          {item.title}
        </Text>
        <View style={[styles.sectionDivider, { backgroundColor: themeColors.border }]} />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconContainer, { backgroundColor: getIconColor() + '15' }]}>
            <Ionicons
              name={getIcon() as any}
              size={24}
              color={getIconColor()}
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.recordTitle, { color: themeColors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.recordType, { color: getIconColor() }]}>
              {getTypeLabel()}
            </Text>
            <Text style={[styles.recordDate, { color: themeColors.subText }]}>
              {item.date}
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={themeColors.subText}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Records = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RecordItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'medical' | 'prescription' | 'lab'>('all');

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
    let filtered = recordItems;
    
    // Apply type filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(item => 
        item.type === activeFilter || item.type === 'header'
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.type === 'header' || // Always show headers
          (item.title && item.title.toLowerCase().includes(query)) ||
          (item.date && item.date.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [recordItems, searchQuery, activeFilter]);

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

      {/* Stats Cards */}
      {!isLoading && (
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[
              styles.statCard, 
              { 
                backgroundColor: activeFilter === 'medical' ? '#2196F315' : themeColors.card, 
                borderColor: activeFilter === 'medical' ? '#2196F3' : themeColors.border 
              }
            ]}
            onPress={() => setActiveFilter(activeFilter === 'medical' ? 'all' : 'medical')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#2196F315' }]}>
              <Ionicons name="document-text" size={20} color="#2196F3" />
            </View>
            <Text style={[styles.statNumber, { color: themeColors.text }]}>
              {medicalRecords?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>Medical</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statCard, 
              { 
                backgroundColor: activeFilter === 'prescription' ? '#4CAF5015' : themeColors.card, 
                borderColor: activeFilter === 'prescription' ? '#4CAF50' : themeColors.border 
              }
            ]}
            onPress={() => setActiveFilter(activeFilter === 'prescription' ? 'all' : 'prescription')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#4CAF5015' }]}>
              <Ionicons name="medkit" size={20} color="#4CAF50" />
            </View>
            <Text style={[styles.statNumber, { color: themeColors.text }]}>
              {prescriptions?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>Prescriptions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.statCard, 
              { 
                backgroundColor: activeFilter === 'lab' ? '#FF980015' : themeColors.card, 
                borderColor: activeFilter === 'lab' ? '#FF9800' : themeColors.border 
              }
            ]}
            onPress={() => setActiveFilter(activeFilter === 'lab' ? 'all' : 'lab')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FF980015' }]}>
              <Ionicons name="flask" size={20} color="#FF9800" />
            </View>
            <Text style={[styles.statNumber, { color: themeColors.text }]}>
              {labResults?.length || 0}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>Lab Results</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Indicator */}
      {activeFilter !== 'all' && (
        <View style={styles.filterIndicator}>
          <Text style={[styles.filterText, { color: themeColors.subText }]}>
            Showing: {activeFilter === 'medical' ? 'Medical Records' : activeFilter === 'prescription' ? 'Prescriptions' : 'Lab Results'}
          </Text>
          <TouchableOpacity onPress={() => setActiveFilter('all')} style={styles.clearFilter}>
            <Text style={[styles.clearFilterText, { color: Colors.brand.primary }]}>Show All</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {/* Modals */}
      {selectedItem?.type === "lab" && (
        <LabResultModal
          visible={modalVisible}
          onClose={closeModal}
          result={selectedItem.data as MedicalLabResult}
        />
      )}
      
      {selectedItem?.type === "prescription" && (
        <PrescriptionModal
          visible={modalVisible}
          onClose={closeModal}
          prescription={selectedItem.data as MedicalPrescription}
        />
      )}
      
      {selectedItem?.type === "medical" && (
        <Modal visible={modalVisible} transparent animationType="slide" presentationStyle="fullScreen">
          <View style={styles.modalOverlay}>
              <View style={[styles.medicalRecordModal, { backgroundColor: themeColors.background }]}>
                <View style={[styles.modalHeader, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
                  <View style={styles.modalHeaderContent}>
                    <View style={styles.modalHeaderLeft}>
                      <View style={[styles.modalIconContainer, { backgroundColor: '#2196F315' }]}>
                        <Ionicons name="document-text" size={24} color="#2196F3" />
                      </View>
                      <View style={styles.modalHeaderText}>
                        <Text style={[styles.modalTitle, { color: themeColors.text }]}>
                          Medical Record
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: themeColors.subText }]}>
                          {(selectedItem.data as MedicalRecord)?.diagnosis || 'Medical Consultation'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={[styles.modalCloseButton, { backgroundColor: themeColors.background }]} 
                      onPress={closeModal}
                    >
                      <Ionicons name="close" size={24} color={themeColors.text} />
                    </TouchableOpacity>
                  </View>
                </View>

                <SafeAreaView style={{ flex: 1 }}>
                  <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Medical Information Card */}
                  <View style={[styles.modalInfoCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                    <View style={styles.modalCardHeader}>
                      <Text style={[styles.modalCardTitle, { color: themeColors.text }]}>
                        Consultation Details
                      </Text>
                      <View style={[styles.modalStatusBadge, { backgroundColor: '#2196F315' }]}>
                        <Text style={[styles.modalStatusText, { color: '#2196F3' }]}>COMPLETED</Text>
                      </View>
                    </View>
                    
                    <View style={styles.modalInfoGrid}>
                      <View style={styles.modalInfoItem}>
                        <Text style={[styles.modalLabel, { color: themeColors.subText }]}>Diagnosis</Text>
                        <Text style={[styles.modalValue, { color: themeColors.text }]}>
                          {(selectedItem.data as MedicalRecord)?.diagnosis || 'General Consultation'}
                        </Text>
                      </View>
                      
                      <View style={styles.modalInfoItem}>
                        <Text style={[styles.modalLabel, { color: themeColors.subText }]}>Treatment</Text>
                        <Text style={[styles.modalValue, { color: themeColors.text }]}>
                          {(selectedItem.data as MedicalRecord)?.treatment || 'Follow-up recommended'}
                        </Text>
                      </View>
                      
                      <View style={styles.modalInfoItem}>
                        <Text style={[styles.modalLabel, { color: themeColors.subText }]}>Date</Text>
                        <Text style={[styles.modalValue, { color: themeColors.text }]}>
                          {(selectedItem.data as MedicalRecord)?.createdAt ? 
                            new Date((selectedItem.data as MedicalRecord).createdAt).toLocaleDateString() : 
                            selectedItem.date
                          }
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Notes Section */}
                  {(selectedItem.data as MedicalRecord)?.notes && (
                    <View style={[styles.modalNotesCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
                      <Text style={[styles.modalCardTitle, { color: themeColors.text }]}>
                        Additional Notes
                      </Text>
                      <View style={[styles.modalNotesContent, { backgroundColor: themeColors.background }]}>
                        <Text style={[styles.modalNotesText, { color: themeColors.text }]}>
                          {(selectedItem.data as MedicalRecord)?.notes}
                        </Text>
                      </View>
                    </View>
                  )}
                  
                  {/* Action Buttons */}
                  <View style={styles.modalActionButtons}>
                    <TouchableOpacity 
                      style={[styles.modalActionButton, styles.modalDownloadButton, { backgroundColor: '#2196F3' }]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="download-outline" size={20} color="white" />
                      <Text style={styles.modalActionButtonText}>Download Report</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalActionButton, styles.modalShareButton, { backgroundColor: themeColors.border }]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="share-outline" size={20} color={themeColors.text} />
                      <Text style={[styles.modalActionButtonText, { color: themeColors.text }]}>Share</Text>
                    </TouchableOpacity>
                    </View>
                  </ScrollView>
                </SafeAreaView>
              </View>
          </View>
        </Modal>
      )}
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  sectionHeader: {
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionDivider: {
    height: 1,
    width: "100%",
  },
  filterIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  clearFilter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: "600",
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
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  recordType: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardRight: {
    marginLeft: 12,
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
  },
  modal: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
  },
  medicalRecordModal: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalInfoCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalNotesCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalCardTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: 'uppercase',
  },
  modalInfoGrid: {
    gap: 16,
  },
  modalInfoItem: {
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  modalNotesContent: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  modalNotesText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  modalActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalDownloadButton: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalShareButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalActionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: 'white',
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
