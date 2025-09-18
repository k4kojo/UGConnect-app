import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useMedicationDetails } from '@/hooks/useCache';
import { medicationService } from '@/services/medicationService';
import { cacheService, CACHE_KEYS } from '@/services/cacheService';
import LoaderComponent from '@/components/loader.component';

type LogStatus = 'taken' | 'skipped' | 'missed';

interface LogOption {
  status: LogStatus;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export default function MedicationLogScreen() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;
  
  const params = useLocalSearchParams();
  const medicationId = params.id as string;
  const medicationName = params.name as string;
  const medicationDosage = params.dosage as string;

  const [selectedStatus, setSelectedStatus] = useState<LogStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [isLogging, setIsLogging] = useState(false);

  const {
    data: medication,
    loading,
    error,
    refresh,
  } = useMedicationDetails(medicationId);

  const logOptions: LogOption[] = [
    {
      status: 'taken',
      title: 'Taken',
      description: 'I took my medication as prescribed',
      icon: 'checkmark-circle',
      color: themeColors.success,
    },
    {
      status: 'skipped',
      title: 'Skipped',
      description: 'I intentionally skipped this dose',
      icon: 'pause-circle',
      color: themeColors.warning,
    },
    {
      status: 'missed',
      title: 'Missed',
      description: 'I forgot to take this dose',
      icon: 'close-circle',
      color: themeColors.error,
    },
  ];

  const handleStatusSelect = (status: LogStatus) => {
    setSelectedStatus(status);
  };

  const handleLogMedication = async () => {
    if (!selectedStatus) {
      Alert.alert('Selection Required', 'Please select a status for this medication log.');
      return;
    }

    setIsLogging(true);

    try {
      await medicationService.logMedicationIntake(medicationId, {
        status: selectedStatus,
        notes: notes.trim() || undefined,
        takenAt: new Date().toISOString(),
      });

      // Cache invalidation is handled automatically by the service

      // Show success message
      const statusText = selectedStatus === 'taken' ? 'taken' : selectedStatus === 'skipped' ? 'skipped' : 'missed';
      Alert.alert(
        'Success',
        `Medication ${statusText} logged successfully!`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error logging medication:', error);
      Alert.alert(
        'Error',
        'Failed to log medication. Please try again.',
        [
          { text: 'OK' }
        ]
      );
    } finally {
      setIsLogging(false);
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !medication) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Log Medication
          </Text>
          <View style={styles.placeholder} />
        </View>
        <LoaderComponent />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Log Medication
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={themeColors.error} />
          <Text style={[styles.errorText, { color: themeColors.text }]}>
            Failed to load medication details
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: brand.primary }]}
            onPress={refresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayName = medication?.name || medicationName;
  const displayDosage = medication?.dosage || medicationDosage;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Log Medication
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Medication Info */}
        <View style={[styles.medicationCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.medicationHeader}>
            <Ionicons name="medical" size={24} color={brand.primary} />
            <View style={styles.medicationInfo}>
              <Text style={[styles.medicationName, { color: themeColors.text }]}>
                {displayName}
              </Text>
              <Text style={[styles.medicationDosage, { color: brand.primary }]}>
                {displayDosage}
              </Text>
            </View>
          </View>
          
          <View style={styles.timeInfo}>
            <Text style={[styles.timeText, { color: themeColors.text }]}>
              {getCurrentDate()}
            </Text>
            <Text style={[styles.timeText, { color: themeColors.text }]}>
              {getCurrentTime()}
            </Text>
          </View>
        </View>

        {/* Status Selection */}
        <View style={styles.statusSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            What happened with this dose?
          </Text>
          
          {logOptions.map((option) => (
            <TouchableOpacity
              key={option.status}
              style={[
                styles.statusOption,
                {
                  backgroundColor: selectedStatus === option.status 
                    ? option.color + '20' 
                    : themeColors.card,
                  borderColor: selectedStatus === option.status 
                    ? option.color 
                    : themeColors.border,
                }
              ]}
              onPress={() => handleStatusSelect(option.status)}
              activeOpacity={0.7}
            >
              <View style={styles.statusContent}>
                <Ionicons 
                  name={option.icon as any} 
                  size={32} 
                  color={selectedStatus === option.status ? option.color : themeColors.text} 
                />
                <View style={styles.statusText}>
                  <Text style={[
                    styles.statusTitle, 
                    { 
                      color: selectedStatus === option.status 
                        ? option.color 
                        : themeColors.text 
                    }
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.statusDescription, 
                    { 
                      color: selectedStatus === option.status 
                        ? option.color 
                        : themeColors.text 
                    }
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              
              {selectedStatus === option.status && (
                <Ionicons name="checkmark-circle" size={24} color={option.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Notes Section */}
        <View style={styles.notesSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            Notes (Optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: themeColors.card,
                borderColor: themeColors.border,
                color: themeColors.text,
              }
            ]}
            placeholder="Add any notes about this dose..."
            placeholderTextColor={themeColors.text}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.logButton,
            {
              backgroundColor: selectedStatus ? brand.primary : themeColors.inactive,
            }
          ]}
          onPress={handleLogMedication}
          disabled={!selectedStatus || isLogging}
          activeOpacity={0.8}
        >
          {isLogging ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text style={styles.logButtonText}>
                Log {selectedStatus ? logOptions.find(o => o.status === selectedStatus)?.title : 'Medication'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  medicationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  medicationDosage: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeInfo: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    marginBottom: 2,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusText: {
    marginLeft: 16,
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  statusDescription: {
    fontSize: 14,
  },
  notesSection: {
    marginBottom: 32,
  },
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    gap: 8,
  },
  logButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
