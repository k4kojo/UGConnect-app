import { appointmentAPI, chatAPI, doctorAPI, labResultsAPI, medicalRecordsAPI, notificationsAPI, prescriptionsAPI } from './api.js';

class DoctorDashboardService {
  async getDoctorDashboardStats() {
    try {
      // Fetch doctor's appointments (no need to pass doctorId - backend filters automatically)
      const appointmentsResponse = await appointmentAPI.getAll();
      const appointments = appointmentsResponse.data || [];
      
      // Get today's date
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      // Filter appointments for today
      const todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === todayStr;
      });
      
      // Count appointments by status for today
      const todayStats = {
        total: todayAppointments.length,
        completed: todayAppointments.filter(apt => apt.status === 'completed').length,
        pending: todayAppointments.filter(apt => apt.status === 'pending').length,
        confirmed: todayAppointments.filter(apt => apt.status === 'confirmed').length,
        inProgress: todayAppointments.filter(apt => apt.status === 'in-progress').length,
      };

      // Get doctor's profile information (no need to pass doctorId - backend filters automatically)
      const doctorProfileResponse = await doctorAPI.getAll();
      const doctorProfile = doctorProfileResponse.data?.[0] || {};

      // Count total patients (unique patients from appointments)
      const uniquePatients = new Set(appointments.map(apt => apt.patientId));
      const totalPatients = uniquePatients.size;

      // Get recent medical records count (need to get from all patients the doctor has seen)
      let medicalRecords = [];
      try {
        // Since medical records are patient-specific, we'll get them for all patients the doctor has appointments with
        for (const patientId of uniquePatients) {
          const medicalRecordsResponse = await medicalRecordsAPI.getAll(patientId, { limit: 10 });
          if (medicalRecordsResponse.data) {
            medicalRecords.push(...medicalRecordsResponse.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch medical records:', err);
      }

      // Get recent lab results count (need to get from all patients the doctor has seen)
      let labResults = [];
      try {
        // Since lab results are patient-specific, we'll get them for all patients the doctor has appointments with
        for (const patientId of uniquePatients) {
          const labResultsResponse = await labResultsAPI.getAll(patientId, { limit: 10 });
          if (labResultsResponse.data) {
            labResults.push(...labResultsResponse.data);
          }
        }
      } catch (err) {
        console.warn('Could not fetch lab results:', err);
      }

      // Get recent prescriptions count (use doctor-specific endpoint)
      const prescriptionsResponse = await prescriptionsAPI.getDoctorPrescriptions();
      const prescriptions = prescriptionsResponse.data || [];

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
        }
      };
    } catch (error) {
      console.error('Error fetching doctor dashboard stats:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch doctor dashboard statistics'
      };
    }
  }

  async getDoctorRecentActivity() {
    try {
      // Fetch recent appointments for the doctor (no need to pass doctorId - backend filters automatically)
      const appointmentsResponse = await appointmentAPI.getAll({ 
        limit: 10,
        sort: 'appointmentDate',
        order: 'desc'
      });
      const appointments = appointmentsResponse.data || [];

      // Fetch recent notifications (user route for doctor's notifications)
      let notifications = [];
      try {
        const notificationsResponse = await notificationsAPI.getUser({ limit: 10 });
        notifications = notificationsResponse.data || [];
      } catch (err) {
        console.warn('Could not fetch notifications:', err);
      }

      // Fetch recent medical records (need to get from all patients the doctor has seen)
      let medicalRecords = [];
      try {
        const uniquePatients = new Set(appointments.map(apt => apt.patientId));
        for (const patientId of uniquePatients) {
          const medicalRecordsResponse = await medicalRecordsAPI.getAll(patientId, { limit: 5 });
          if (medicalRecordsResponse.data) {
            medicalRecords.push(...medicalRecordsResponse.data);
          }
        }
        // Sort by date and take the most recent 5
        medicalRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        medicalRecords = medicalRecords.slice(0, 5);
      } catch (err) {
        console.warn('Could not fetch medical records:', err);
      }

      // Fetch recent lab results (need to get from all patients the doctor has seen)
      let labResults = [];
      try {
        const uniquePatients = new Set(appointments.map(apt => apt.patientId));
        for (const patientId of uniquePatients) {
          const labResultsResponse = await labResultsAPI.getAll(patientId, { limit: 5 });
          if (labResultsResponse.data) {
            labResults.push(...labResultsResponse.data);
          }
        }
        // Sort by date and take the most recent 5
        labResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        labResults = labResults.slice(0, 5);
      } catch (err) {
        console.warn('Could not fetch lab results:', err);
      }

      return {
        success: true,
        data: {
          recentAppointments: appointments,
          recentNotifications: notifications,
          recentMedicalRecords: medicalRecords,
          recentLabResults: labResults,
        }
      };
    } catch (error) {
      console.error('Error fetching doctor recent activity:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch recent activity'
      };
    }
  }

  async getDoctorAppointments(doctorId, filters = {}) {
    try {
      const response = await appointmentAPI.getAll(filters);
      
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch appointments'
      };
    }
  }

  async getDoctorPatients() {
    try {
      // Get all appointments for the doctor to extract unique patients
      const appointmentsResponse = await appointmentAPI.getAll();
      const appointments = appointmentsResponse.data || [];
      
      // Extract unique patients
      const uniquePatients = appointments.reduce((acc, apt) => {
        if (!acc.find(p => p.patientId === apt.patientId)) {
          acc.push({
            patientId: apt.patientId,
            patientName: apt.patientName || `${apt.patientFirstName || ''} ${apt.patientLastName || ''}`.trim(),
            lastAppointment: apt.appointmentDate,
            totalAppointments: appointments.filter(a => a.patientId === apt.patientId).length
          });
        }
        return acc;
      }, []);

      return {
        success: true,
        data: uniquePatients
      };
    } catch (error) {
      console.error('Error fetching doctor patients:', error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch patients'
      };
    }
  }

  async getPrescriptions() {
    try {
      const response = await prescriptionsAPI.getDoctorPrescriptions();
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
      const response = await notificationsAPI.getUser();
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
}

export const doctorDashboardService = new DoctorDashboardService();
