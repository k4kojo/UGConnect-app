import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { medicationService } from './medicationService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface MedicationNotificationData {
  medicationId: string;
  medicationName: string;
  dosage: string;
  type: 'reminder' | 'missed';
  [key: string]: unknown; // Index signature to make it compatible with Record<string, unknown>
}

class MedicationNotificationService {
  private notificationListener: Notifications.EventSubscription | null = null;
  private responseListener: Notifications.EventSubscription | null = null;

  constructor() {
    this.setupNotificationListeners();
  }

  /**
   * Initialize notification permissions and listeners
   */
  async initialize() {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medication-reminders', {
          name: 'Medication Reminders',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Setup notification listeners for handling taps and responses
   */
  private setupNotificationListeners() {
    // Handle notification received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
      }
    );

    // Handle notification tap
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const rawData = response.notification.request.content.data;
        const data = this.validateNotificationData(rawData);
        if (data) {
          this.handleNotificationTap(data);
        } else {
          console.warn('Invalid notification data received:', rawData);
        }
      }
    );
  }

  /**
   * Validate and convert raw notification data to MedicationNotificationData
   */
  private validateNotificationData(rawData: { [key: string]: unknown; }): MedicationNotificationData | null {
    try {
      // Check if all required properties exist and have correct types
      if (
        typeof rawData.medicationId === 'string' &&
        typeof rawData.medicationName === 'string' &&
        typeof rawData.dosage === 'string' &&
        typeof rawData.type === 'string' &&
        (rawData.type === 'reminder' || rawData.type === 'missed')
      ) {
        return {
          medicationId: rawData.medicationId,
          medicationName: rawData.medicationName,
          dosage: rawData.dosage,
          type: rawData.type as 'reminder' | 'missed',
        };
      }
      return null;
    } catch (error) {
      console.error('Error validating notification data:', error);
      return null;
    }
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   */
  private handleNotificationTap(data: MedicationNotificationData) {
    try {
      if (data.medicationId) {
        // Navigate to medication log screen
        router.push({
          pathname: '/medication/log/[id]' as any,
          params: {
            id: data.medicationId,
            name: data.medicationName,
            dosage: data.dosage,
          }
        });
      } else {
        // Navigate to medications list
        router.push('/medication');
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  /**
   * Schedule a medication reminder notification
   */
  async scheduleMedicationReminder(
    medicationId: string,
    medicationName: string,
    dosage: string,
    reminderTime: Date,
    frequency: string
  ) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `Time to take ${medicationName} (${dosage})`,
          data: {
            medicationId,
            medicationName,
            dosage,
            type: 'reminder',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminderTime,
        },
      });

      console.log(`Scheduled notification ${notificationId} for ${medicationName} at ${reminderTime}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
      return null;
    }
  }

  /**
   * Schedule multiple reminders for a medication based on frequency
   */
  async scheduleMedicationReminders(
    medicationId: string,
    medicationName: string,
    dosage: string,
    frequency: string,
    startDate: Date,
    endDate?: Date
  ) {
    try {
      const reminderTimes = this.calculateReminderTimes(frequency, startDate, endDate);
      const notificationIds: string[] = [];

      for (const reminderTime of reminderTimes) {
        const notificationId = await this.scheduleMedicationReminder(
          medicationId,
          medicationName,
          dosage,
          reminderTime,
          frequency
        );
        
        if (notificationId) {
          notificationIds.push(notificationId);
        }
      }

      return notificationIds;
    } catch (error) {
      console.error('Error scheduling medication reminders:', error);
      return [];
    }
  }

  /**
   * Calculate reminder times based on frequency
   */
  private calculateReminderTimes(
    frequency: string,
    startDate: Date,
    endDate?: Date
  ): Date[] {
    const reminderTimes: Date[] = [];
    const lowerFreq = frequency.toLowerCase();
    
    // Extract number from frequency
    const match = lowerFreq.match(/(\d+)/);
    const timesPerDay = match ? parseInt(match[1]) : 1;
    
    // Default time slots based on frequency
    const timeSlots = {
      1: ['08:00'], // Once daily - morning
      2: ['08:00', '20:00'], // Twice daily - morning and evening
      3: ['08:00', '14:00', '20:00'], // Three times - morning, afternoon, evening
      4: ['08:00', '12:00', '16:00', '20:00'], // Four times
      5: ['08:00', '11:00', '14:00', '17:00', '20:00'], // Five times
      6: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'], // Six times
    };
    
    const dailyTimes = timeSlots[Math.min(timesPerDay, 6) as keyof typeof timeSlots] || timeSlots[1];
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days
    
    // Generate reminders for each day in the range
    for (let currentDate = new Date(start); currentDate <= end; currentDate.setDate(currentDate.getDate() + 1)) {
      dailyTimes.forEach(timeString => {
        const [hours, minutes] = timeString.split(':').map(Number);
        const reminderTime = new Date(currentDate);
        reminderTime.setHours(hours, minutes, 0, 0);
        
        // Only add future reminders
        if (reminderTime > new Date()) {
          reminderTimes.push(new Date(reminderTime));
        }
      });
    }
    
    return reminderTimes;
  }

  /**
   * Cancel all notifications for a specific medication
   */
  async cancelMedicationNotifications(medicationId: string) {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const medicationNotifications = scheduledNotifications.filter(
        notification => {
          const data = this.validateNotificationData(notification.content.data);
          return data && data.medicationId === medicationId;
        }
      );

      for (const notification of medicationNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }

      console.log(`Cancelled ${medicationNotifications.length} notifications for medication ${medicationId}`);
    } catch (error) {
      console.error('Error cancelling medication notifications:', error);
    }
  }

  /**
   * Send immediate notification for missed medication
   */
  async sendMissedMedicationNotification(
    medicationId: string,
    medicationName: string,
    dosage: string
  ) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Missed Medication',
          body: `You missed your ${medicationName} (${dosage}). Tap to log it now.`,
          data: {
            medicationId,
            medicationName,
            dosage,
            type: 'missed',
          },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending missed medication notification:', error);
    }
  }

  /**
   * Get upcoming medication reminders
   */
  async getUpcomingReminders() {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      const medicationReminders = scheduledNotifications
        .filter(notification => {
          const data = this.validateNotificationData(notification.content.data);
          return data && data.type === 'reminder';
        })
        .map(notification => {
          const data = this.validateNotificationData(notification.content.data);
          return {
            id: notification.identifier,
            medicationId: data!.medicationId,
            medicationName: data!.medicationName,
            dosage: data!.dosage,
            scheduledTime: notification.trigger && 'date' in notification.trigger 
              ? new Date(notification.trigger.date) 
              : null,
          };
        })
        .filter(reminder => reminder.scheduledTime && reminder.scheduledTime > new Date())
        .sort((a, b) => {
          if (!a.scheduledTime || !b.scheduledTime) return 0;
          return a.scheduledTime.getTime() - b.scheduledTime.getTime();
        });

      return medicationReminders;
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  }

  /**
   * Sync local notifications with server reminders
   */
  async syncWithServerReminders() {
    try {
      // Get server reminders
      const serverReminders = await medicationService.getUpcomingReminders();
      
      // Get local notifications
      const localReminders = await this.getUpcomingReminders();
      
      // Cancel all existing medication notifications
      for (const localReminder of localReminders) {
        await Notifications.cancelScheduledNotificationAsync(localReminder.id);
      }
      
      // Schedule new notifications based on server data
      for (const serverReminder of serverReminders) {
        const reminderTime = new Date(serverReminder.remindAt);
        if (reminderTime > new Date()) {
          // We need to get medication details for this reminder
          // This is a simplified approach - in practice you might want to batch this
          try {
            const medicationResponse = await medicationService.getMedicationById(serverReminder.medicationId);
            const medication = medicationResponse.data;
            
            await this.scheduleMedicationReminder(
              medication.id,
              medication.name,
              medication.dosage,
              reminderTime,
              medication.frequency
            );
          } catch (error) {
            console.warn(`Failed to schedule notification for medication ${serverReminder.medicationId}:`, error);
          }
        }
      }
      
      console.log(`Synced ${serverReminders.length} reminders with server`);
    } catch (error) {
      console.error('Error syncing with server reminders:', error);
    }
  }

  /**
   * Clean up notification listeners
   */
  cleanup() {
    if (this.notificationListener) {
      this.notificationListener.remove();
      this.notificationListener = null;
    }
    if (this.responseListener) {
      this.responseListener.remove();
      this.responseListener = null;
    }
  }
}

export const medicationNotificationService = new MedicationNotificationService();
