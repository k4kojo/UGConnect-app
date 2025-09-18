import Avatar from '@/components/avatar.component';
import Colors from '@/constants/colors';
import { useThemeContext } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type AppointmentType = 'Video Call' | 'In-Person';

export interface AppointmentCardItem {
  id: string | number;
  doctorId?: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: AppointmentType;
  imageUrl?: string;
  status?: 'confirmed' | 'pending';
}

type Props = {
  items: AppointmentCardItem[];
  onJoinCall?: (item: AppointmentCardItem) => void;
  onMessage?: (item: AppointmentCardItem) => void;
  showActions?: boolean;
  isPast?: boolean;
};

const AppointmentCard: React.FC<Props> = ({ items, onJoinCall, onMessage, showActions = true, isPast = false }) => {
  const { theme } = useThemeContext();
  const themeColors = Colors[theme];
  const brandColors = Colors.brand;

  return (
    <View style={styles.container}>
      {items.map((appointment) => (
        <View 
          key={appointment.id} 
          style={[
            styles.card, 
            { 
              backgroundColor: themeColors.card,
              borderColor: themeColors.border 
            },
            isPast && styles.pastCard
          ]}
        >
          {/* Header Section */}
          <View style={styles.headerRow}>
            <View style={styles.doctorInfo}>
              <Avatar 
                imageUrl={appointment.imageUrl} 
                fullName={appointment.doctorName} 
                size={60} 
                border
                containerStyle={{ backgroundColor: brandColors.primary + '15', borderColor: brandColors.primary + '30' }} 
              />
              <View style={styles.doctorDetails}>
                <Text style={[
                  styles.doctorName, 
                  { color: themeColors.text },
                  isPast && styles.pastText
                ]}>
                  {appointment.doctorName}
                </Text>
                <Text style={[
                  styles.specialty, 
                  { color: themeColors.subText },
                  isPast && styles.pastText
                ]}>
                  {appointment.specialty}
                </Text>
                
                {/* Date/Time Display */}
                <View style={styles.dateTimeRow}>
                  <View style={styles.dateTimeItem}>
                    <Ionicons 
                      name="calendar-outline" 
                      size={14} 
                      color={isPast ? themeColors.subText + '80' : brandColors.primary} 
                    />
                    <Text style={[
                      styles.dateTimeText, 
                      { color: isPast ? themeColors.subText + '80' : themeColors.subText }
                    ]}>
                      {appointment.date}
                    </Text>
                  </View>
                  <View style={styles.dateTimeItem}>
                    <Ionicons 
                      name="time-outline" 
                      size={14} 
                      color={isPast ? themeColors.subText + '80' : brandColors.primary} 
                    />
                    <Text style={[
                      styles.dateTimeText, 
                      { color: isPast ? themeColors.subText + '80' : themeColors.subText }
                    ]}>
                      {appointment.time}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Enhanced Status Badges */}
            <View style={styles.statusColumn}>
              <View
                style={[
                  styles.typeBadge,
                  appointment.type === 'Video Call' ? 
                    { backgroundColor: '#FF980015', borderColor: '#FF9800' } : 
                    { backgroundColor: '#4CAF5015', borderColor: '#4CAF50' }
                ]}
              >
                <Ionicons 
                  name={appointment.type === 'Video Call' ? "videocam" : "person"} 
                  size={12} 
                  color={appointment.type === 'Video Call' ? '#FF9800' : '#4CAF50'}
                />
                <Text style={[
                  styles.typeBadgeText, 
                  { color: appointment.type === 'Video Call' ? '#FF9800' : '#4CAF50' }
                ]}>
                  {appointment.type === 'Video Call' ? 'Video' : 'In-Person'}
                </Text>
              </View>
              
              {isPast ? (
                <View style={[styles.statusBadge, { backgroundColor: '#2196F315', borderColor: '#2196F3' }]}>
                  <Ionicons name="checkmark-circle" size={12} color="#2196F3" />
                  <Text style={[styles.statusBadgeText, { color: '#2196F3' }]}>
                    Completed
                  </Text>
                </View>
              ) : appointment.status ? (
                <View
                  style={[
                    styles.statusBadge,
                    appointment.status === 'confirmed' ? 
                      { backgroundColor: '#4CAF5015', borderColor: '#4CAF50' } : 
                      { backgroundColor: '#FF980015', borderColor: '#FF9800' }
                  ]}
                >
                  <Ionicons 
                    name={appointment.status === 'confirmed' ? "checkmark-circle" : "time"} 
                    size={12} 
                    color={appointment.status === 'confirmed' ? '#4CAF50' : '#FF9800'}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: appointment.status === 'confirmed' ? '#4CAF50' : '#FF9800'
                      },
                    ]}
                  >
                    {appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Enhanced Action Section */}
          {showActions && (
            <View style={styles.actionSection}>
              {isPast ? (
                <TouchableOpacity
                  style={[
                    styles.actionButton, 
                    styles.fullWidthButton,
                    { 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }
                  ]}
                  onPress={() => onMessage?.(appointment)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
                  <Text style={[styles.actionButtonText, { color: themeColors.text }]}>
                    View Chat History
                  </Text>
                </TouchableOpacity>
              ) : appointment.type === 'Video Call' ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      styles.primaryActionButton,
                      { backgroundColor: brandColors.primary }
                    ]}
                    onPress={() => onJoinCall?.(appointment)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="videocam" size={18} color="#fff" />
                    <Text style={styles.primaryActionButtonText}>Join Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton, 
                      styles.secondaryActionButton,
                      { 
                        backgroundColor: themeColors.background, 
                        borderColor: themeColors.border 
                      }
                    ]}
                    onPress={() => onMessage?.(appointment)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
                    <Text style={[styles.actionButtonText, { color: themeColors.text }]}>
                      Message
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.actionButton, 
                    styles.fullWidthButton,
                    { 
                      backgroundColor: themeColors.background, 
                      borderColor: themeColors.border 
                    }
                  ]}
                  onPress={() => onMessage?.(appointment)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
                  <Text style={[styles.actionButtonText, { color: themeColors.text }]}>
                    Message Doctor
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    width: '100%',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    borderWidth: 1,
  },
  pastCard: {
    opacity: 0.75,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  doctorInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
  },
  doctorDetails: {
    marginLeft: 16,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  specialty: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 20,
  },
  pastText: {
    opacity: 0.7,
  },
  dateTimeRow: {
    paddingTop: 20,
    flexDirection: 'row',
    marginStart: -70,
    gap: 16,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusColumn: {
    alignItems: 'flex-end',
    gap: 8,
    marginLeft: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionButton: {
    flex: 1,
    borderColor: 'transparent',
    shadowOpacity: 0.2,
    elevation: 3,
  },
  secondaryActionButton: {
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  actionButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  primaryActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  // Legacy styles (kept for compatibility)
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badgeVideo: {
    backgroundColor: '#e0f2fe',
  },
  badgeInPerson: {
    backgroundColor: '#dcfce7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  badgeConfirmed: {
    backgroundColor: '#ecfdf5',
  },
  badgePending: {
    backgroundColor: '#fff7ed',
  },
  badgeCompleted: {
    backgroundColor: '#f3f4f6',
  },
});

export default AppointmentCard;