import api from './api.js';

// Lab Results API Service
export const labResultsService = {
  // Get all lab results (admin view)
  getAllLabResults: async (params = {}) => {
    try {
      const response = await api.get('/lab-results', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching lab results:', error);
      throw error;
    }
  },

  // Get lab results by patient
  getPatientLabResults: async (patientId, params = {}) => {
    try {
      const response = await api.get(`/lab-results/patient/${patientId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching patient lab results:', error);
      throw error;
    }
  },

  // Get lab results by doctor
  getDoctorLabResults: async (doctorId, params = {}) => {
    try {
      const response = await api.get(`/lab-results/doctor/${doctorId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor lab results:', error);
      throw error;
    }
  },

  // Get single lab result by ID
  getLabResultById: async (resultId) => {
    try {
      const response = await api.get(`/lab-results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lab result:', error);
      throw error;
    }
  },

  // Create new lab test order
  createLabTest: async (testData) => {
    try {
      const response = await api.post('/lab-results', testData);
      return response.data;
    } catch (error) {
      console.error('Error creating lab test:', error);
      throw error;
    }
  },

  // Update lab result
  updateLabResult: async (resultId, resultData) => {
    try {
      const response = await api.put(`/lab-results/${resultId}`, resultData);
      return response.data;
    } catch (error) {
      console.error('Error updating lab result:', error);
      throw error;
    }
  },

  // Delete lab result
  deleteLabResult: async (resultId) => {
    try {
      const response = await api.delete(`/lab-results/${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting lab result:', error);
      throw error;
    }
  },

  // Update lab result status
  updateLabResultStatus: async (resultId, status) => {
    try {
      const response = await api.patch(`/lab-results/${resultId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating lab result status:', error);
      throw error;
    }
  },

  // Add test results to lab test
  addTestResults: async (resultId, resultsData) => {
    try {
      const response = await api.post(`/lab-results/${resultId}/results`, resultsData);
      return response.data;
    } catch (error) {
      console.error('Error adding test results:', error);
      throw error;
    }
  },

  // Get lab result statistics
  getLabResultStats: async (params = {}) => {
    try {
      const response = await api.get('/lab-results/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching lab result stats:', error);
      throw error;
    }
  },

  // Get available lab tests
  getAvailableTests: async () => {
    try {
      const response = await api.get('/lab-results/available-tests');
      return response.data;
    } catch (error) {
      console.error('Error fetching available tests:', error);
      throw error;
    }
  },

  // Get lab result history
  getLabResultHistory: async (resultId) => {
    try {
      const response = await api.get(`/lab-results/${resultId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lab result history:', error);
      throw error;
    }
  },

  // Export lab result as PDF
  exportLabResult: async (resultId, format = 'pdf') => {
    try {
      const response = await api.get(`/lab-results/${resultId}/export`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting lab result:', error);
      throw error;
    }
  },

  // Send lab result to patient
  sendToPatient: async (resultId, notificationData) => {
    try {
      const response = await api.post(`/lab-results/${resultId}/send-to-patient`, notificationData);
      return response.data;
    } catch (error) {
      console.error('Error sending lab result to patient:', error);
      throw error;
    }
  },

  // Get pending lab tests
  getPendingTests: async (params = {}) => {
    try {
      const response = await api.get('/lab-results/pending', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending tests:', error);
      throw error;
    }
  },

  // Get completed lab tests
  getCompletedTests: async (params = {}) => {
    try {
      const response = await api.get('/lab-results/completed', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching completed tests:', error);
      throw error;
    }
  }
};

export default labResultsService;
