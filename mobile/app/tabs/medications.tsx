import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { useMedications, useUpcomingReminders, useOverallAdherence } from '@/hooks/useCache';
import { medicationService } from '@/services/medicationService';
import MedicationCard from '@/components/medication/MedicationCard';
import EmptyState from '@/components/EmptyState';
import { MedicationCardSkeleton, StatsCardSkeleton } from '@/components/SkeletonLoader';
import LoaderComponent from '@/components/loader.component';
import TopHeader from '@/components/top-header.component';
import { Medication } from '@/services/medicationService';

export default function MedicationsTab() {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brand = Colors.brand;

  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('active');
  
  const {
    data: medications,
    loading,
    error,
    refresh: refreshMedications,
  } = useMedications();

  const {
    data: upcomingReminders,
    refresh: refreshReminders,
  } = useUpcomingReminders();

  const filteredMedications = medications?.filter((med: Medication) => {
    if (filter === 'active') return med.isActive;
    if (filter === 'inactive') return !med.isActive;
    return true;
  }) || [];

  const handleRefresh = async () => {
    await Promise.all([refreshMedications(), refreshReminders()]);
  };

  const handleMedicationPress = (medication: Medication) => {
    router.push({
      pathname: '/medication/details/[id]',
      params: { id: medication.id }
    });
  };

  const handleLogPress = (medication: Medication) => {
    router.push({
      pathname: '/medication/log/[id]',
      params: { 
        id: medication.id,
        name: medication.name,
        dosage: medication.dosage
      }
    });
  };

  const handleAnalyticsPress = () => {
    router.push('/medication/analytics');
  };

  const renderMedicationCard = ({ item }: { item: Medication }) => (
    <MedicationCard
      medication={item}
      onPress={() => handleMedicationPress(item)}
      onLogPress={() => handleLogPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Quick Stats */}
      <View style={[styles.statsContainer, { backgroundColor: themeColors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: brand.primary }]}>
            {medications?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>
            Total
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: themeColors.success }]}>
            {medications?.filter((m: Medication) => m.isActive).length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>
            Active
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: themeColors.warning }]}>
            {upcomingReminders?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.text }]}>
            Reminders
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.statItem}
          onPress={handleAnalyticsPress}
          activeOpacity={0.7}
        >
          <Ionicons name="analytics-outline" size={24} color={brand.primary} />
          <Text style={[styles.statLabel, { color: themeColors.text }]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Upcoming Reminders */}
      {upcomingReminders && upcomingReminders.length > 0 && (
        <View style={[styles.remindersContainer, { backgroundColor: brand.primary + '10' }]}>
          <View style={styles.remindersHeader}>
            <Ionicons name="alarm-outline" size={20} color={brand.primary} />
            <Text style={[styles.remindersTitle, { color: brand.primary }]}>
              Upcoming Reminders
            </Text>
          </View>
          <Text style={[styles.remindersText, { color: themeColors.text }]}>
            You have {upcomingReminders.length} reminder{upcomingReminders.length !== 1 ? 's' : ''} in the next 24 hours
          </Text>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['active', 'all', 'inactive'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterTab,
              {
                backgroundColor: filter === filterOption ? brand.primary : themeColors.card,
                borderColor: themeColors.border,
              }
            ]}
            onPress={() => setFilter(filterOption)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color: filter === filterOption ? 'white' : themeColors.text,
                }
              ]}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (loading && !medications) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <TopHeader screen="medications" />
        <View style={styles.skeletonContainer}>
          {/* Stats Skeleton */}
          <View style={styles.statsContainer}>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </View>
          
          {/* Medication Cards Skeleton */}
          <MedicationCardSkeleton />
          <MedicationCardSkeleton />
          <MedicationCardSkeleton />
          <MedicationCardSkeleton />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <TopHeader screen="medications" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={themeColors.error} />
          <Text style={[styles.errorText, { color: themeColors.text }]}>
            Failed to load medications
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: brand.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <TopHeader screen="medications" />
      
      <FlatList
        data={filteredMedications}
        renderItem={renderMedicationCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <EmptyState
            icon="medical-outline"
            title="No medications found"
            subtitle={
              filter === 'active'
                ? "You don't have any active medications"
                : filter === 'inactive'
                ? "You don't have any inactive medications"
                : "You don't have any medications yet"
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[brand.primary]}
            tintColor={brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 20,
  },
  headerContainer: {
    marginTop: 10,
    paddingBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
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
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  remindersContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  remindersTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  remindersText: {
    fontSize: 13,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    paddingBottom: 20,
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
