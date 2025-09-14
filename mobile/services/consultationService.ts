import api from './api';

export interface ConsultationDetails {
  consultationId: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  consultationMode: string;
  reasonForVisit: string;
  consultationAmount: number;
  paidAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  doctorFirstName: string;
  doctorLastName: string;
  doctorEmail: string;
  doctorPhoneNumber: string;
  doctorSpecialization: string;
}

export interface Prescription {
  prescriptionId: string;
  appointmentId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  labResultId: string;
  appointmentId: string;
  testName: string;
  result: string;
  normalRange: string;
  unit: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const consultationService = {
  // Get consultation details by ID
  getConsultationById: async (consultationId: string): Promise<ConsultationDetails> => {
    const response = await api.get(`/api/v0/consultations/${consultationId}`);
    return response.data;
  },

  // Get all consultations for current user
  getAllConsultations: async (): Promise<ConsultationDetails[]> => {
    const response = await api.get('/api/v0/consultations');
    return response.data;
  },

  // Get prescriptions for a specific consultation
  getConsultationPrescriptions: async (consultationId: string): Promise<Prescription[]> => {
    const response = await api.get(`/api/v0/prescriptions/appointment/${consultationId}`);
    return response.data;
  },

  // Get lab results for a specific consultation
  getConsultationLabResults: async (consultationId: string): Promise<LabResult[]> => {
    const response = await api.get(`/api/v0/lab-results/appointment/${consultationId}`);
    return response.data;
  },

  // Get all prescriptions for current user
  getAllPrescriptions: async (): Promise<Prescription[]> => {
    const response = await api.get('/api/v0/prescriptions');
    return response.data;
  },

  // Get all lab results for current user
  getAllLabResults: async (): Promise<LabResult[]> => {
    const response = await api.get('/api/v0/lab-results');
    return response.data;
  },
};
