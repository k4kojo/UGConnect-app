import api from './api';

export type DoctorProfile = {
  id: number;
  doctorId: string | null;
  specialization: string;
  licenseNumber: string;
  bio?: string | null;
  reviews: number;
  rating: number;
  experienceYears?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
};

export type AppointmentRecord = {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string; // ISO from backend
  appointmentMode: "Online" | "In-person";
  reasonForVisit?: string | null;
  appointmentAmount: number;
  paidAmount: number;
  paymentMethod?:
    | "MTN MoMo"
    | "Telecel Cash"
    | "AirtelTigo Cash"
    | "Credit Card"
    | null;
  paymentStatus:
    | "pending"
    | "partial"
    | "completed"
    | "failed"
    | "refunded"
    | "processing";
  paymentDate?: string | null;
  status: "pending" | "confirmed" | "cancelled" | "completed" | "rescheduled";
  createdAt: string;
  updatedAt: string;
};

export type PaymentRecord = {
  paymentId: string;
  appointmentId: string;
  userId: string;
  amount: number;
  method: "MTN MoMo" | "Telecel Cash" | "AirtelTigo Cash" | "Credit Card";
  providerRef?: string | null;
  metadata?: Record<string, any>;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const appointmentService = {
  // List all doctors
  listDoctors: async (): Promise<DoctorProfile[]> => {
    const res = await api.get("/api/v0/doctor-profiles");
    return res.data as DoctorProfile[];
  },

  // Create a new appointment
  createAppointment: async (payload: {
    doctorId: string;
    appointmentDate: string; // ISO string
    appointmentAmount: string | number;
    appointmentMode: "Online" | "In-person";
    reasonForVisit?: string;
    paymentMethod?:
      | "MTN MoMo"
      | "Telecel Cash"
      | "AirtelTigo Cash"
      | "Credit Card";
  }): Promise<AppointmentRecord> => {
    // Ensure strings sent for number-fields to satisfy backend zod coercion
    const body = {
      ...payload,
      appointmentAmount: String(payload.appointmentAmount),
    };
    const res = await api.post("/api/v0/appointments", body);
    return res.data;
  },

  // List appointments with optional filters
  listAppointments: async (params?: { status?: string; limit?: number }): Promise<AppointmentRecord[]> => {
    const res = await api.get("/api/v0/appointments", { params });
    return res.data as AppointmentRecord[];
  },

  // Create a payment record
  createPaymentRecord: async (payload: {
    appointmentId: string;
    userId: string;
    amount: number;
    method: "MTN MoMo" | "Telecel Cash" | "AirtelTigo Cash" | "Credit Card";
    providerRef?: string | null;
    metadata?: Record<string, any>;
  }): Promise<PaymentRecord> => {
    const res = await api.post("/api/v0/payments", payload);
    return res.data;
  },

  // Get appointment by ID
  getAppointmentById: async (appointmentId: string): Promise<AppointmentRecord> => {
    const res = await api.get(`/api/v0/appointments/${appointmentId}`);
    return res.data;
  },

  // Update appointment
  updateAppointment: async (appointmentId: string, updates: Partial<AppointmentRecord>): Promise<AppointmentRecord> => {
    const res = await api.put(`/api/v0/appointments/${appointmentId}`, updates);
    return res.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<AppointmentRecord> => {
    const res = await api.put(`/api/v0/appointments/${appointmentId}/cancel`);
    return res.data;
  },
};
