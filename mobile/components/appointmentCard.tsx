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
};

const AppointmentCard: React.FC<Props> = ({ items, onJoinCall, onMessage, showActions = true }) => {
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
              backgroundColor: themeColors.subCard,
              borderColor: themeColors.border 
            }
          ]}
        >
          <View style={styles.headerRow}>
            <Avatar 
              imageUrl={appointment.imageUrl} 
              fullName={appointment.doctorName} 
              size={55} 
              border
              containerStyle={{ backgroundColor: Colors.brand.avatarBg, borderColor: Colors.brand.avatarBg }} 
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.doctorName, { color: themeColors.text }]}>
                {appointment.doctorName}
              </Text>
              <Text style={[styles.specialty, { color: themeColors.subText }]}>
                {appointment.specialty}
              </Text>
            </View>
            <View style={styles.badgeColumn}>
              <View
                style={[
                  styles.badge,
                  appointment.type === 'Video Call' ? styles.badgeVideo : styles.badgeInPerson,
                ]}
              >
                <Ionicons 
                  name={appointment.type === 'Video Call' ? "videocam" : "person"} 
                  size={14} 
                  color={brandColors.primary}
                  style={{ marginRight: 4 }} 
                />
                <Text style={[styles.badgeText, { color: brandColors.primary }]}>
                  {appointment.type === 'Video Call' ? 'Video Call' : 'In-Person'}
                </Text>
              </View>
              {appointment.status && (
                <View
                  style={[
                    styles.badge,
                    appointment.status === 'confirmed' ? styles.badgeConfirmed : styles.badgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          appointment.status === 'confirmed'
                            ? themeColors.success
                            : themeColors.warning,
                      },
                    ]}
                  >
                    {appointment.status}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.datetimeContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="calendar-outline" size={16} color={themeColors.subText} />
                <Text style={[styles.date, { color: themeColors.subText }]}>
                  {appointment.date}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name="time-outline" size={16} color={themeColors.subText} />
                <Text style={[styles.time, { color: themeColors.subText }]}>
                  {appointment.time}
                </Text>
              </View>
            </View>
          </View>

          {showActions && (
            <View style={styles.actionSection}>
              {appointment.type === 'Video Call' ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.button, 
                      styles.primaryButton, 
                      styles.actionButton,
                      { backgroundColor: brandColors.primary }
                    ]}
                    onPress={() => onJoinCall?.(appointment)}
                  >
                    <Ionicons name="videocam-outline" size={18} color="#fff" />
                    <Text style={styles.primaryButtonText}>Join Call</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button, 
                      styles.actionButton,
                      { borderColor: themeColors.border, backgroundColor: themeColors.border }
                    ]}
                    onPress={() => onMessage?.(appointment)}
                  >
                    <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
                    <Text style={[styles.buttonText, { color: themeColors.text }]}>
                      Message
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button, 
                    styles.fullWidthButton,
                    { borderColor: themeColors.border }
                  ]}
                  onPress={() => onMessage?.(appointment)}
                >
                  <Ionicons name="chatbubble-outline" size={18} color={themeColors.text} />
                  <Text style={[styles.buttonText, { color: themeColors.text }]}>
                    Message
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
    paddingVertical: 10,
    width: '100%',
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  // Avatar-specific styles removed in favor of shared Avatar component
  infoSection: {
    marginBottom: 16,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    marginBottom: 8,
  },
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
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  badgeConfirmed: {
    backgroundColor: '#ecfdf5',
  },
  badgePending: {
    backgroundColor: '#fff7ed',
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  date: {
    fontSize: 14,
  },
  time: {
    fontSize: 14,
  },
  actionSection: {
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionButton: {
    flex: 0.48,
  },
  primaryButton: {
    borderColor: 'transparent',
  },
  fullWidthButton: {
    flex: 1,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 14,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
});

export default AppointmentCard;