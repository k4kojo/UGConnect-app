import axios from "axios";
import config from "../config/env.js";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: config.API_URL,
  timeout: 30000, // Reduced to 30 seconds for better UX
  headers: {
    "Content-Type": "application/json",
  },
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

// Helper function to create delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors and retries
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(
      "API Error:",
      error.response?.status,
      error.response?.data,
      error.code
    );

    // Handle timeout and network errors with retry logic
    if (
      (error.code === "ECONNABORTED" ||
        error.code === "NETWORK_ERROR" ||
        error.response?.status >= 500) &&
      !originalRequest._retry &&
      originalRequest._retryCount < MAX_RETRIES
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

      console.log(
        `Retrying request (${originalRequest._retryCount}/${MAX_RETRIES}):`,
        originalRequest.url
      );

      await delay(RETRY_DELAY * originalRequest._retryCount);

      return api(originalRequest);
    }

    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      console.error("Forbidden: Insufficient permissions");
    } else if (error.response?.status >= 500) {
      console.error("Server error:", error.response?.data);
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout - server may be overloaded");
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  signUp: (userData) => api.post("/user/sign-up", userData),
  signIn: (credentials) => api.post("/user/sign-in", credentials),
  googleSignIn: (idToken) => api.post("/user/oauth/google", { idToken }),
  appleSignIn: (identityToken) =>
    api.post("/user/oauth/apple", { identityToken }),
  requestPasswordReset: (email) =>
    api.post("/user/request-password-reset", { email }),
  resetPassword: (email, token, newPassword) =>
    api.post("/user/reset-password", { email, token, newPassword }),
  verifyEmail: (email, token) =>
    api.get(
      `/user/verify-email?email=${encodeURIComponent(email)}&token=${token}`
    ),
  resendVerification: (email) =>
    api.get(`/user/resend-verification?email=${encodeURIComponent(email)}`),
  getFirebaseToken: () => api.get("/user/firebase-token"),
};

export const userAPI = {
  getAllUsers: () => api.get("/user"),
  getCurrentUser: (userId) => api.get(`/user/${userId}`),
  updateUser: (userId, userData) => api.put(`/user/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/user/${userId}`),
  createUserByAdmin: (userData) => api.post("/user/create", userData),
  toggleUserStatus: (userId, { isActive }) =>
    api.patch(`/user/${userId}/status`, { isActive }),
};

