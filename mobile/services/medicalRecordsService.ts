import api from './api';
import { userService } from './userService';

export interface MedicalRecord {
  id: number;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  recordType: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: number;
  appointmentId: string;
  doctorId: string;
  medication: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  instructions?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: number;
  patientId: string;
  doctorId: string;
  appointmentId: string;
  testName: string;
  result: string;
  resultDate: string;
  notes?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export const medicalRecordsService = {
  // Get all medical records for current patient
  getMedicalRecords: async (): Promise<MedicalRecord[]> => {
    const user = await userService.getStoredUser();
    if (!user?.userId) {
      throw new Error('User not authenticated');
    }
    const response = await api.get(`/api/v0/medical-records/patients/${user.userId}/medical-records`);
    return response.data;
  },

  // Get medical record by ID
  getMedicalRecordById: async (id: number): Promise<MedicalRecord> => {
    const response = await api.get(`/api/v0/medical-records/${id}`);
    return response.data;
  },

  // Get all prescriptions for current patient
  getPrescriptions: async (): Promise<Prescription[]> => {
    const response = await api.get('/api/v0/prescriptions/patient');
    return response.data;
  },

  // Get prescription by ID
  getPrescriptionById: async (id: number): Promise<Prescription> => {
    const response = await api.get(`/api/v0/prescriptions/${id}`);
    return response.data;
  },

  // Get all lab results for current patient
  getLabResults: async (): Promise<LabResult[]> => {
    const response = await api.get('/api/v0/lab-results');
    return response.data;
  },

  // Get lab result by ID
  getLabResultById: async (id: number): Promise<LabResult> => {
    const response = await api.get(`/api/v0/lab-results/${id}`);
    return response.data;
  },

  // Get all records (medical records, prescriptions, lab results) combined
  getAllRecords: async (): Promise<{
    medicalRecords: MedicalRecord[];
    prescriptions: Prescription[];
    labResults: LabResult[];
  }> => {
    const [medicalRecords, prescriptions, labResults] = await Promise.all([
      medicalRecordsService.getMedicalRecords(),
      medicalRecordsService.getPrescriptions(),
      medicalRecordsService.getLabResults(),
    ]);

    return {
      medicalRecords,
      prescriptions,
      labResults,
    };
  },
};
