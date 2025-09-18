import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useMedications, useOverallAdherence } from '@/hooks/useCache';
import LoaderComponent from '@/components/loader.component';

const { width } = Dimensions.get('window');

export default function MedicationAnalyticsScreen() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  const [selectedPeriod, setSelectedPeriod] = useState<7 | 30 | 90>(30);

  const {
    data: medications,
    loading: medicationsLoading,
    refresh: refreshMedications,
  } = useMedications();

  const {
    data: adherenceData,
    loading: adherenceLoading,
    refresh: refreshAdherence,
  } = useOverallAdherence(selectedPeriod);

  const loading = medicationsLoading || adherenceLoading;

  const handleRefresh = async () => {
    await Promise.all([refreshMedications(), refreshAdherence()]);
  };

  const handlePeriodChange = (period: 7 | 30 | 90) => {
    setSelectedPeriod(period);
  };

  const renderAdherenceChart = () => {
    if (!adherenceData || adherenceData.totalLogs === 0) {
      return (
        <View style={[styles.chartContainer, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.noDataText, { color: themeColors.text }]}>
            No data available for the selected period
          </Text>
        </View>
      );
    }

    const { taken, skipped, missed, totalLogs } = adherenceData;
    const takenPercentage = (taken / totalLogs) * 100;
    const skippedPercentage = (skipped / totalLogs) * 100;
    const missedPercentage = (missed / totalLogs) * 100;

    const chartWidth = width - 64; // Account for margins
    const takenWidth = (takenPercentage / 100) * chartWidth;
    const skippedWidth = (skippedPercentage / 100) * chartWidth;
    const missedWidth = (missedPercentage / 100) * chartWidth;

    return (
      <View style={[styles.chartContainer, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.chartTitle, { color: themeColors.text }]}>
          Adherence Overview
        </Text>
        
        {/* Progress Bar Chart */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
            {takenWidth > 0 && (
              <View 
                style={[
                  styles.progressSegment, 
                  { 
                    width: takenWidth, 
                    backgroundColor: themeColors.success 
                  }
                ]} 
              />
            )}
            {skippedWidth > 0 && (
              <View 
                style={[
                  styles.progressSegment, 
                  { 
                    width: skippedWidth, 
                    backgroundColor: themeColors.warning 
                  }
                ]} 
              />
            )}
            {missedWidth > 0 && (
              <View 
                style={[
                  styles.progressSegment, 
                  { 
                    width: missedWidth, 
                    backgroundColor: themeColors.error 
                  }
                ]} 
              />
            )}
          </View>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: themeColors.success }]} />
            <Text style={[styles.legendText, { color: themeColors.text }]}>
              Taken ({taken})
            </Text>
            <Text style={[styles.legendPercentage, { color: themeColors.success }]}>
              {takenPercentage.toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: themeColors.warning }]} />
            <Text style={[styles.legendText, { color: themeColors.text }]}>
              Skipped ({skipped})
            </Text>
            <Text style={[styles.legendPercentage, { color: themeColors.warning }]}>
              {skippedPercentage.toFixed(1)}%
            </Text>
          </View>
          
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: themeColors.error }]} />
            <Text style={[styles.legendText, { color: themeColors.text }]}>
              Missed ({missed})
            </Text>
            <Text style={[styles.legendPercentage, { color: themeColors.error }]}>
              {missedPercentage.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStatsCards = () => {
    if (!adherenceData) return null;

    const stats = [
      {
        title: 'Overall Adherence',
        value: `${adherenceData.averageAdherence.toFixed(1)}%`,
        icon: 'analytics-outline',
        color: adherenceData.averageAdherence >= 80 ? themeColors.success : 
               adherenceData.averageAdherence >= 60 ? themeColors.warning : themeColors.error,
      },
      {
        title: 'Active Medications',
        value: adherenceData.totalMedications.toString(),
        icon: 'medical-outline',
        color: brand.primary,
      },
      {
        title: 'Total Logs',
        value: adherenceData.totalLogs.toString(),
        icon: 'list-outline',
        color: themeColors.subText,
      },
      {
        title: 'Success Rate',
        value: adherenceData.totalLogs > 0 
          ? `${((adherenceData.taken / adherenceData.totalLogs) * 100).toFixed(1)}%`
          : '0%',
        icon: 'checkmark-circle-outline',
        color: themeColors.success,
      },
    ];

    return (
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View 
            key={index} 
            style={[styles.statCard, { backgroundColor: themeColors.card }]}
          >
            <View style={styles.statHeader}>
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
            </View>
            <Text style={[styles.statTitle, { color: themeColors.text }]}>
              {stat.title}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderMedicationList = () => {
    if (!medications || medications.length === 0) return null;

    return (
      <View style={[styles.medicationListContainer, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Active Medications
        </Text>
        
        {medications.slice(0, 5).map((medication, index) => (
          <View key={medication.id} style={styles.medicationItem}>
            <View style={styles.medicationInfo}>
              <Text style={[styles.medicationName, { color: themeColors.text }]}>
                {medication.name}
              </Text>
              <Text style={[styles.medicationDetails, { color: themeColors.text }]}>
                {medication.dosage} • {medication.frequency}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/medication/details/[id]',
                params: { id: medication.id }
              })}
            >
              <Ionicons name="chevron-forward" size={20} color={themeColors.text} />
            </TouchableOpacity>
          </View>
        ))}
        
        {medications.length > 5 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => router.push('/medication')}
          >
            <Text style={[styles.viewAllText, { color: brand.primary }]}>
              View All Medications ({medications.length})
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading && !adherenceData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: themeColors.text }]}>
            Analytics
          </Text>
          <View style={styles.placeholder} />
        </View>
        <LoaderComponent />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themeColors.text }]}>
          Analytics
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh-outline" size={24} color={brand.primary} />
        </TouchableOpacity>
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
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {[7, 30, 90].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === period ? brand.primary : themeColors.card,
                  borderColor: themeColors.border,
                }
              ]}
              onPress={() => handlePeriodChange(period as 7 | 30 | 90)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.periodText,
                  {
                    color: selectedPeriod === period ? 'white' : themeColors.text,
                  }
                ]}
              >
                {period} days
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Cards */}
        {renderStatsCards()}

        {/* Adherence Chart */}
        {renderAdherenceChart()}

        {/* Medication List */}
        {renderMedicationList()}

        {/* Insights */}
        {adherenceData && adherenceData.totalLogs > 0 && (
          <View style={[styles.insightsContainer, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
              Insights
            </Text>
            
            <View style={styles.insight}>
              <Ionicons 
                name={adherenceData.averageAdherence >= 80 ? "checkmark-circle" : "alert-circle"} 
                size={20} 
                color={adherenceData.averageAdherence >= 80 ? themeColors.success : themeColors.warning} 
              />
              <Text style={[styles.insightText, { color: themeColors.text }]}>
                {adherenceData.averageAdherence >= 80 
                  ? "Great job! Your medication adherence is excellent."
                  : adherenceData.averageAdherence >= 60
                  ? "Your adherence is good, but there's room for improvement."
                  : "Consider setting more reminders to improve your adherence."
                }
              </Text>
            </View>
            
            {adherenceData.missed > 0 && (
              <View style={styles.insight}>
                <Ionicons name="time-outline" size={20} color={themeColors.subText} />
                <Text style={[styles.insightText, { color: themeColors.text }]}>
                  You missed {adherenceData.missed} dose{adherenceData.missed !== 1 ? 's' : ''} in the last {selectedPeriod} days. 
                  Try setting additional reminders.
                </Text>
              </View>
            )}
          </View>
        )}
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
  refreshButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressSegment: {
    height: '100%',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    flex: 1,
    fontSize: 14,
  },
  legendPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  medicationListContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  medicationDetails: {
    fontSize: 14,
  },
  viewAllButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  insightsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