export const appointmentAPI = {
  getAll: (params) => api.get("/appointments", { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  create: (appointmentData) => api.post("/appointments", appointmentData),
  update: (id, appointmentData) =>
    api.put(`/appointments/${id}`, appointmentData),
  delete: (id) => api.delete(`/appointments/${id}`),
};

export const doctorAPI = {
  getAll: (params) => api.get("/doctor-profiles", { params }),
  getById: (id) => api.get(`/doctor-profiles/${id}`),
};

export const availabilityAPI = {
  getAll: (params) => api.get("/doctor-availability", { params }),
  getById: (id) => api.get(`/doctor-availability/${id}`),
  create: (availabilityData) =>
    api.post("/doctor-availability", availabilityData),
  update: (id, availabilityData) =>
    api.put(`/doctor-availability/${id}`, availabilityData),
  delete: (id) => api.delete(`/doctor-availability/${id}`),
};

export const patientAPI = {
  getProfile: (patientId) => api.get(`/patient-profile/${patientId}`),
  updateProfile: (patientId, profileData) =>
    api.put(`/patient-profile/${patientId}`, profileData),
};

export const medicalRecordsAPI = {
  // Updated to match backend route: /patients/:patientId/medical-records
  getAll: (patientId, params) =>
    api.get(`/medical-records/patients/${patientId}/medical-records`, {
      params,
    }),
  getById: (patientId, recordId) =>
    api.get(`/medical-records/medical-records/${recordId}`),
  create: (patientId, recordData) =>
    api.post(
      `/medical-records/patients/${patientId}/medical-records`,
      recordData
    ),
  update: (patientId, recordId, recordData) =>
    api.put(`/medical-records/medical-records/${recordId}`, recordData),
};

export const labResultsAPI = {
  // Updated to match backend route: GET / (with query params for filtering)
  getAll: (patientId, params) =>
    api.get("/lab-results", { params: { ...params, patientId } }),
  getById: (patientId, resultId) => api.get(`/lab-results/${resultId}`),
  create: (patientId, resultData) => api.post("/lab-results", resultData),
};

export const prescriptionsAPI = {
  // Updated to match backend routes
  getAll: (params) => api.get("/prescriptions", { params }),
  getDoctorPrescriptions: (params) =>
    api.get("/prescriptions/doctor", { params }),
  getPatientPrescriptions: (params) =>
    api.get("/prescriptions/patient", { params }),
  getById: (prescriptionId) => api.get(`/prescriptions/${prescriptionId}`),
  create: (prescriptionData) => api.post("/prescriptions", prescriptionData),
  createDirectPrescription: (prescriptionData) =>
    api.post("/prescriptions/direct", prescriptionData),
  createAppointmentPrescription: (prescriptionData) =>
    api.post("/prescriptions/appointment", prescriptionData),
  update: (prescriptionId, prescriptionData) =>
    api.put(`/prescriptions/${prescriptionId}`, prescriptionData),
};

export const notificationsAPI = {
  // Admin: list all notifications
  getAll: (params) => api.get("/notifications/notifications", { params }),
  // Current user: list own + global notifications
  getUser: (params) => api.get("/notifications/user/notifications", { params }),
  markAsRead: (notificationId) =>
    api.put(`/notifications/notifications/${notificationId}/read`),
  markAllAsRead: () =>
    api.put("/notifications/user/notifications/mark-all-read"),
  delete: (notificationId) =>
    api.delete(`/notifications/notifications/${notificationId}`),
};

export const paymentsAPI = {
  getAll: (params) => api.get("/payments", { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (paymentData) => api.post("/payments", paymentData),
  update: (id, paymentData) => api.put(`/payments/${id}`, paymentData),
};

export const chatAPI = {
  // Chat Rooms
  getRooms: (params) => api.get("/chat-rooms", { params }),
  getRoomById: (roomId) => api.get(`/chat-rooms/${roomId}`),
  createRoom: (roomData) => api.post("/chat-rooms", roomData),
  updateRoom: (roomId, roomData) => api.put(`/chat-rooms/${roomId}`, roomData),
  deleteRoom: (roomId) => api.delete(`/chat-rooms/${roomId}`),

  // Chat Messages
  getAllMessages: (params) => api.get("/chat-messages", { params }),
  getMessageById: (messageId) => api.get(`/chat-messages/${messageId}`),
  getMessagesByRoom: (roomId) => api.get(`/chat-messages/room/${roomId}`),
  sendMessage: (messageData) => api.post("/chat-messages", messageData),
  updateMessage: (messageId, messageData) =>
    api.put(`/chat-messages/${messageId}`, messageData),
  deleteMessage: (messageId) => api.delete(`/chat-messages/${messageId}`),
};

export const reviewsAPI = {
  getAll: (params) => api.get("/reviews", { params }),
  getById: (id) => api.get(`/reviews/${id}`),
  create: (reviewData) => api.post("/reviews", reviewData),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const patientsAPI = {
  getAll: (params) =>
    api.get("/user", { params: { ...params, role: "patient" } }),
  getById: (id) => api.get(`/user/${id}`),
  update: (id, patientData) => api.put(`/user/${id}`, patientData),
  delete: (id) => api.delete(`/user/${id}`),
  getMedicalRecords: (patientId, params) =>
    api.get(`/medical-records/patients/${patientId}/medical-records`, {
      params,
    }),
  getLabResults: (patientId, params) =>
    api.get("/lab-results", { params: { ...params, patientId } }),
  getPrescriptions: (patientId, params) =>
    api.get("/prescriptions", { params: { ...params, patientId } }),
  getAppointments: (patientId, params) =>
    api.get("/appointments", { params: { ...params, patientId } }),
};

export const reportsAPI = {
  generateReport: (reportType, params) =>
    api.post("/reports/generate", { reportType, ...params }),
  createReport: (reportData) => api.post("/reports", reportData),
  getReports: (params) => api.get("/reports", { params }),
  getReportById: (id) => api.get(`/reports/${id}`),
  updateReport: (id, reportData) => api.put(`/reports/${id}`, reportData),
  downloadReport: (id) => api.get(`/reports/${id}/download`),
  deleteReport: (id) => api.delete(`/reports/${id}`),
};

export const settingsAPI = {
  getSystemSettings: () => api.get("/settings/system"),
  updateSystemSettings: (settings) => api.put("/settings/system", settings),
  getHospitalInfo: () => api.get("/settings/hospital"),
  updateHospitalInfo: (info) => api.put("/settings/hospital", info),
  getNotificationSettings: () => api.get("/settings/notifications"),
  updateNotificationSettings: (settings) =>
    api.put("/settings/notifications", settings),
  getAppearanceSettings: () => api.get("/settings/appearance"),
  updateAppearanceSettings: (settings) =>
    api.put("/settings/appearance", settings),
};

export const userSettingsAPI = {
  getUserSettings: (userId) => api.get(`/user-settings/${userId}`),
  updateUserSettings: (userId, settings) =>
    api.put(`/user-settings/${userId}`, settings),
  getProfileSettings: (userId) => api.get(`/user-settings/${userId}/profile`),
  updateProfileSettings: (userId, settings) =>
    api.put(`/user-settings/${userId}/profile`, settings),
  getSecuritySettings: (userId) => api.get(`/user-settings/${userId}/security`),
  updateSecuritySettings: (userId, settings) =>
    api.put(`/user-settings/${userId}/security`, settings),
  getNotificationPreferences: (userId) =>
    api.get(`/user-settings/${userId}/notifications`),
  updateNotificationPreferences: (userId, preferences) =>
    api.put(`/user-settings/${userId}/notifications`, preferences),
};

export default api;
