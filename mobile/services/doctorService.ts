import api from './api';

export interface DoctorInfo {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  name: string; // computed full name
}

export const doctorService = {
  // Get doctor information by ID
  getDoctorById: async (doctorId: string): Promise<DoctorInfo | null> => {
    try {
      // Use doctor-profiles endpoint which patients can access
      const response = await api.get('/api/v0/doctor-profiles');
      const doctors = response.data;
      
      // Find the specific doctor by doctorId
      const doctor = doctors.find((doc: any) => doc.doctorId === doctorId);
      
      if (doctor) {
        return {
          userId: doctor.doctorId,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          phoneNumber: doctor.phoneNumber,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`.trim()
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching doctor ${doctorId}:`, error);
      return null;
    }
  },

  // Get multiple doctors by IDs (batch operation)
  getDoctorsByIds: async (doctorIds: string[]): Promise<DoctorInfo[]> => {
    try {
      // Get all doctors at once for efficiency
      const response = await api.get('/api/v0/doctor-profiles');
      const allDoctors = response.data;
      
      // Filter for the requested doctor IDs
      const requestedDoctors = allDoctors
        .filter((doc: any) => doctorIds.includes(doc.doctorId))
        .map((doctor: any) => ({
          userId: doctor.doctorId,
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          email: doctor.email,
          phoneNumber: doctor.phoneNumber,
          name: `Dr. ${doctor.firstName} ${doctor.lastName}`.trim()
        }));
      
      return requestedDoctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }
};
