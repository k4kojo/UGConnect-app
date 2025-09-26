import React, { createContext, useContext, useEffect, useState } from 'react';
import { userAPI, userSettingsAPI } from '../services/api';
import { dashboardService } from '../services/dashboardService.js';
import { useAuth } from './AuthContext';

const DataContext = createContext();

// Move useData hook to a separate function to avoid Fast Refresh issues
const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

function DataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState({
    // Doctor data
    doctorDashboard: null,
    doctorAppointments: null,
    doctorPatients: null,
    
    // Admin data
    adminDashboard: null,
    adminRecentActivity: null,
    adminAppointments: null,
    adminPatients: null,
    adminPrescriptions: null,
    adminLabResults: null,
    adminNotifications: null,
    
    // New admin data
    doctors: null,
    payments: null,
    notices: null,
    languages: null,
    backups: null,
    users: null,
    reports: null,
    
    // Settings data
    userProfile: null,
    userSettings: null,
    hospitalInfo: null,
    
    // Shared data
    prescriptions: null,
    labResults: null,
    notifications: null,
    chatRooms: null,
    chatMessages: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState({});
  const [error, setError] = useState(null);

  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  const isDataStale = (key) => {
    const lastFetchTime = lastFetch[key];
    if (!lastFetchTime) return true;
    // Always return false to disable automatic refresh based on cache expiration
    return false;
  };

  // Doctor-specific helper fetchers to support dashboard flows
  const fetchDoctorPrescriptions = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;

    const key = 'prescriptions';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getDoctorPrescriptions(user.userId, forceRefresh);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorLabResults = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;

    const key = 'labResults';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      // Currently no doctor-filtered lab results endpoint; use shared method
      const response = await dashboardService.getLabResults();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorMedicalRecords = async () => {
    // Lightweight helper: return empty array since we removed recent activity
    return [];
  };

  const updateData = (key, newData) => {
    setData(prev => ({
      ...prev,
      [key]: newData
    }));
    setLastFetch(prev => ({
      ...prev,
      [key]: Date.now()
    }));
  };

  const fetchDoctorDashboard = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;

    const key = 'doctorDashboard';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      // Add timeout protection for dashboard loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Dashboard loading timeout')), 30000); // 30 second timeout
      });
      
      const response = await Promise.race([
        dashboardService.getDoctorDashboardStats(user.userId),
        timeoutPromise
      ]);
      
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      console.error('Doctor dashboard fetch error:', error);
      if (error.message === 'Dashboard loading timeout') {
        setError('Dashboard is taking longer than expected to load. Please check your connection and try again.');
      } else {
        setError(error.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };


  const fetchAdminDashboard = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'adminDashboard';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      // Add timeout protection for admin dashboard loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Dashboard loading timeout')), 30000); // 30 second timeout
      });
      
      const response = await Promise.race([
        dashboardService.getAdminDashboardStats(),
        timeoutPromise
      ]);
      
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      console.error('Admin dashboard fetch error:', error);
      if (error.message === 'Dashboard loading timeout') {
        setError('Dashboard is taking longer than expected to load. Please check your connection and try again.');
      } else {
        setError(error.message);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminRecentActivity = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'adminRecentActivity';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getAdminRecentActivity();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async (forceRefresh = false) => {
    const key = 'prescriptions';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      console.log('Fetching prescriptions for user role:', user?.role);
      
      // Use appropriate method based on user role
      const response = user?.role === 'doctor'
        ? await dashboardService.getDoctorPrescriptions(user.userId)
        : await dashboardService.getPrescriptions();
      
      if (response.success) {
        console.log(`Successfully fetched ${response.data?.length || 0} prescriptions`);
        updateData(key, response.data);
        return response.data;
      } else {
        console.error('Failed to fetch prescriptions:', response.error);
        setError(response.error || 'Failed to fetch prescriptions');
        return null;
      }
    } catch (error) {
      console.error('Error in fetchPrescriptions:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to fetch prescriptions';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. The server may be busy. Please try again.';
      } else if (error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createDirectPrescription = async (prescriptionData) => {
    if (!user?.userId || user?.role !== 'doctor') return;

    setLoading(true);
    try {
      const response = await dashboardService.createDirectPrescription(prescriptionData);
      if (response.success) {
        // Refresh prescriptions to show the new one
        fetchPrescriptions(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createAppointmentPrescription = async (prescriptionData) => {
    if (!user?.userId || user?.role !== 'doctor') return;

    setLoading(true);
    try {
      const response = await dashboardService.createAppointmentPrescription(prescriptionData);
      if (response.success) {
        // Refresh prescriptions to show the new one
        fetchPrescriptions(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLabResults = async (forceRefresh = false) => {
    const key = 'labResults';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getLabResults();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async (forceRefresh = false) => {
    const key = 'notifications';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getNotifications(user?.role === 'admin' ? 'admin' : 'doctor');
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await dashboardService.markNotificationAsRead(notificationId);
      if (response.success) {
        // No automatic refresh - user can manually refresh if needed
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await dashboardService.markAllNotificationsAsRead();
      if (response.success) {
        // No automatic refresh - user can manually refresh if needed
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await dashboardService.deleteNotification(notificationId);
      if (response.success) {
        // Refresh notifications after deletion
        await fetchNotifications(true);
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const fetchChatRooms = async (forceRefresh = false) => {
    const key = 'chatRooms';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getChatRooms();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async (roomId, forceRefresh = false) => {
    const key = `chatMessages_${roomId}`;
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getChatMessages(roomId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorPatients = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;
    
    const key = 'doctorPatients';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getDoctorPatients(user.userId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctorAppointments = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;
    
    const key = 'doctorAppointments';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getDoctorAppointments(user.userId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminAppointments = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'adminAppointments';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getAppointments();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'doctors';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getDoctors();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUserByAdmin = async (userData) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.createUserByAdmin(userData);
      if (response.success) {
        // Refresh doctors list after creating a new user
        await fetchDoctors(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'payments';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getPayments();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotices = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'notices';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getNotices();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchLanguages = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'languages';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getLanguages();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchBackups = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'backups';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getBackups();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'users';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getUsers();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Patients API methods
  const fetchPatients = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'patients';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getPatients();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientById = async (patientId) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.getPatientById(patientId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updatePatient = async (patientId, patientData) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updatePatient(patientId, patientData);
      if (response.success) {
        // Refresh patients list after update
        await fetchPatients(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deletePatient = async (patientId) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.deletePatient(patientId);
      if (response.success) {
        // Refresh patients list after deletion
        await fetchPatients(true);
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reports API methods
  const fetchReports = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'reports';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getReports();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType, params = {}) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.generateReport(reportType, params);
      if (response.success) {
        // Refresh reports list after generation
        await fetchReports(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.createReport(reportData);
      if (response.success) {
        // Refresh reports list after creation
        await fetchReports(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (reportId, reportData) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateReport(reportId, reportData);
      if (response.success) {
        // Refresh reports list after update
        await fetchReports(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportId) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.downloadReport(reportId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.deleteReport(reportId);
      if (response.success) {
        // Refresh reports list after deletion
        await fetchReports(true);
        return true;
      } else {
        setError(response.error);
        return false;
      }
    } catch (error) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Settings API methods
  const fetchSystemSettings = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'systemSettings';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getSystemSettings();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSystemSettings = async (settings) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateSystemSettings(settings);
      if (response.success) {
        // Refresh settings after update
        await fetchSystemSettings(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalInfo = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'hospitalInfo';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getHospitalInfo();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateHospitalInfo = async (info) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateHospitalInfo(info);
      if (response.success) {
        // Refresh hospital info after update
        await fetchHospitalInfo(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationSettings = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'notificationSettings';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getNotificationSettings();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationSettings = async (settings) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateNotificationSettings(settings);
      if (response.success) {
        // Refresh notification settings after update
        await fetchNotificationSettings(true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // User Settings API methods
  const fetchUserSettings = async (userId, forceRefresh = false) => {
    if (!user?.userId) return;
    
    const key = `userSettings_${userId}`;
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getUserSettings(userId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserSettings = async (userId, settings) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateUserSettings(userId, settings);
      if (response.success) {
        // Refresh user settings after update
        await fetchUserSettings(userId, true);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileSettings = async (userId, forceRefresh = false) => {
    if (!user?.userId) return;
    
    const key = `profileSettings_${userId}`;
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getProfileSettings(userId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProfileSettings = async (userId, settings) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateProfileSettings(userId, settings);
      if (response.success) {
        // No automatic refresh - user can manually refresh if needed
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchSecuritySettings = async (userId, forceRefresh = false) => {
    if (!user?.userId) return;
    
    const key = `securitySettings_${userId}`;
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getSecuritySettings(userId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSecuritySettings = async (userId, settings) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateSecuritySettings(userId, settings);
      if (response.success) {
        // No automatic refresh - user can manually refresh if needed
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationPreferences = async (userId, forceRefresh = false) => {
    if (!user?.userId) return;
    
    const key = `notificationPreferences_${userId}`;
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getNotificationPreferences(userId);
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNotificationPreferences = async (userId, preferences) => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateNotificationPreferences(userId, preferences);
      if (response.success) {
        // No automatic refresh - user can manually refresh if needed
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Settings-specific fetch methods
  const fetchUserProfile = async (forceRefresh = false) => {
    if (!user?.userId) return null;
    
    const key = 'userProfile';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await userAPI.getCurrentUser(user.userId);
      console.log('🔍 fetchUserProfile response:', response.data);
      
      if (response.data) {
        // Convert profile picture to full URL if it exists
        const userData = {
          ...response.data,
          profilePicture: response.data.profilePicture 
            ? `/api/v0/user/profile-picture/${user.userId}`
            : null
        };
        
        console.log('🔍 Constructed userData:', userData);
        updateData(key, userData);
        return userData;
      } else {
        setError('Failed to fetch user profile');
        return null;
      }
    } catch (error) {
      // If user profile doesn't exist, return null instead of throwing error
      if (error.response?.status === 404) {
        console.warn('User profile not found, using defaults');
        return null;
      }
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!user?.userId) return null;
    
    setLoading(true);
    try {
      const response = await userAPI.updateUser(user.userId, profileData);
      if (response.data) {
        // Update local state directly instead of refreshing
        updateData('userProfile', { ...data.userProfile, ...response.data });
        return response.data;
      } else {
        setError('Failed to update user profile');
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSettingsData = async (forceRefresh = false) => {
    if (!user?.userId) return null;
    
    const key = 'userSettings';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await userSettingsAPI.getUserSettings(user.userId);
      if (response.data) {
        updateData(key, response.data);
        return response.data;
      } else {
        // Return default settings if none exist
        const defaultSettings = {
          notificationEnabled: true,
          darkMode: false,
          language: 'en'
        };
        updateData(key, defaultSettings);
        return defaultSettings;
      }
    } catch (error) {
      // If settings don't exist, return defaults instead of throwing error
      if (error.response?.status === 404) {
        const defaultSettings = {
          notificationEnabled: true,
          darkMode: false,
          language: 'en'
        };
        updateData(key, defaultSettings);
        return defaultSettings;
      }
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUserSettingsData = async (settings) => {
    if (!user?.userId) return null;
    
    setLoading(true);
    try {
      const response = await userSettingsAPI.updateUserSettings(user.userId, settings);
      if (response.data) {
        // Update local state directly instead of refreshing
        updateData('userSettings', { ...data.userSettings, ...response.data });
        return response.data;
      } else {
        setError('Failed to update user settings');
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchHospitalInfoData = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return null;
    
    const key = 'hospitalInfo';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    // Since hospital info endpoint doesn't exist, return default data
    const defaultHospitalInfo = {
      name: 'General Hospital',
      address: '123 Medical Center Dr',
      city: 'Healthcare City',
      state: 'HC',
      zipCode: '12345',
      phone: '+1 (555) 987-6543',
      email: 'info@generalhospital.com',
      website: 'www.generalhospital.com',
      timezone: 'America/New_York',
      currency: 'USD'
    };

    updateData(key, defaultHospitalInfo);
    return defaultHospitalInfo;
  };

  const updateHospitalInfoData = async (info) => {
    if (!user?.userId || user?.role !== 'admin') return null;
    
    // Since hospital info endpoint doesn't exist, just update local state
    updateData('hospitalInfo', info);
    return info;
  };

  // Doctor Availability API methods
  const fetchDoctorAvailability = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;
    
    const key = 'doctorAvailability';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getDoctorAvailability();
      if (response.success) {
        updateData(key, response.data);
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateDoctorAvailability = async (availabilityId, availabilityData) => {
    if (!user?.userId || user?.role !== 'doctor') return;
    
    setLoading(true);
    try {
      const response = await dashboardService.updateDoctorAvailability(availabilityId, availabilityData);
      if (response.success) {
        // No automatic refresh - user can manually refresh if needed
        return response.data;
      } else {
        setError(response.error);
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // No polling to clear since polling is disabled

      setData({
        doctorDashboard: null,
        doctorAppointments: null,
        doctorPatients: null,
        adminDashboard: null,
        adminRecentActivity: null,
        adminAppointments: null,
        adminPatients: null,
        adminPrescriptions: null,
        adminLabResults: null,
        adminNotifications: null,
        doctors: null,
        payments: null,
        notices: null,
        languages: null,
        backups: null,
        users: null,
        patients: null,
        reports: null,
        systemSettings: null,
        hospitalInfo: null,
        notificationSettings: null,
        userSettings: null,
        profileSettings: null,
        securitySettings: null,
        notificationPreferences: null,
        doctorAvailability: null,
        userProfile: null,
        prescriptions: null,
        labResults: null,
        notifications: null,
        chatRooms: null,
        chatMessages: null,
      });
      setLastFetch({});
      setError(null);
    }
  }, [isAuthenticated]);

  const value = {
    data,
    loading,
    error,
    fetchDoctorDashboard,
    fetchDoctorAppointments,
    fetchDoctorPatients,
    fetchDoctorPrescriptions,
    fetchDoctorLabResults,
    fetchDoctorMedicalRecords,
    fetchAdminDashboard,
    fetchAdminRecentActivity,
    fetchAdminAppointments,
    fetchDoctors,
    createUserByAdmin,
    fetchPayments,
    fetchNotices,
    fetchLanguages,
    fetchBackups,
    fetchUsers,
    fetchPatients,
    fetchPatientById,
    updatePatient,
    deletePatient,
    fetchReports,
    generateReport,
    createReport,
    updateReport,
    downloadReport,
    deleteReport,
    fetchSystemSettings,
    updateSystemSettings,
    fetchHospitalInfo,
    updateHospitalInfo,
    fetchNotificationSettings,
    updateNotificationSettings,
    fetchUserSettings,
    updateUserSettings,
    fetchProfileSettings,
    updateProfileSettings,
    fetchSecuritySettings,
    updateSecuritySettings,
    fetchNotificationPreferences,
    updateNotificationPreferences,
    fetchDoctorAvailability,
    updateDoctorAvailability,
    fetchPrescriptions,
    createDirectPrescription,
    createAppointmentPrescription,
    fetchLabResults,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    fetchChatRooms,
    fetchChatMessages,
    fetchUserProfile,
    updateUserProfile,
    fetchUserSettingsData,
    updateUserSettingsData,
    fetchHospitalInfoData,
    updateHospitalInfoData,
    updateData,
    isDataStale,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Export using named exports for Fast Refresh compatibility
export { useData, DataProvider };
