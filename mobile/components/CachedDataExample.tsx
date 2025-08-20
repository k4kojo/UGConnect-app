import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/colors';
import { useThemeContext } from '../context/ThemeContext';
import { useAppointments, useDoctors, usePatientProfile } from '../hooks/useCache';
import { invalidateAppointmentsCache, invalidateUserProfileCache } from '../services/cachedAuthService';

export const CachedDataExample: React.FC = () => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  
  // Using cached hooks
  const { data: doctors, loading: doctorsLoading, refresh: refreshDoctors, isStale: doctorsStale } = useDoctors();
  const { data: appointments, loading: appointmentsLoading, refresh: refreshAppointments } = useAppointments();
  const { data: profile, loading: profileLoading, refresh: refreshProfile } = usePatientProfile();

  const [showCacheInfo, setShowCacheInfo] = useState(false);

  const handleRefreshAll = async () => {
    try {
      await Promise.all([
        refreshDoctors(),
        refreshAppointments(),
        refreshProfile(),
      ]);
      Alert.alert('Success', 'All data refreshed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    }
  };

  const handleInvalidateAppointments = async () => {
    try {
      await invalidateAppointmentsCache();
      Alert.alert('Success', 'Appointments cache invalidated');
    } catch (error) {
      Alert.alert('Error', 'Failed to invalidate cache');
    }
  };

  const handleInvalidateProfile = async () => {
    try {
      await invalidateUserProfileCache();
      Alert.alert('Success', 'Profile cache invalidated');
    } catch (error) {
      Alert.alert('Error', 'Failed to invalidate cache');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={[styles.title, { color: themeColors.white }]}>Cached Data Example</Text>
        <TouchableOpacity
          onPress={() => setShowCacheInfo(!showCacheInfo)}
          style={styles.infoButton}
        >
          <Text style={[styles.infoText, { color: themeColors.white }]}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Cache Status */}
        {showCacheInfo && (
          <View style={[styles.cacheInfo, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.cacheInfoTitle, { color: themeColors.text }]}>Cache Status</Text>
            <Text style={[styles.cacheInfoText, { color: themeColors.text }]}>
              Doctors: {doctorsLoading ? 'Loading...' : `${doctors?.length || 0} items`} 
              {doctorsStale && ' (Stale)'}
            </Text>
            <Text style={[styles.cacheInfoText, { color: themeColors.text }]}>
              Appointments: {appointmentsLoading ? 'Loading...' : `${appointments?.length || 0} items`}
            </Text>
            <Text style={[styles.cacheInfoText, { color: themeColors.text }]}>
              Profile: {profileLoading ? 'Loading...' : profile ? 'Loaded' : 'Not loaded'}
            </Text>
          </View>
        )}

        {/* Data Display */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Doctors</Text>
          {doctorsLoading ? (
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading doctors...</Text>
          ) : doctors && doctors.length > 0 ? (
            <Text style={[styles.dataText, { color: themeColors.text }]}>
              {doctors.length} doctors available
            </Text>
          ) : (
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No doctors found</Text>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Appointments</Text>
          {appointmentsLoading ? (
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading appointments...</Text>
          ) : appointments && appointments.length > 0 ? (
            <Text style={[styles.dataText, { color: themeColors.text }]}>
              {appointments.length} appointments found
            </Text>
          ) : (
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No appointments found</Text>
          )}
        </View>

        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Profile</Text>
          {profileLoading ? (
            <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>Loading profile...</Text>
          ) : profile ? (
            <Text style={[styles.dataText, { color: themeColors.text }]}>
              Profile loaded for {profile.user?.firstName} {profile.user?.lastName}
            </Text>
          ) : (
            <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>No profile found</Text>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.actions, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Actions</Text>
          
          <TouchableOpacity
            onPress={handleRefreshAll}
            style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Refresh All Data
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={refreshDoctors}
            style={[styles.actionButton, { backgroundColor: themeColors.secondary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Refresh Doctors
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={refreshAppointments}
            style={[styles.actionButton, { backgroundColor: themeColors.secondary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Refresh Appointments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={refreshProfile}
            style={[styles.actionButton, { backgroundColor: themeColors.secondary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Refresh Profile
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleInvalidateAppointments}
            style={[styles.actionButton, { backgroundColor: themeColors.error }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Invalidate Appointments Cache
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleInvalidateProfile}
            style={[styles.actionButton, { backgroundColor: themeColors.error }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Invalidate Profile Cache
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 8,
  },
  infoText: {
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cacheInfo: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cacheInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cacheInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  section: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  dataText: {
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  actions: {
    padding: 16,
    borderRadius: 8,
  },
  actionButton: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
