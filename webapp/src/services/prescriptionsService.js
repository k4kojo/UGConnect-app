import api from './api.js';

// Prescriptions API Service
export const prescriptionsService = {
  // Get all prescriptions (admin view)
  getAllPrescriptions: async (params = {}) => {
    try {
      const response = await api.get('/prescriptions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      throw error;
    }
  },

  // Get prescriptions by doctor (doctor view)
  getDoctorPrescriptions: async (doctorId, params = {}) => {
    try {
      const response = await api.get('/prescriptions/doctor', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor prescriptions:', error);
      throw error;
    }
  },

  // Get prescriptions by patient
  getPatientPrescriptions: async (patientId, params = {}) => {
    try {
      const response = await api.get('/prescriptions/patient', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  },

  // Get single prescription by ID
  getPrescriptionById: async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription:', error);
      throw error;
    }
  },

  // Create new prescription
  createPrescription: async (prescriptionData) => {
    try {
      const response = await api.post('/prescriptions', prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },

  // Update prescription
  updatePrescription: async (prescriptionId, prescriptionData) => {
    try {
      const response = await api.put(`/prescriptions/${prescriptionId}`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error updating prescription:', error);
      throw error;
    }
  },

  // Delete prescription
  deletePrescription: async (prescriptionId) => {
    try {
      const response = await api.delete(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting prescription:', error);
      throw error;
    }
  },

  // Send prescription to pharmacy
  sendToPharmacy: async (prescriptionId, pharmacyData) => {
    try {
      const response = await api.post(`/prescriptions/${prescriptionId}/send-to-pharmacy`, pharmacyData);
      return response.data;
    } catch (error) {
      console.error('Error sending prescription to pharmacy:', error);
      throw error;
    }
  },

  // Get prescription statistics
  getPrescriptionStats: async (params = {}) => {
    try {
      const response = await api.get('/prescriptions/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription stats:', error);
      throw error;
    }
  },

  // Refill prescription
  refillPrescription: async (prescriptionId, refillData) => {
    try {
      const response = await api.post(`/prescriptions/${prescriptionId}/refill`, refillData);
      return response.data;
    } catch (error) {
      console.error('Error refilling prescription:', error);
      throw error;
    }
  },

  // Get prescription history
  getPrescriptionHistory: async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription history:', error);
      throw error;
    }
  }
};

export default prescriptionsService;
