import { appointmentAPI, chatAPI, doctorAPI, labResultsAPI, notificationsAPI, patientsAPI, paymentsAPI, prescriptionsAPI, reportsAPI, settingsAPI, userAPI, userSettingsAPI } from './api.js';

class DashboardService {
  async getDashboardStats() {
    try {
      // Fetch all users to get role-based counts
      const usersResponse = await userAPI.getAllUsers();
      const users = usersResponse.data || [];
      
      // Count users by role
      const roleStats = {
        doctor: users.filter(user => user.role === 'doctor').length,
        patient: users.filter(user => user.role === 'patient').length,
        nurse: users.filter(user => user.role === 'nurse').length,
        pharmacist: users.filter(user => user.role === 'pharmacist').length,
        laboratorist: users.filter(user => user.role === 'laboratorist').length,
        accountant: users.filter(user => user.role === 'accountant').length,
      };

      // Fetch appointments for statistics
      const appointmentsResponse = await appointmentAPI.getAll();
      const appointments = appointmentsResponse.data || [];
      
      // Count appointments by status
      const appointmentStats = {
        total: appointments.length,
        pending: appointments.filter(apt => apt.status === 'pending').length,
        confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
        completed: appointments.filter(apt => apt.status === 'completed').length,
        cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      };

      // Fetch payments for revenue statistics
      const paymentsResponse = await paymentsAPI.getAll();
      const payments = paymentsResponse.data || [];
      
      const paymentStats = {
        total: payments.length,
        completed: payments.filter(payment => payment.status === 'completed').length,
        pending: payments.filter(payment => payment.status === 'pending').length,
        totalRevenue: payments
          .filter(payment => payment.status === 'completed')
          .reduce((sum, payment) => sum + (payment.amount || 0), 0),
      };

      // Fetch notifications for recent activity (admin route first, fallback to user route on 404)
      let notifications = [];
      try {
        const notificationsResponse = await notificationsAPI.getAll();
        notifications = notificationsResponse.data || [];
      } catch (err) {
        if (err?.response?.status === 404) {
          const userNotificationsResponse = await notificationsAPI.getUser();
          notifications = userNotificationsResponse.data || [];
        } else {
          throw err;
        }
      }

      return {
        success: true,
        data: {
          roleStats,
          appointmentStats,
          paymentStats,
          recentNotifications: notifications.slice(0, 5), // Get latest 5 notifications
          totalUsers: users.length,
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch dashboard statistics'
      };
    }
  }

  async getRecentActivity() {
    try {
      // Fetch recent appointments
      const appointmentsResponse = await appointmentAPI.getAll({ limit: 10 });
      const appointments = appointmentsResponse.data || [];

      // Fetch recent payments
      const paymentsResponse = await paymentsAPI.getAll({ limit: 10 });
      const payments = paymentsResponse.data || [];

      // Fetch recent notifications (admin route first, fallback to user route on 404)
      let notifications = [];
      try {
        const notificationsResponse = await notificationsAPI.getAll({ limit: 10 });
        notifications = notificationsResponse.data || [];
      } catch (err) {
        if (err?.response?.status === 404) {
          const userNotificationsResponse = await notificationsAPI.getUser({ limit: 10 });
          notifications = userNotificationsResponse.data || [];
        } else {
          throw err;
        }
      }

      return {
        success: true,
        data: {
          recentAppointments: appointments,
          recentPayments: payments,
          recentNotifications: notifications,
        }
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch recent activity'
      };
    }
  }

  async getUsersByRole(role) {
    try {
      const response = await userAPI.getAllUsers();
      const users = response.data || [];
      
      if (role) {
        return {
          success: true,
          data: users.filter(user => user.role === role)
        };
      }
      
      return {
        success: true,
        data: users
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch users'
      };
    }
  }

  // Admin-specific methods for DataContext
  async getAdminDashboardStats() {
    return this.getDashboardStats();
  }

  async getAdminRecentActivity() {
    return this.getRecentActivity();
  }

  async getPrescriptions() {
    try {
      const response = await prescriptionsAPI.getAll();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch prescriptions'
      };
    }
  }

