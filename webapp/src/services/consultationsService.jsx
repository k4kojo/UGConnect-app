import api from './api.js';

// Consultations API Service
export const consultationsService = {
  // Get all consultations (admin view)
  getAllConsultations: async (params = {}) => {
    try {
      const response = await api.get('/consultations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching consultations:', error);
      throw error;
    }
  },

  // Get consultations by doctor
  getDoctorConsultations: async (doctorId, params = {}) => {
    try {
      const response = await api.get(`/consultations/doctor/${doctorId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor consultations:', error);
      throw error;
    }
  },

  // Get consultations by patient
  getPatientConsultations: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/consultations/patient/${patientId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient consultations:', error);
      throw error;
    }
  },

  // Get single consultation by ID
  getConsultationById: async (consultationId) => {
    try {
      const response = await api.get(`/consultations/${consultationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation:', error);
      throw error;
    }
  },

  // Create new consultation
  createConsultation: async (consultationData) => {
    try {
      const response = await api.post('/consultations', consultationData);
      return response.data;
    } catch (error) {
      console.error('Error creating consultation:', error);
      throw error;
    }
  },

  // Update consultation
  updateConsultation: async (consultationId, consultationData) => {
    try {
      const response = await api.put(`/consultations/${consultationId}`, consultationData);
      return response.data;
    } catch (error) {
      console.error('Error updating consultation:', error);
      throw error;
    }
  },

  // Delete consultation
  deleteConsultation: async (consultationId) => {
    try {
      const response = await api.delete(`/consultations/${consultationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting consultation:', error);
      throw error;
    }
  },

  // Start consultation
  startConsultation: async (consultationId) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting consultation:', error);
      throw error;
    }
  },

  // End consultation
  endConsultation: async (consultationId, endData) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/end`, endData);
      return response.data;
    } catch (error) {
      console.error('Error ending consultation:', error);
      throw error;
    }
  },

  // Cancel consultation
  cancelConsultation: async (consultationId, cancelReason) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/cancel`, { cancelReason });
      return response.data;
    } catch (error) {
      console.error('Error cancelling consultation:', error);
      throw error;
    }
  },

  // Reschedule consultation
  rescheduleConsultation: async (consultationId, rescheduleData) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/reschedule`, rescheduleData);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling consultation:', error);
      throw error;
    }
  },

  // Update consultation status
  updateConsultationStatus: async (consultationId, status) => {
    try {
      const response = await api.patch(`/consultations/${consultationId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating consultation status:', error);
      throw error;
    }
  },

  // Add consultation notes
  addConsultationNotes: async (consultationId, notes) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/notes`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error adding consultation notes:', error);
      throw error;
    }
  },

  // Get consultation statistics
  getConsultationStats: async (params = {}) => {
    try {
      const response = await api.get('/consultations/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation stats:', error);
      throw error;
    }
  },

  // Get consultation history
  getConsultationHistory: async (consultationId) => {
    try {
      const response = await api.get(`/consultations/${consultationId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation history:', error);
      throw error;
    }
  },

  // Get scheduled consultations
  getScheduledConsultations: async (params = {}) => {
    try {
      const response = await api.get('/consultations/scheduled', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching scheduled consultations:', error);
      throw error;
    }
  },

  // Get completed consultations
  getCompletedConsultations: async (params = {}) => {
    try {
      const response = await api.get('/consultations/completed', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching completed consultations:', error);
      throw error;
    }
  },

  // Get consultation types
  getConsultationTypes: async () => {
    try {
      const response = await api.get('/consultations/types');
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation types:', error);
      throw error;
    }
  },

  // Send consultation reminder
  sendConsultationReminder: async (consultationId, reminderData) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/reminder`, reminderData);
      return response.data;
    } catch (error) {
      console.error('Error sending consultation reminder:', error);
      throw error;
    }
  },

  // Get consultation follow-ups
  getConsultationFollowUps: async (consultationId) => {
    try {
      const response = await api.get(`/consultations/${consultationId}/follow-ups`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation follow-ups:', error);
      throw error;
    }
  },

  // Schedule follow-up consultation
  scheduleFollowUp: async (consultationId, followUpData) => {
    try {
      const response = await api.post(`/consultations/${consultationId}/follow-up`, followUpData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling follow-up consultation:', error);
      throw error;
    }
  }
};

export default consultationsService;
