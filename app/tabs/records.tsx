import Loader from "@/components/loader.component";
import LabResultModal from "@/components/modals/labResultModal";
import PrescriptionModal from "@/components/modals/prescriptionsModal";
import TopHeader from "@/components/top-header.component";
import Colors from "@/constants/colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
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
  type: "lab" | "prescription" | "header";
};

const labResults: RecordItem[] = [
  { id: "lab-header", title: "Lab Results", type: "header" },
  { id: "1", title: "Blood Test", date: "May 20, 2024", type: "lab" },
  { id: "2", title: "X-Ray", date: "Feb 9, 2024", type: "lab" },
];

const prescriptions: RecordItem[] = [
  { id: "prescription-header", title: "Prescriptions", type: "header" },
  { id: "3", title: "Amoxicillin", date: "Apr 10, 2024", type: "prescription" },
];

const allRecords: RecordItem[] = [...labResults, ...prescriptions];

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

  const icon = (
    <Ionicons
      name={item.type === "prescription" ? "medkit" : "flask-outline"}
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
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { theme } = useThemeContext();
  const themeColors = Colors[theme];

  // Simulate loading for demo purposes
  // In real app, this would be replaced with actual API calls
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRecords(allRecords);
      setIsLoading(false);
    }, 1000);
  }, []);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      // simulate reload
      await new Promise((r) => setTimeout(r, 600));
      setRecords(allRecords);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    return records.filter(
      (item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.date && item.date.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [records, searchQuery]);

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
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeColors.subText }]}>
            {searchQuery ? "No records found matching your search" : "No medical records available"}
          </Text>
        </View>
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
                result={selectedItem}
              />
            ) : (
              <PrescriptionModal
                visible={modalVisible}
                onClose={closeModal}
                prescription={selectedItem}
              />
            )}
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
});

export default Records;
