// Export all services for easy importing
export { default as api } from './api';
export * from './appointmentService';
export * from './authService';
export * from './chatService';
// Avoid type name collisions by explicitly exporting consultation types with aliases
export { consultationService } from './consultationService';
export type { ConsultationDetails, Prescription as ConsultationPrescription, LabResult as ConsultationLabResult } from './consultationService';
export * from './feedbackService';
// Avoid type name collisions by explicitly exporting medical records types with aliases
export { medicalRecordsService } from './medicalRecordsService';
export type { MedicalRecord, Prescription as MedicalPrescription, LabResult as MedicalLabResult } from './medicalRecordsService';
export * from './notificationService';
export * from './userService';
