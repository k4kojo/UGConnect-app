import api from './api.js';

// Patients API Service
export const patientsService = {
  // Get all patients (admin view)
  getAllPatients: async (params = {}) => {
    try {
      const response = await api.get('/patients', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw error;
    }
  },

  // Get single patient by ID
  getPatientById: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  },

  // Create new patient
  createPatient: async (patientData) => {
    try {
      const response = await api.post('/patients', patientData);
      return response.data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  },

  // Update patient
  updatePatient: async (patientId, patientData) => {
    try {
      const response = await api.put(`/patients/${patientId}`, patientData);
      return response.data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  },

  // Delete patient
  deletePatient: async (patientId) => {
    try {
      const response = await api.delete(`/patients/${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw error;
    }
  },

  // Get patient medical history
  getPatientMedicalHistory: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/medical-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      throw error;
    }
  },

  // Get patient appointments
  getPatientAppointments: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/appointments`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },

  // Get patient prescriptions
  getPatientPrescriptions: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/prescriptions`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient prescriptions:', error);
      throw error;
    }
  },

  // Get patient lab results
  getPatientLabResults: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/patients/${patientId}/lab-results`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient lab results:', error);
      throw error;
    }
  },

  // Get patient statistics
  getPatientStats: async (params = {}) => {
    try {
      const response = await api.get('/patients/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient stats:', error);
      throw error;
    }
  },

  // Search patients
  searchPatients: async (searchTerm, params = {}) => {
    try {
      const response = await api.get('/patients/search', { 
        params: { ...params, q: searchTerm } 
      });
      return response.data;
    } catch (error) {
      console.error('Error searching patients:', error);
      throw error;
    }
  },

  // Get patient demographics
  getPatientDemographics: async (params = {}) => {
    try {
      const response = await api.get('/patients/demographics', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient demographics:', error);
      throw error;
    }
  },

  // Export patient data
  exportPatientData: async (patientId, format = 'pdf') => {
    try {
      const response = await api.get(`/patients/${patientId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting patient data:', error);
      throw error;
    }
  },

  // Get patient emergency contacts
  getPatientEmergencyContacts: async (patientId) => {
    try {
      const response = await api.get(`/patients/${patientId}/emergency-contacts`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient emergency contacts:', error);
      throw error;
    }
  },

  // Update patient emergency contacts
  updatePatientEmergencyContacts: async (patientId, emergencyContacts) => {
    try {
      const response = await api.put(`/patients/${patientId}/emergency-contacts`, emergencyContacts);
      return response.data;
    } catch (error) {
      console.error('Error updating patient emergency contacts:', error);
      throw error;
    }
  }
};

export default patientsService;
