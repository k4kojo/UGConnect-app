import React, { createContext, useContext, useEffect, useState } from 'react';
import { userAPI, userSettingsAPI } from '../services/api';
import { dashboardService } from '../services/dashboardService.js';
import { doctorDashboardService } from '../services/doctorDashboardService.js';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [data, setData] = useState({
    // Doctor data
    doctorDashboard: null,
    doctorRecentActivity: null,
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
    return Date.now() - lastFetchTime > CACHE_DURATION;
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
      const response = await doctorDashboardService.getDoctorDashboardStats(user.userId);
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

  const fetchDoctorRecentActivity = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'doctor') return;
    
    const key = 'doctorRecentActivity';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await doctorDashboardService.getDoctorRecentActivity(user.userId);
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

  const fetchAdminDashboard = async (forceRefresh = false) => {
    if (!user?.userId || user?.role !== 'admin') return;
    
    const key = 'adminDashboard';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const response = await dashboardService.getAdminDashboardStats();
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
    try {
      // Use appropriate service based on user role
      const service = user?.role === 'doctor' ? doctorDashboardService : dashboardService;
      const response = await service.getPrescriptions();
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

  const fetchLabResults = async (forceRefresh = false) => {
    const key = 'labResults';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const service = user?.role === 'doctor' ? doctorDashboardService : dashboardService;
      const response = await service.getLabResults();
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
      const service = user?.role === 'doctor' ? doctorDashboardService : dashboardService;
      const response = await service.getNotifications();
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

  const fetchChatRooms = async (forceRefresh = false) => {
    const key = 'chatRooms';
    if (!forceRefresh && data[key] && !isDataStale(key)) {
      return data[key];
    }

    setLoading(true);
    try {
      const service = user?.role === 'doctor' ? doctorDashboardService : dashboardService;
      const response = await service.getChatRooms();
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
      const service = user?.role === 'doctor' ? doctorDashboardService : dashboardService;
      const response = await service.getChatMessages(roomId);
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
      const response = await doctorDashboardService.getDoctorPatients(user.userId);
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
      const response = await doctorDashboardService.getDoctorAppointments(user.userId);
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
        // Refresh profile settings after update
        await fetchProfileSettings(userId, true);
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
        // Refresh security settings after update
        await fetchSecuritySettings(userId, true);
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
        // Refresh notification preferences after update
        await fetchNotificationPreferences(userId, true);
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
        // Refresh availability after update
        await fetchDoctorAvailability(true);
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

  // Initialize data when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Load initial data based on user role
      if (user.role === 'doctor') {
        fetchDoctorDashboard();
        fetchDoctorRecentActivity();
      } else if (user.role === 'admin') {
        fetchAdminDashboard();
        fetchAdminRecentActivity();
      }
    }
  }, [isAuthenticated, user]);

  // Clear data when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setData({
        doctorDashboard: null,
        doctorRecentActivity: null,
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
    fetchDoctorRecentActivity,
    fetchDoctorAppointments,
    fetchDoctorPatients,
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
    fetchLabResults,
    fetchNotifications,
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
};
