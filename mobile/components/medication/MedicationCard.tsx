import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Medication } from '@/services/medicationService';

interface MedicationCardProps {
  medication: Medication;
  onPress: () => void;
  onLogPress: () => void;
  showLogButton?: boolean;
}

export default function MedicationCard({ 
  medication, 
  onPress, 
  onLogPress, 
  showLogButton = true 
}: MedicationCardProps) {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getFrequencyIcon = (frequency: string) => {
    if (!frequency) return 'refresh-outline';
    const lowerFreq = frequency.toLowerCase();
    if (lowerFreq.includes('1') || lowerFreq.includes('once')) {
      return 'time-outline';
    } else if (lowerFreq.includes('2') || lowerFreq.includes('twice')) {
      return 'alarm-outline';
    } else if (lowerFreq.includes('3') || lowerFreq.includes('three')) {
      return 'notifications-outline';
    }
    return 'refresh-outline';
  };

  const isOngoing = !medication.endDate;
  const isExpired = medication.endDate && new Date(medication.endDate) < new Date();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.medicationInfo}>
          <Text style={[styles.medicationName, { color: themeColors.text }]}>
            {medication.name}
          </Text>
          <Text style={[styles.dosage, { color: brand.primary }]}>
            {medication.dosage}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          {!medication.isActive && (
            <View style={[styles.statusBadge, { backgroundColor: themeColors.inactive + '20' }]}>
              <Text style={[styles.statusText, { color: themeColors.inactive }]}>
                Inactive
              </Text>
            </View>
          )}
          {isExpired && (
            <View style={[styles.statusBadge, { backgroundColor: '#ff6b6b20' }]}>
              <Text style={[styles.statusText, { color: '#ff6b6b' }]}>
                Expired
              </Text>
            </View>
          )}
          {isOngoing && medication.isActive && (
            <View style={[styles.statusBadge, { backgroundColor: themeColors.success + '20' }]}>
              <Text style={[styles.statusText, { color: themeColors.success }]}>
                Ongoing
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.frequencyContainer}>
        <Ionicons 
          name={getFrequencyIcon(medication.frequency)} 
          size={16} 
          color={themeColors.text} 
        />
        <Text style={[styles.frequency, { color: themeColors.text }]}>
          {medication.frequency}
        </Text>
      </View>

      <View style={styles.dateContainer}>
        <Text style={[styles.dateLabel, { color: themeColors.text }]}>
          Started: {formatDate(medication.startDate)}
        </Text>
        {medication.endDate && (
          <Text style={[styles.dateLabel, { color: themeColors.text }]}>
            Until: {formatDate(medication.endDate)}
          </Text>
        )}
      </View>

      {medication.prescriber && (
        <View style={styles.prescriberContainer}>
          <Ionicons name="person-outline" size={14} color={themeColors.text} />
          <Text style={[styles.prescriber, { color: themeColors.text }]}>
            Dr. {medication.prescriber.firstName} {medication.prescriber.lastName}
          </Text>
        </View>
      )}

      {medication.instructions && (
        <Text style={[styles.instructions, { color: themeColors.text }]} numberOfLines={2}>
          {medication.instructions}
        </Text>
      )}

      {showLogButton && medication.isActive && !isExpired && (
        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: brand.primary }]}
          onPress={onLogPress}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="white" />
          <Text style={styles.logButtonText}>Log Intake</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  dosage: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  frequencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  frequency: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  prescriberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  prescriber: {
    fontSize: 13,
  },
  instructions: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 18,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  logButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
