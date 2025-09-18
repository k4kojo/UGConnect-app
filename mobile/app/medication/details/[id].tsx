import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useMedicationDetails, useMedicationLogs, useMedicationAdherence } from '@/hooks/useCache';
import LoaderComponent from '@/components/loader.component';
import { MedicationLog } from '@/services/medicationService';

export default function MedicationDetailsScreen() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  const params = useLocalSearchParams();
  const medicationId = params.id as string;

  const [activeTab, setActiveTab] = useState<'details' | 'logs' | 'adherence'>('details');

  const {
    data: medication,
    loading: medicationLoading,
    error: medicationError,
    refresh: refreshMedication,
  } = useMedicationDetails(medicationId);

  const {
    data: logs,
    loading: logsLoading,
    refresh: refreshLogs,
  } = useMedicationLogs(medicationId, { days: 30 });

  const {
    data: adherence,
    loading: adherenceLoading,
    refresh: refreshAdherence,
  } = useMedicationAdherence(medicationId, 30);

  const loading = medicationLoading || logsLoading || adherenceLoading;

  const handleRefresh = async () => {
    await Promise.all([
      refreshMedication(),
      refreshLogs(),
      refreshAdherence(),
    ]);
  };

  const handleLogPress = () => {
    if (!medication) return;
    
    router.push({
      pathname: '/medication/log/[id]',
      params: {
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage,
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return themeColors.success;
      case 'skipped':
        return themeColors.warning;
      case 'missed':
        return themeColors.error;
      default:
        return themeColors.text;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'taken':
        return 'checkmark-circle';
      case 'skipped':
        return 'pause-circle';
      case 'missed':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const renderDetailsTab = () => {
    if (!medication) return null;

    const isOngoing = !medication.endDate;
    const isExpired = medication.endDate && new Date(medication.endDate) < new Date();

    return (
      <View style={styles.tabContent}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: themeColors.text }]}>
              Status
            </Text>
            <View style={styles.statusBadges}>
              {!medication.isActive && (
                <View style={[styles.statusBadge, { backgroundColor: themeColors.inactive + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: themeColors.inactive }]}>
                    Inactive
                  </Text>
                </View>
              )}
              {isExpired && (
                <View style={[styles.statusBadge, { backgroundColor: themeColors.error + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: themeColors.error }]}>
                    Expired
                  </Text>
                </View>
              )}
              {isOngoing && medication.isActive && (
                <View style={[styles.statusBadge, { backgroundColor: themeColors.success + '20' }]}>
                  <Text style={[styles.statusBadgeText, { color: themeColors.success }]}>
                    Ongoing
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Medication Info */}
        <View style={[styles.infoCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.infoRow}>
            <Ionicons name="medical" size={20} color={brand.primary} />
            <Text style={[styles.infoLabel, { color: themeColors.text }]}>
              Medication
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {medication.name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="flask" size={20} color={brand.primary} />
            <Text style={[styles.infoLabel, { color: themeColors.text }]}>
              Dosage
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {medication.dosage}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={brand.primary} />
            <Text style={[styles.infoLabel, { color: themeColors.text }]}>
              Frequency
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {medication.frequency}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color={brand.primary} />
            <Text style={[styles.infoLabel, { color: themeColors.text }]}>
              Start Date
            </Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>
              {formatDate(medication.startDate)}
            </Text>
          </View>

          {medication.endDate && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={20} color={brand.primary} />
              <Text style={[styles.infoLabel, { color: themeColors.text }]}>
                End Date
              </Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>
                {formatDate(medication.endDate)}
              </Text>
            </View>
          )}

          {medication.prescriber && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={brand.primary} />
              <Text style={[styles.infoLabel, { color: themeColors.text }]}>
                Prescribed by
              </Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>
                Dr. {medication.prescriber.firstName} {medication.prescriber.lastName}
              </Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        {medication.instructions && (
          <View style={[styles.instructionsCard, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cardTitle, { color: themeColors.text }]}>
              Instructions
            </Text>
            <Text style={[styles.instructionsText, { color: themeColors.text }]}>
              {medication.instructions}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderLogsTab = () => {
    if (!logs) return null;

    return (
      <View style={styles.tabContent}>
        {logs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={48} color={themeColors.text} />
            <Text style={[styles.emptyStateText, { color: themeColors.text }]}>
              No logs found for the last 30 days
            </Text>
          </View>
        ) : (
          logs.map((log: MedicationLog) => (
            <View key={log.id} style={[styles.logItem, { backgroundColor: themeColors.card }]}>
              <View style={styles.logHeader}>
                <Ionicons 
                  name={getStatusIcon(log.status) as any} 
                  size={24} 
                  color={getStatusColor(log.status)} 
                />
                <View style={styles.logInfo}>
                  <Text style={[styles.logStatus, { color: getStatusColor(log.status) }]}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </Text>
                  <Text style={[styles.logDate, { color: themeColors.text }]}>
                    {formatDateTime(log.takenAt)}
                  </Text>
                </View>
              </View>
              {log.notes && (
                <Text style={[styles.logNotes, { color: themeColors.text }]}>
                  {log.notes}
                </Text>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  const renderAdherenceTab = () => {
    if (!adherence) return null;

    const adherencePercentage = adherence.adherenceRate;
    const adherenceColor = adherencePercentage >= 80 ? themeColors.success : 
                          adherencePercentage >= 60 ? themeColors.warning : themeColors.error;

    return (
      <View style={styles.tabContent}>
        {/* Adherence Score */}
        <View style={[styles.adherenceCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            30-Day Adherence
          </Text>
          <View style={styles.adherenceScore}>
            <Text style={[styles.adherencePercentage, { color: adherenceColor }]}>
              {adherencePercentage.toFixed(1)}%
            </Text>
            <Text style={[styles.adherenceLabel, { color: themeColors.text }]}>
              Overall Adherence
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Statistics
          </Text>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.success }]}>
                {adherence.taken}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                Taken
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.warning }]}>
                {adherence.skipped}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                Skipped
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.error }]}>
                {adherence.missed}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                Missed
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: themeColors.text }]}>
                {adherence.totalLogs}
              </Text>
              <Text style={[styles.statLabel, { color: themeColors.text }]}>
                Total
              </Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={[styles.insightsCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Insights
          </Text>
          
          <View style={styles.insight}>
            <Ionicons 
              name={adherencePercentage >= 80 ? "checkmark-circle" : "alert-circle"} 
              size={20} 
              color={adherenceColor} 
            />
            <Text style={[styles.insightText, { color: themeColors.text }]}>
              {adherencePercentage >= 80 
                ? "Excellent adherence! Keep up the great work."
                : adherencePercentage >= 60
                ? "Good adherence, but there's room for improvement."
                : "Consider setting more reminders to improve adherence."
              }
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (medicationLoading && !medication) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Medication Details
          </Text>
          <View style={styles.placeholder} />
        </View>
        <LoaderComponent />
      </SafeAreaView>
    );
  }

  if (medicationError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Medication Details
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
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]} numberOfLines={1}>
          {medication?.name || 'Medication Details'}
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color={brand.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {(['details', 'logs', 'adherence'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab ? brand.primary : 'transparent',
                borderBottomColor: activeTab === tab ? brand.primary : 'transparent',
              }
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab ? 'white' : themeColors.text,
                }
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[brand.primary]}
            tintColor={brand.primary}
          />
        }
      >
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'logs' && renderLogsTab()}
        {activeTab === 'adherence' && renderAdherenceTab()}
      </ScrollView>

      {/* Log Button */}
      {medication && medication.isActive && !medication.endDate && (
        <View style={styles.floatingButton}>
          <TouchableOpacity
            style={[styles.logButton, { backgroundColor: brand.primary }]}
            onPress={handleLogPress}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.logButtonText}>Log Intake</Text>
          </TouchableOpacity>
        </View>
      )}
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
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  tabContent: {
    paddingBottom: 100,
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  logItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logInfo: {
    flex: 1,
  },
  logStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  logDate: {
    fontSize: 14,
  },
  logNotes: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  adherenceCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  adherenceScore: {
    alignItems: 'center',
    marginTop: 12,
  },
  adherencePercentage: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  adherenceLabel: {
    fontSize: 14,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  insightsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
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
