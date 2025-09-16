import {
  appointmentAPI,
  chatAPI,
  doctorAPI,
  labResultsAPI,
  medicalRecordsAPI,
  notificationsAPI,
  patientAPI,
  paymentsAPI,
  prescriptionsAPI,
  reviewsAPI
} from './api.js';

class DataService {
  // Appointment methods
  async getAppointments(params = {}) {
    try {
      const response = await appointmentAPI.getAll(params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch appointments' 
      };
    }
  }

  async getAppointmentById(id) {
    try {
      const response = await appointmentAPI.getById(id);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch appointment' 
      };
    }
  }

  async createAppointment(appointmentData) {
    try {
      const response = await appointmentAPI.create(appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create appointment' 
      };
    }
  }

  async updateAppointment(id, appointmentData) {
    try {
      const response = await appointmentAPI.update(id, appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to update appointment' 
      };
    }
  }

  async deleteAppointment(id) {
    try {
      await appointmentAPI.delete(id);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to delete appointment' 
      };
    }
  }

  // Doctor methods
  async getDoctors(params = {}) {
    try {
      const response = await doctorAPI.getAll(params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch doctors' 
      };
    }
  }

  async getDoctorById(id) {
    try {
      const response = await doctorAPI.getById(id);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch doctor' 
      };
    }
  }

  async getDoctorAvailability(doctorId, params = {}) {
    try {
      const response = await doctorAPI.getAvailability(doctorId, params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch doctor availability' 
      };
    }
  }

  async updateDoctorAvailability(doctorId, availabilityData) {
    try {
      const response = await doctorAPI.updateAvailability(doctorId, availabilityData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to update doctor availability' 
      };
    }
  }

  // Patient methods
  async getPatientProfile(patientId) {
    try {
      const response = await patientAPI.getProfile(patientId);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch patient profile' 
      };
    }
  }

  async updatePatientProfile(patientId, profileData) {
    try {
      const response = await patientAPI.updateProfile(patientId, profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to update patient profile' 
      };
    }
  }

  // Medical Records methods
  async getMedicalRecords(patientId, params = {}) {
    try {
      const response = await medicalRecordsAPI.getAll(patientId, params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch medical records' 
      };
    }
  }

  async getMedicalRecordById(patientId, recordId) {
    try {
      const response = await medicalRecordsAPI.getById(patientId, recordId);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch medical record' 
      };
    }
  }

  async createMedicalRecord(patientId, recordData) {
    try {
      const response = await medicalRecordsAPI.create(patientId, recordData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create medical record' 
      };
    }
  }

  // Lab Results methods
  async getLabResults(patientId, params = {}) {
    try {
      const response = await labResultsAPI.getAll(patientId, params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch lab results' 
      };
    }
  }

  async getLabResultById(patientId, resultId) {
    try {
      const response = await labResultsAPI.getById(patientId, resultId);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch lab result' 
      };
    }
  }

  async createLabResult(patientId, resultData) {
    try {
      const response = await labResultsAPI.create(patientId, resultData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create lab result' 
      };
    }
  }

  // Prescriptions methods
  async getPrescriptions(params = {}) {
    try {
      const response = await prescriptionsAPI.getAll(params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch prescriptions' 
      };
    }
  }

  async getPrescriptionById(prescriptionId) {
    try {
      const response = await prescriptionsAPI.getById(prescriptionId);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch prescription' 
      };
    }
  }

  async createPrescription(prescriptionData) {
    try {
      const response = await prescriptionsAPI.create(prescriptionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create prescription' 
      };
    }
  }

  async updatePrescription(patientId, prescriptionId, prescriptionData) {
    try {
      const response = await prescriptionsAPI.update(patientId, prescriptionId, prescriptionData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to update prescription' 
      };
    }
  }

  // Notifications methods
  async getNotifications(params = {}) {
    try {
      const response = await notificationsAPI.getAll(params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch notifications' 
      };
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await notificationsAPI.markAsRead(notificationId);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to mark notification as read' 
      };
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await notificationsAPI.markAllAsRead();
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to mark all notifications as read' 
      };
    }
  }

  // Payments methods
  async getPayments(params = {}) {
    try {
      const response = await paymentsAPI.getAll(params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch payments' 
      };
    }
  }

  async getPaymentById(id) {
    try {
      const response = await paymentsAPI.getById(id);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch payment' 
      };
    }
  }

  async createPayment(paymentData) {
    try {
      const response = await paymentsAPI.create(paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create payment' 
      };
    }
  }

  async updatePayment(id, paymentData) {
    try {
      const response = await paymentsAPI.update(id, paymentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to update payment' 
      };
    }
  }

  // Chat methods
  async getChatRooms() {
    try {
      const response = await chatAPI.getRooms();
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch chat rooms' 
      };
    }
  }

  async getChatMessages(roomId, params = {}) {
    try {
      const response = await chatAPI.getMessages(roomId, params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch chat messages' 
      };
    }
  }

  async sendChatMessage(roomId, messageData) {
    try {
      const response = await chatAPI.sendMessage(roomId, messageData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to send message' 
      };
    }
  }

  async createChatRoom(roomData) {
    try {
      const response = await chatAPI.createRoom(roomData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create chat room' 
      };
    }
  }

  // Reviews methods
  async getReviews(params = {}) {
    try {
      const response = await reviewsAPI.getAll(params);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch reviews' 
      };
    }
  }

  async getReviewById(id) {
    try {
      const response = await reviewsAPI.getById(id);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to fetch review' 
      };
    }
  }

  async createReview(reviewData) {
    try {
      const response = await reviewsAPI.create(reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to create review' 
      };
    }
  }

  async updateReview(id, reviewData) {
    try {
      const response = await reviewsAPI.update(id, reviewData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to update review' 
      };
    }
  }

  async deleteReview(id) {
    try {
      await reviewsAPI.delete(id);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Failed to delete review' 
      };
    }
  }
}

export const dataService = new DataService();
