import apiCache, { CACHE_TTL, getCacheKey } from "../utils/cache.js";
import {
  appointmentAPI,
  availabilityAPI,
  chatAPI,
  doctorAPI,
  labResultsAPI,
  medicalRecordsAPI,
  notificationsAPI,
  patientsAPI,
  paymentsAPI,
  prescriptionsAPI,
  reportsAPI,
  settingsAPI,
  userAPI,
  userSettingsAPI,
} from "./api.js";
import labResultsService from "./labResultsService.js";

class DashboardService {
  async getDashboardStats() {
    try {
      // Fetch all users to get role-based counts
      const usersResponse = await userAPI.getAllUsers();
      const users = usersResponse.data || [];

      // Count users by role
      const roleStats = {
        doctor: users.filter((user) => user.role === "doctor").length,
        patient: users.filter((user) => user.role === "patient").length,
        nurse: users.filter((user) => user.role === "nurse").length,
        pharmacist: users.filter((user) => user.role === "pharmacist").length,
        laboratorist: users.filter((user) => user.role === "laboratorist")
          .length,
        accountant: users.filter((user) => user.role === "accountant").length,
      };

      // Fetch appointments for statistics
      const appointmentsResponse = await appointmentAPI.getAll();
      const appointments = appointmentsResponse.data || [];

      // Count appointments by status
      const appointmentStats = {
        total: appointments.length,
        pending: appointments.filter((apt) => apt.status === "pending").length,
        confirmed: appointments.filter((apt) => apt.status === "confirmed")
          .length,
        completed: appointments.filter((apt) => apt.status === "completed")
          .length,
        cancelled: appointments.filter((apt) => apt.status === "cancelled")
          .length,
      };

      // Fetch payments for revenue statistics
      const paymentsResponse = await paymentsAPI.getAll();
      const payments = paymentsResponse.data || [];

      const paymentStats = {
        total: payments.length,
        completed: payments.filter((payment) => payment.status === "completed")
          .length,
        pending: payments.filter((payment) => payment.status === "pending")
          .length,
        totalRevenue: payments
          .filter((payment) => payment.status === "completed")
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
        },
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch dashboard statistics",
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
        const notificationsResponse = await notificationsAPI.getAll({
          limit: 10,
        });
        notifications = notificationsResponse.data || [];
      } catch (err) {
        if (err?.response?.status === 404) {
          const userNotificationsResponse = await notificationsAPI.getUser({
            limit: 10,
          });
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
        },
      };
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch recent activity",
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
          data: users.filter((user) => user.role === role),
        };
      }

      return {
        success: true,
        data: users,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch users",
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

  // Doctor-specific methods (consolidated from doctorDashboardService)

  async getDoctorDashboardStats(doctorId) {
    try {
      const t0 = Date.now();
      // Load core resources in parallel
      const [appointmentsRes, doctorProfileRes, prescriptionsRes] =
        await Promise.allSettled([
          appointmentAPI.getAll({ doctorId, limit: 200 }),
          doctorAPI.getAll({ limit: 1 }),
          prescriptionsAPI.getDoctorPrescriptions(),
        ]);

      const appointments =
        appointmentsRes.status === "fulfilled"
          ? appointmentsRes.value.data || []
          : [];

      // Today stats
      const today = new Date();
      const todayStr = today.toISOString().split("T")[0];
      const todayAppointments = appointments.filter((apt) => {
        try {
          const aptDate = new Date(apt.appointmentDate)
            .toISOString()
            .split("T")[0];
          return aptDate === todayStr;
        } catch {
          return false;
        }
      });

      const todayStats = {
        total: todayAppointments.length,
        completed: todayAppointments.filter((apt) => apt.status === "completed")
          .length,
        pending: todayAppointments.filter((apt) => apt.status === "pending")
          .length,
        confirmed: todayAppointments.filter((apt) => apt.status === "confirmed")
          .length,
        inProgress: todayAppointments.filter(
          (apt) => apt.status === "in-progress"
        ).length,
      };

      const doctorProfile =
        doctorProfileRes.status === "fulfilled"
          ? doctorProfileRes.value.data?.[0] || {}
          : {};

      // Unique patients with sensible limit
      const uniquePatients = Array.from(
        new Set(appointments.map((apt) => apt.patientId).filter(Boolean))
      );
      const totalPatients = uniquePatients.length;
      const limitedPatients = uniquePatients.slice(0, 10);

      // Fetch medical records and lab results in parallel per patient with limits
      let medicalRecords = [];
      let labResults = [];
      try {
        const medPromises = limitedPatients.map((patientId) =>
          medicalRecordsAPI
            .getAll(patientId, { limit: 5 })
            .then((r) => r.data || [])
            .catch(() => [])
        );
        const labPromises = limitedPatients.map((patientId) =>
          labResultsAPI
            .getAll(patientId, { limit: 5 })
            .then((r) => r.data || [])
            .catch(() => [])
        );

        const [medSettled, labSettled] = await Promise.all([
          Promise.allSettled(medPromises),
          Promise.allSettled(labPromises),
        ]);

        medicalRecords = medSettled.flatMap((res) =>
          res.status === "fulfilled" ? res.value : []
        );
        labResults = labSettled.flatMap((res) =>
          res.status === "fulfilled" ? res.value : []
        );
      } catch (err) {
        console.warn("DashboardService: doctor parallel fetch warning:", err);
      }

      const prescriptions =
        prescriptionsRes.status === "fulfilled"
          ? prescriptionsRes.value.data || []
          : [];

      const t1 = Date.now();
      console.log(
        `DashboardService: getDoctorDashboardStats completed in ${
          t1 - t0
        }ms (appointments: ${appointments.length}, patients: ${
          uniquePatients.length
        }, MR: ${medicalRecords.length}, LR: ${labResults.length})`
      );

      return {
        success: true,
        data: {
          todayStats,
          totalPatients,
          totalAppointments: appointments.length,
          totalMedicalRecords: medicalRecords.length,
          totalLabResults: labResults.length,
          totalPrescriptions: prescriptions.length,
          doctorProfile,
          todayAppointments,
        },
      };
    } catch (error) {
      console.error("Error fetching doctor dashboard stats:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch doctor dashboard statistics",
      };
    }
  }

  async getDoctorRecentActivity(doctorId) {
    try {
      const t0 = Date.now();
      const [appointmentsRes, notificationsRes] = await Promise.allSettled([
        appointmentAPI.getAll({ doctorId, limit: 20, sort: 'appointmentDate', order: 'desc' }),
        notificationsAPI.getUser({ limit: 10 }),
      ]);

      const appointments =
        appointmentsRes.status === 'fulfilled' ? appointmentsRes.value.data || [] : [];
      const notifications =
        notificationsRes.status === 'fulfilled' ? notificationsRes.value.data || [] : [];

      const uniquePatients = Array.from(
        new Set(appointments.map((apt) => apt.patientId).filter(Boolean))
      ).slice(0, 5);

      let medicalRecords = [];
      let labResults = [];
      try {
        const medPromises = uniquePatients.map((patientId) =>
          medicalRecordsAPI
            .getAll(patientId, { limit: 5 })
            .then((r) => r.data || [])
            .catch(() => [])
        );
        const labPromises = uniquePatients.map((patientId) =>
          labResultsAPI
            .getAll(patientId, { limit: 5 })
            .then((r) => r.data || [])
            .catch(() => [])
        );

        const [medSettled, labSettled] = await Promise.all([
          Promise.allSettled(medPromises),
          Promise.allSettled(labPromises),
        ]);

        medicalRecords = medSettled.flatMap((res) => (res.status === 'fulfilled' ? res.value : []));
        labResults = labSettled.flatMap((res) => (res.status === 'fulfilled' ? res.value : []));

        medicalRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        labResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        medicalRecords = medicalRecords.slice(0, 5);
        labResults = labResults.slice(0, 5);
      } catch (err) {
        console.warn('DashboardService: doctor recent activity parallel warning:', err);
      }

      const t1 = Date.now();
      console.log(
        `DashboardService: getDoctorRecentActivity in ${t1 - t0}ms (appointments: ${
          appointments.length
        }, MR: ${medicalRecords.length}, LR: ${labResults.length})`
      );

      return {
        success: true,
        data: {
          recentAppointments: appointments,
          recentNotifications: notifications,
          recentMedicalRecords: medicalRecords,
          recentLabResults: labResults,
        },
      };
    } catch (error) {
      console.error('Error fetching doctor recent activity:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch recent activity',
      };
    }
  }

  async getDoctorAppointments(doctorId, filters = {}) {
    try {
      const response = await appointmentAPI.getAll({ doctorId, ...filters });
      return { success: true, data: response.data || [] };
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch appointments',
      };
    }
  }

  async getDoctorPatients(doctorId) {
    try {
      const appointmentsResponse = await appointmentAPI.getAll({ doctorId, limit: 500 });
      const appointments = appointmentsResponse.data || [];
      const uniquePatients = appointments.reduce((acc, apt) => {
        if (!acc.find((p) => p.patientId === apt.patientId)) {
          acc.push({
            patientId: apt.patientId,
            firstName: apt.patientFirstName || "",
            lastName: apt.patientLastName || "",
            email: apt.patientEmail || "",
            phoneNumber: apt.patientPhoneNumber || "",
            lastAppointment: apt.appointmentDate,
            appointmentCount: appointments.filter(
              (a) => a.patientId === apt.patientId
            ).length,
            recentReason: apt.reasonForVisit || "",
          });
        }
        return acc;
      }, []);

      return { success: true, data: uniquePatients };
    } catch (error) {
      console.error("Error fetching doctor patients:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch patients",
      };
    }
  }

  async getDoctorPrescriptions(userId, forceRefresh = false) {
    const cacheKey = getCacheKey.prescriptions(userId, "doctor");
    if (!forceRefresh) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        console.log("Returning cached doctor prescriptions data");
        return { success: true, data: cachedData, fromCache: true };
      }
    }
    try {
      const response = await prescriptionsAPI.getDoctorPrescriptions();
      const prescriptions = response.data || [];
      apiCache.set(cacheKey, prescriptions, CACHE_TTL.prescriptions);
      return { success: true, data: prescriptions, fromCache: false };
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      let errorMessage = "Failed to fetch prescriptions";
      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. The server may be busy. Please try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      return { success: false, error: errorMessage };
    }
  }

  async createDirectPrescription(prescriptionData) {
    try {
      const response = await prescriptionsAPI.createDirectPrescription(
        prescriptionData
      );
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("Error creating direct prescription:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create prescription",
      };
    }
  }

  async createAppointmentPrescription(prescriptionData) {
    try {
      const response = await prescriptionsAPI.createAppointmentPrescription(
        prescriptionData
      );
      return { success: true, data: response.data || response };
    } catch (error) {
      console.error("Error creating appointment prescription:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create prescription",
      };
    }
  }

  async getPrescriptions(userId = "admin", forceRefresh = false) {
    const cacheKey = getCacheKey.prescriptions(userId, "admin");

    // Check cache first unless force refresh is requested
    if (!forceRefresh) {
      const cachedData = apiCache.get(cacheKey);
      if (cachedData) {
        console.log("Returning cached prescriptions data");
        return {
          success: true,
          data: cachedData,
          fromCache: true,
        };
      }
    }

    try {
      const response = await prescriptionsAPI.getAll({ limit: 100 }); // Get more records per page

      // Handle both old format (array) and new format (object with data and pagination)
      const prescriptions = response.data?.data || response.data || [];

      // Cache the successful response
      apiCache.set(cacheKey, prescriptions, CACHE_TTL.prescriptions);

      return {
        success: true,
        data: prescriptions,
        pagination: response.data?.pagination || null,
        fromCache: false,
      };
    } catch (error) {
      console.error("Error fetching prescriptions:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to fetch prescriptions";
      if (error.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. The server may be busy. Please try again.";
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getLabResults() {
    try {
      // Fetch all lab results
      const labResults = await labResultsService.getAllLabResults();

      // Fetch all users to get patient and doctor names
      const usersResponse = await userAPI.getAllUsers();
      const users = usersResponse.data || [];

      // Create a map of user IDs to user data for quick lookup
      const userMap = users.reduce((acc, user) => {
        acc[user.userId] = user;
        return acc;
      }, {});

      // Enhance lab results with patient and doctor information
      const enhancedLabResults = labResults.map((result) => {
        const patient = userMap[result.patientId];
        const orderedBy = userMap[result.orderedBy];

        return {
          ...result,
          patientName: patient
            ? `${patient.firstName} ${patient.lastName}`
            : "Unknown Patient",
          patientId: result.patientId,
          orderedByName: orderedBy
            ? `${orderedBy.firstName} ${orderedBy.lastName}`
            : "Unknown Staff",
          orderedByRole: orderedBy ? orderedBy.role : "Unknown",
          testName: result.testName || result.test || "Unknown Test",
          testType: result.testType || result.type || "Laboratory",
          orderedDate: result.orderedDate || result.createdAt || result.date,
          status: result.status || "pending",
        };
      });

      return {
        success: true,
        data: enhancedLabResults,
      };
    } catch (error) {
      console.error("Error fetching lab results:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch lab results",
      };
    }
  }

  async getNotifications(userRole = "admin") {
    try {
      console.log("DashboardService: Fetching notifications from API...");
      const startTime = Date.now();

      // Use appropriate API endpoint based on user role
      const response =
        userRole === "admin"
          ? await notificationsAPI.getAll()
          : await notificationsAPI.getUser();

      const endTime = Date.now();
      console.log(
        `DashboardService: Notifications fetch completed in ${
          endTime - startTime
        }ms, received ${response.data?.length || 0} notifications`
      );

      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("DashboardService: Error fetching notifications:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      });
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch notifications",
      };
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await notificationsAPI.markAsRead(notificationId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to mark notification as read",
      };
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await notificationsAPI.markAllAsRead();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to mark all notifications as read",
      };
    }
  }

  async deleteNotification(notificationId) {
    try {
      await notificationsAPI.delete(notificationId);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting notification:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete notification",
      };
    }
  }

  async getChatRooms() {
    try {
      const response = await chatAPI.getRooms();
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch chat rooms",
      };
    }
  }

  async getChatMessages(roomId) {
    try {
      const response = await chatAPI.getMessagesByRoom(roomId);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch chat messages",
      };
    }
  }

  async getAppointments() {
    try {
      console.log("DashboardService: Fetching appointments from API...");
      const startTime = Date.now();
      const response = await appointmentAPI.getAll();
      const endTime = Date.now();
      console.log(
        `DashboardService: Appointments fetch completed in ${
          endTime - startTime
        }ms, received ${response.data?.length || 0} appointments`
      );

      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("DashboardService: Error fetching appointments:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          baseURL: error.config?.baseURL,
          timeout: error.config?.timeout,
        },
      });
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch appointments",
      };
    }
  }

  async getDoctors() {
    try {
      const response = await userAPI.getAllUsers();
      const users = response.data || [];
      const doctors = users.filter((user) => user.role === "doctor");
      return {
        success: true,
        data: doctors,
      };
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch doctors",
      };
    }
  }

  async createUserByAdmin(userData) {
    try {
      const response = await userAPI.createUserByAdmin(userData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating user by admin:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create user",
      };
    }
  }

  async getPayments() {
    try {
      const response = await paymentsAPI.getAll();
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching payments:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch payments",
      };
    }
  }

  async getNotices() {
    try {
      // For now, return mock data since we don't have a notices API yet
      const mockNotices = [
        {
          noticeId: "1",
          title: "System Maintenance",
          content: "Scheduled maintenance on Sunday at 2 AM",
          type: "announcement",
          author: "System Admin",
          status: "published",
          priority: "normal",
          targetAudience: "all",
          createdAt: new Date().toISOString(),
          expiresAt: null,
        },
        {
          noticeId: "2",
          title: "New Feature Available",
          content:
            "Video consultation feature is now available for all doctors",
          type: "update",
          author: "Admin",
          status: "published",
          priority: "high",
          targetAudience: "doctors",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          expiresAt: null,
        },
      ];
      return {
        success: true,
        data: mockNotices,
      };
    } catch (error) {
      console.error("Error fetching notices:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch notices",
      };
    }
  }

  async getLanguages() {
    try {
      // For now, return mock data since we don't have a languages API yet
      const mockLanguages = [
        {
          languageId: "1",
          name: "English",
          nativeName: "English",
          code: "en",
          direction: "ltr",
          status: "active",
          isDefault: true,
          translationProgress: 100,
          createdAt: new Date().toISOString(),
        },
        {
          languageId: "2",
          name: "French",
          nativeName: "Français",
          code: "fr",
          direction: "ltr",
          status: "active",
          isDefault: false,
          translationProgress: 75,
          createdAt: new Date().toISOString(),
        },
        {
          languageId: "3",
          name: "Spanish",
          nativeName: "Español",
          code: "es",
          direction: "ltr",
          status: "inactive",
          isDefault: false,
          translationProgress: 50,
          createdAt: new Date().toISOString(),
        },
      ];
      return {
        success: true,
        data: mockLanguages,
      };
    } catch (error) {
      console.error("Error fetching languages:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch languages",
      };
    }
  }

  async getBackups() {
    try {
      // For now, return mock data since we don't have a backups API yet
      const mockBackups = [
        {
          backupId: "1",
          name: "Daily Backup - 2024-01-15",
          description: "Automated daily backup",
          type: "full",
          size: 1024000000, // 1GB
          status: "completed",
          location: "Local storage",
          compression: "gzip",
          createdAt: new Date().toISOString(),
          notes: "Successful backup",
        },
        {
          backupId: "2",
          name: "Weekly Backup - 2024-01-08",
          description: "Weekly system backup",
          type: "incremental",
          size: 512000000, // 500MB
          status: "completed",
          location: "Cloud storage",
          compression: "gzip",
          createdAt: new Date(Date.now() - 604800000).toISOString(),
          notes: "Backed up to cloud",
        },
        {
          backupId: "3",
          name: "Manual Backup - 2024-01-10",
          description: "Manual backup before update",
          type: "full",
          size: 2048000000, // 2GB
          status: "in_progress",
          location: "Local storage",
          compression: "none",
          createdAt: new Date(Date.now() - 432000000).toISOString(),
          notes: "In progress...",
        },
      ];
      return {
        success: true,
        data: mockBackups,
      };
    } catch (error) {
      console.error("Error fetching backups:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch backups",
      };
    }
  }

  async getUsers() {
    try {
      const response = await userAPI.getAllUsers();
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch users",
      };
    }
  }

  // Patients API methods
  async getPatients(params = {}) {
    try {
      const response = await patientsAPI.getAll(params);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching patients:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch patients",
      };
    }
  }

  async getPatientById(patientId) {
    try {
      const response = await patientsAPI.getById(patientId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching patient:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch patient",
      };
    }
  }

  async updatePatient(patientId, patientData) {
    try {
      const response = await patientsAPI.update(patientId, patientData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating patient:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update patient",
      };
    }
  }

  async deletePatient(patientId) {
    try {
      await patientsAPI.delete(patientId);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting patient:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete patient",
      };
    }
  }

  // Reports API methods
  async getReports(params = {}) {
    try {
      const response = await reportsAPI.getReports(params);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch reports",
      };
    }
  }

  async generateReport(reportType, params = {}) {
    try {
      // Convert the old generateReport format to new createReport format
      const reportData = {
        title: `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } Report`,
        type: reportType,
        content:
          params.content ||
          `This is a ${reportType} report generated with the following parameters: ${JSON.stringify(
            params,
            null,
            2
          )}`,
      };

      const response = await reportsAPI.createReport(reportData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error generating report:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to generate report",
      };
    }
  }

  async createReport(reportData) {
    try {
      const response = await reportsAPI.createReport(reportData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating report:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to create report",
      };
    }
  }

  async updateReport(reportId, reportData) {
    try {
      const response = await reportsAPI.updateReport(reportId, reportData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating report:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update report",
      };
    }
  }

  async downloadReport(reportId) {
    try {
      const response = await reportsAPI.downloadReport(reportId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error downloading report:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to download report",
      };
    }
  }

  async deleteReport(reportId) {
    try {
      await reportsAPI.deleteReport(reportId);
      return {
        success: true,
      };
    } catch (error) {
      console.error("Error deleting report:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to delete report",
      };
    }
  }

  // Settings API methods
  async getSystemSettings() {
    try {
      const response = await settingsAPI.getSystemSettings();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching system settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch system settings",
      };
    }
  }

  async updateSystemSettings(settings) {
    try {
      const response = await settingsAPI.updateSystemSettings(settings);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating system settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update system settings",
      };
    }
  }

  async getHospitalInfo() {
    try {
      const response = await settingsAPI.getHospitalInfo();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching hospital info:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch hospital info",
      };
    }
  }

  async updateHospitalInfo(info) {
    try {
      const response = await settingsAPI.updateHospitalInfo(info);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating hospital info:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update hospital info",
      };
    }
  }

  async getNotificationSettings() {
    try {
      const response = await settingsAPI.getNotificationSettings();
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching notification settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch notification settings",
      };
    }
  }

  async updateNotificationSettings(settings) {
    try {
      const response = await settingsAPI.updateNotificationSettings(settings);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating notification settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update notification settings",
      };
    }
  }

  // User Settings API methods
  async getUserSettings(userId) {
    try {
      const response = await userSettingsAPI.getUserSettings(userId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching user settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch user settings",
      };
    }
  }

  async updateUserSettings(userId, settings) {
    try {
      const response = await userSettingsAPI.updateUserSettings(
        userId,
        settings
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating user settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update user settings",
      };
    }
  }

  async getProfileSettings(userId) {
    try {
      const response = await userSettingsAPI.getProfileSettings(userId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching profile settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch profile settings",
      };
    }
  }

  async updateProfileSettings(userId, settings) {
    try {
      const response = await userSettingsAPI.updateProfileSettings(
        userId,
        settings
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating profile settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update profile settings",
      };
    }
  }

  async getSecuritySettings(userId) {
    try {
      const response = await userSettingsAPI.getSecuritySettings(userId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching security settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch security settings",
      };
    }
  }

  async updateSecuritySettings(userId, settings) {
    try {
      const response = await userSettingsAPI.updateSecuritySettings(
        userId,
        settings
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating security settings:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update security settings",
      };
    }
  }

  async getNotificationPreferences(userId) {
    try {
      const response = await userSettingsAPI.getNotificationPreferences(userId);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch notification preferences",
      };
    }
  }

  async updateNotificationPreferences(userId, preferences) {
    try {
      const response = await userSettingsAPI.updateNotificationPreferences(
        userId,
        preferences
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update notification preferences",
      };
    }
  }

  // Doctor Availability API methods
  async getDoctorAvailability(params = {}) {
    try {
      const response = await availabilityAPI.getAll(params);
      return {
        success: true,
        data: response.data || [],
      };
    } catch (error) {
      console.error("Error fetching doctor availability:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to fetch doctor availability",
      };
    }
  }

  async updateDoctorAvailability(availabilityId, availabilityData) {
    try {
      let response;
      if (availabilityId && availabilityId !== null) {
        // Update existing availability
        response = await availabilityAPI.update(
          availabilityId,
          availabilityData
        );
      } else {
        // Create new availability
        response = await availabilityAPI.create(availabilityData);
      }
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error updating doctor availability:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update doctor availability",
      };
    }
  }
}

export const dashboardService = new DashboardService();