  async getLabResults() {
    try {
      const response = await labResultsAPI.getAll();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching lab results:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch lab results'
      };
    }
  }

  async getConsultations() {
    try {
      const response = await appointmentAPI.getAll({ status: 'in-progress' });
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching consultations:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch consultations'
      };
    }
  }

  async getNotifications() {
    try {
      const response = await notificationsAPI.getAll();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch notifications'
      };
    }
  }

  async getChatRooms() {
    try {
      const response = await chatAPI.getRooms();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch chat rooms'
      };
    }
  }

  async getChatMessages(roomId) {
    try {
      const response = await chatAPI.getMessagesByRoom(roomId);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch chat messages'
      };
    }
  }

  async getAppointments() {
    try {
      const response = await appointmentAPI.getAll();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch appointments'
      };
    }
  }

  async getDoctors() {
    try {
      const response = await userAPI.getAllUsers();
      const users = response.data || [];
      const doctors = users.filter(user => user.role === 'doctor');
      return {
        success: true,
        data: doctors
      };
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch doctors'
      };
    }
  }

  async createUserByAdmin(userData) {
    try {
      const response = await userAPI.createUserByAdmin(userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating user by admin:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to create user'
      };
    }
  }

  async getPayments() {
    try {
      const response = await paymentsAPI.getAll();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch payments'
      };
    }
  }

  async getNotices() {
    try {
      // For now, return mock data since we don't have a notices API yet
      const mockNotices = [
        {
          noticeId: '1',
          title: 'System Maintenance',
          content: 'Scheduled maintenance on Sunday at 2 AM',
          type: 'announcement',
          author: 'System Admin',
          status: 'published',
          priority: 'normal',
          targetAudience: 'all',
          createdAt: new Date().toISOString(),
          expiresAt: null
        },
        {
          noticeId: '2',
          title: 'New Feature Available',
          content: 'Video consultation feature is now available for all doctors',
          type: 'update',
          author: 'Admin',
          status: 'published',
          priority: 'high',
          targetAudience: 'doctors',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          expiresAt: null
        }
      ];
      return {
        success: true,
        data: mockNotices
      };
    } catch (error) {
      console.error('Error fetching notices:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch notices'
      };
    }
  }

  async getLanguages() {
    try {
      // For now, return mock data since we don't have a languages API yet
      const mockLanguages = [
        {
          languageId: '1',
          name: 'English',
          nativeName: 'English',
          code: 'en',
          direction: 'ltr',
          status: 'active',
          isDefault: true,
          translationProgress: 100,
          createdAt: new Date().toISOString()
        },
        {
          languageId: '2',
          name: 'French',
          nativeName: 'Français',
          code: 'fr',
          direction: 'ltr',
          status: 'active',
          isDefault: false,
          translationProgress: 75,
          createdAt: new Date().toISOString()
        },
        {
          languageId: '3',
          name: 'Spanish',
          nativeName: 'Español',
          code: 'es',
          direction: 'ltr',
          status: 'inactive',
          isDefault: false,
          translationProgress: 50,
          createdAt: new Date().toISOString()
        }
      ];
      return {
        success: true,
        data: mockLanguages
      };
    } catch (error) {
      console.error('Error fetching languages:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch languages'
      };
    }
  }

  async getBackups() {
    try {
      // For now, return mock data since we don't have a backups API yet
      const mockBackups = [
        {
          backupId: '1',
          name: 'Daily Backup - 2024-01-15',
          description: 'Automated daily backup',
          type: 'full',
          size: 1024000000, // 1GB
          status: 'completed',
          location: 'Local storage',
          compression: 'gzip',
          createdAt: new Date().toISOString(),
          notes: 'Successful backup'
        },
        {
          backupId: '2',
          name: 'Weekly Backup - 2024-01-08',
          description: 'Weekly system backup',
          type: 'incremental',
          size: 512000000, // 500MB
          status: 'completed',
          location: 'Cloud storage',
          compression: 'gzip',
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          notes: 'Backed up to cloud'
        },
        {
          backupId: '3',
          name: 'Manual Backup - 2024-01-10',
          description: 'Manual backup before update',
          type: 'full',
          size: 2048000000, // 2GB
          status: 'in_progress',
          location: 'Local storage',
          compression: 'none',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          notes: 'In progress...'
        }
      ];
      return {
        success: true,
        data: mockBackups
      };
    } catch (error) {
      console.error('Error fetching backups:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch backups'
      };
    }
  }

  async getUsers() {
    try {
      const response = await userAPI.getAllUsers();
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch users'
      };
    }
  }

  // Patients API methods
  async getPatients(params = {}) {
    try {
      const response = await patientsAPI.getAll(params);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching patients:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch patients'
      };
    }
  }

  async getPatientById(patientId) {
    try {
      const response = await patientsAPI.getById(patientId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching patient:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch patient'
      };
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      const response = await patientsAPI.update(patientId, patientData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating patient:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update patient'
      };
    }
  }

  async deletePatient(patientId) {
    try {
      await patientsAPI.delete(patientId);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting patient:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete patient'
      };
    }
  }

  // Reports API methods
  async getReports(params = {}) {
    try {
      const response = await reportsAPI.getReports(params);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch reports'
      };
    }
  }

  async generateReport(reportType, params = {}) {
    try {
      const response = await reportsAPI.generateReport(reportType, params);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to generate report'
      };
    }
  }

  async downloadReport(reportId) {
    try {
      const response = await reportsAPI.downloadReport(reportId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error downloading report:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to download report'
      };
    }
  }

  async deleteReport(reportId) {
    try {
      await reportsAPI.deleteReport(reportId);
      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting report:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to delete report'
      };
    }
  }

  // Settings API methods
  async getSystemSettings() {
    try {
      const response = await settingsAPI.getSystemSettings();
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch system settings'
      };
    }
  }

  async updateSystemSettings(settings) {
    try {
      const response = await settingsAPI.updateSystemSettings(settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating system settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update system settings'
      };
    }
  }

  async getHospitalInfo() {
    try {
      const response = await settingsAPI.getHospitalInfo();
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching hospital info:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch hospital info'
      };
    }
  }

  async updateHospitalInfo(info) {
    try {
      const response = await settingsAPI.updateHospitalInfo(info);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating hospital info:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update hospital info'
      };
    }
  }

  async getNotificationSettings() {
    try {
      const response = await settingsAPI.getNotificationSettings();
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch notification settings'
      };
    }
  }

  async updateNotificationSettings(settings) {
    try {
      const response = await settingsAPI.updateNotificationSettings(settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update notification settings'
      };
    }
  }

  // User Settings API methods
  async getUserSettings(userId) {
    try {
      const response = await userSettingsAPI.getUserSettings(userId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch user settings'
      };
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      const response = await userSettingsAPI.updateUserSettings(userId, settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating user settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update user settings'
      };
    }
  }

  async getProfileSettings(userId) {
    try {
      const response = await userSettingsAPI.getProfileSettings(userId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching profile settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch profile settings'
      };
    }
  }

  async updateProfileSettings(userId, settings) {
    try {
      const response = await userSettingsAPI.updateProfileSettings(userId, settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating profile settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update profile settings'
      };
    }
  }

  async getSecuritySettings(userId) {
    try {
      const response = await userSettingsAPI.getSecuritySettings(userId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching security settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch security settings'
      };
    }
  }

  async updateSecuritySettings(userId, settings) {
    try {
      const response = await userSettingsAPI.updateSecuritySettings(userId, settings);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating security settings:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update security settings'
      };
    }
  }

  async getNotificationPreferences(userId) {
    try {
      const response = await userSettingsAPI.getNotificationPreferences(userId);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch notification preferences'
      };
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await userSettingsAPI.updateNotificationPreferences(userId, preferences);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update notification preferences'
      };
    }
  }

  // Doctor Availability API methods
  async getDoctorAvailability(doctorId, params = {}) {
    try {
      const response = await doctorAPI.getAvailability(doctorId, params);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch doctor availability'
      };
    }
  }

  async updateDoctorAvailability(availabilityId, availabilityData) {
    try {
      const response = await doctorAPI.updateAvailability(availabilityId, availabilityData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating doctor availability:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to update doctor availability'
      };
    }
  }
}

export const dashboardService = new DashboardService();
