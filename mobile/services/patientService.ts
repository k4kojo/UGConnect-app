import api from './api';

export interface PatientInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  name?: string; // Computed full name
}

export const patientService = {
  // Get patient information by user ID
  // This uses the user endpoint since patients are users with role 'patient'
  getPatientById: async (patientId: string): Promise<PatientInfo | null> => {
    try {
      const response = await api.get(`/api/v0/user/${patientId}`);
      const user = response.data.user;
      
      if (!user) {
        return null;
      }

      return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || user.lastName || `Patient ${patientId}`
      };
    } catch (error) {
      console.warn(`Failed to fetch patient ${patientId}:`, error);
      return null;
    }
  },

  // Get multiple patients by IDs (batch fetch for efficiency)
  getPatientsByIds: async (patientIds: string[]): Promise<Record<string, PatientInfo>> => {
    const patients: Record<string, PatientInfo> = {};
    
    // Fetch patients in parallel
    const promises = patientIds.map(async (patientId) => {
      const patient = await patientService.getPatientById(patientId);
      if (patient) {
        patients[patientId] = patient;
      }
    });

    await Promise.allSettled(promises);
    return patients;
  }
};
