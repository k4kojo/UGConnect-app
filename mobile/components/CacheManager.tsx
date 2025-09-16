import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../constants/colors';
import { useThemeContext } from '../context/ThemeContext';
import { useCacheManagement } from '../hooks/useCache';

interface CacheManagerProps {
  visible?: boolean;
  onClose?: () => void;
}

export const CacheManager: React.FC<CacheManagerProps> = ({ visible = false, onClose }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const { cacheStats, getStats, clearCache, invalidatePattern } = useCacheManagement();

  if (!visible || !__DEV__) return null;

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCache();
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleInvalidatePattern = (pattern: string) => {
    Alert.alert(
      'Invalidate Cache',
      `Are you sure you want to invalidate cache for pattern: "${pattern}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Invalidate',
          style: 'destructive',
          onPress: async () => {
            await invalidatePattern(pattern);
            Alert.alert('Success', `Cache invalidated for pattern: ${pattern}`);
          },
        },
      ]
    );
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <Text style={[styles.title, { color: themeColors.white }]}>Cache Manager</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeText, { color: themeColors.white }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.content}>
        {/* Cache Stats */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Cache Statistics</Text>
          {cacheStats ? (
            <View style={styles.statsContainer}>
              <Text style={[styles.statText, { color: themeColors.text }]}>
                Items: {cacheStats.size} / {cacheStats.maxSize}
              </Text>
              <Text style={[styles.statText, { color: themeColors.text }]}>
                Hit Rate: {cacheStats.hitRate.toFixed(1)}%
              </Text>
            </View>
          ) : (
            <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
              Loading stats...
            </Text>
          )}
        </View>

        {/* Cache Keys */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Cached Keys</Text>
          {cacheStats?.keys && cacheStats.keys.length > 0 ? (
            cacheStats.keys.map((key, index) => (
              <View key={index} style={styles.keyItem}>
                <Text style={[styles.keyText, { color: themeColors.text }]} numberOfLines={1}>
                  {key}
                </Text>
                <TouchableOpacity
                  onPress={() => handleInvalidatePattern(key)}
                  style={[styles.invalidateButton, { backgroundColor: themeColors.error }]}
                >
                  <Text style={[styles.invalidateText, { color: themeColors.white }]}>×</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
              No cached items
            </Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Quick Actions</Text>
          
          <TouchableOpacity
            onPress={() => handleInvalidatePattern('appointments')}
            style={[styles.actionButton, { backgroundColor: themeColors.secondary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Invalidate Appointments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleInvalidatePattern('chat')}
            style={[styles.actionButton, { backgroundColor: themeColors.secondary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Invalidate Chat
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleInvalidatePattern('notifications')}
            style={[styles.actionButton, { backgroundColor: themeColors.secondary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Invalidate Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={getStats}
            style={[styles.actionButton, { backgroundColor: themeColors.primary }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Refresh Stats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleClearCache}
            style={[styles.actionButton, { backgroundColor: themeColors.error }]}
          >
            <Text style={[styles.actionText, { color: themeColors.white }]}>
              Clear All Cache
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: 50, // Account for status bar
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsContainer: {
    gap: 8,
  },
  statText: {
    fontSize: 14,
  },
  keyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  keyText: {
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  invalidateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  invalidateText: {
    fontSize: 12,
    fontWeight: 'bold',
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
