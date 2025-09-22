import {
  Bell,
  Check,
  Eye,
  EyeOff,
  Palette,
  Save,
  Shield,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, TopLoadingBar } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { uploadProfilePicture } from '../../services/profilePictureService';

const DoctorSettings = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { user } = useAuth();
  const { 
    data, 
    loading: dataLoading, 
    fetchUserProfile, 
    updateUserProfile, 
    fetchUserSettingsData, 
    updateUserSettingsData 
  } = useData();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataPopulated, setDataPopulated] = useState(false);
  const [profilePictureLoading, setProfilePictureLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'Dr. John',
    lastName: 'Smith',
    email: 'dr.smith@hospital.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Cardiology',
    licenseNumber: 'MD123456',
    experience: '15 years',
    education: 'Harvard Medical School',
    profilePicture: null
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: true,
    sessionTimeout: 30
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    appointmentReminders: true,
    emergencyAlerts: true,
    systemUpdates: false
  });

  const [appearanceData, setAppearanceData] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  });

  const [doctorData, setDoctorData] = useState({
    firstName: 'Dr. John',
    lastName: 'Smith',
    email: 'dr.smith@hospital.com',
    phone: '+1 (555) 123-4567',
    specialization: 'Cardiology',
    licenseNumber: 'MD123456',
    experience: '15 years',
    education: 'Harvard Medical School',
    profilePicture: null
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'doctor', label: 'Doctor Settings', icon: User }
  ];

  // Map URL param to tab state and vice versa
  const paramToTabId = (p) => {
    switch (p) {
      case 'profile':
      case 'security':
      case 'notifications':
      case 'appearance':
      case 'doctor':
      case 'availability':
        return p;
      default:
        return null;
    }
  };

  const tabIdToParam = (id) => {
    return id;
  };

  // Initialize/sync active tab from URL param
  useEffect(() => {
    if (tab) {
      const tabId = paramToTabId(tab);
      if (tabId && tabs.some(t => t.id === tabId)) {
        setActiveTab(tabId);
      } else if (tab === 'availability') {
        // Handle availability as a special case - redirect to availability page
        navigate('/doctor/availability');
        return;
      } else {
        // Invalid tab, redirect to profile
        navigate('/doctor/settings/profile', { replace: true });
      }
    } else {
      // No tab specified, default to profile
      navigate('/doctor/settings/profile', { replace: true });
    }
  }, [tab, navigate]);

  // Load data when component mounts or user changes
  useEffect(() => {
    const loadInitialData = async () => {
      if (!user?.userId) return;
      
      setInitialLoading(true);
      setDataPopulated(false);
      try {
        // Load user profile and settings
        await Promise.all([
          fetchUserProfile(),
          fetchUserSettingsData()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [user?.userId, fetchUserProfile, fetchUserSettingsData]);

  // Update form data when cached data changes
  useEffect(() => {
    let hasUserProfile = false;
    let hasUserSettings = false;

    if (data.userProfile) {
      hasUserProfile = true;
      setProfileData(prev => ({
        ...prev,
        firstName: data.userProfile.firstName || prev.firstName,
        lastName: data.userProfile.lastName || prev.lastName,
        email: data.userProfile.email || prev.email,
        phone: data.userProfile.phoneNumber || prev.phone,
        profilePicture: data.userProfile.profilePicture || prev.profilePicture
      }));
      
      setDoctorData(prev => ({
        ...prev,
        firstName: data.userProfile.firstName || prev.firstName,
        lastName: data.userProfile.lastName || prev.lastName,
        email: data.userProfile.email || prev.email,
        phone: data.userProfile.phoneNumber || prev.phone,
        profilePicture: data.userProfile.profilePicture || prev.profilePicture
      }));
    }

    if (data.userSettings) {
      hasUserSettings = true;
      setNotificationData(prev => ({
        ...prev,
        ...data.userSettings.notifications
      }));
      setAppearanceData(prev => ({
        ...prev,
        ...data.userSettings.appearance
      }));
    }

    // Mark data as populated when we have the essential data
    if (hasUserProfile && !initialLoading) {
      setDataPopulated(true);
    }
  }, [data.userProfile, data.userSettings, initialLoading]);

  const handleTabChange = (tabId) => {
    if (tabId === 'availability') {
      navigate('/doctor/availability');
    } else {
      // Add a brief loading state to prevent flicker when switching tabs
      setActiveTab(tabId);
      navigate(`/doctor/settings/${tabIdToParam(tabId)}`);
    }
  };

  const handleInputChange = (section, field, value) => {
    switch (section) {
      case 'profile':
        setProfileData(prev => ({ ...prev, [field]: value }));
        break;
      case 'security':
        setSecurityData(prev => ({ ...prev, [field]: value }));
        break;
      case 'notifications':
        setNotificationData(prev => ({ ...prev, [field]: value }));
        break;
      case 'appearance':
        setAppearanceData(prev => ({ ...prev, [field]: value }));
        break;
      case 'doctor':
        setDoctorData(prev => ({ ...prev, [field]: value }));
        break;
    }
  };

  const handleProfilePictureUpload = async (event, section = 'profile') => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfilePictureLoading(true);
    try {
      const result = await uploadProfilePicture(file, user.userId);
      if (result.success) {
        const pictureUrl = result.profilePictureUrl;
        
        if (section === 'profile') {
          setProfileData(prev => ({ ...prev, profilePicture: pictureUrl }));
        } else if (section === 'doctor') {
          setDoctorData(prev => ({ ...prev, profilePicture: pictureUrl }));
        }
        
        toast.success('Profile picture updated successfully');
        
        // Refresh user profile to get updated data
        await fetchUserProfile(true);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error.message || 'Failed to upload profile picture');
    } finally {
      setProfilePictureLoading(false);
    }
  };

  const handleSave = async (section) => {
    setLoading(true);
    setSaveSuccess(false);
    
    try {
      let result = null;
      
      switch (section) {
        case 'profile':
          result = await updateUserProfile({
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            phoneNumber: profileData.phone
          });
          break;
          
        case 'security':
          if (securityData.newPassword !== securityData.confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
          }
          
          if (securityData.newPassword && securityData.currentPassword) {
            // Validate password requirements
            if (securityData.newPassword.length < 8) {
              toast.error('New password must be at least 8 characters long');
              return;
            }
            
            result = await updateUserProfile({
              currentPassword: securityData.currentPassword,
              newPassword: securityData.newPassword,
            });
            
            if (result) {
              // Clear password fields on success
              setSecurityData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
              }));
              toast.success('Password updated successfully');
              setSaveSuccess(true);
            }
          } else {
            toast.error('Please provide both current and new passwords');
            return;
          }
          break;
          
        case 'notifications':
          result = await updateUserSettingsData({
            notifications: notificationData
          });
          break;
          
        case 'appearance':
          result = await updateUserSettingsData({
            appearance: appearanceData
          });
          break;
          
        case 'doctor':
          result = await updateUserProfile({
            firstName: doctorData.firstName,
            lastName: doctorData.lastName,
            phoneNumber: doctorData.phone
          });
          break;
      }
      
      if (result !== null) {
        if (result) {
          toast.success('Settings updated successfully');
          setSaveSuccess(true);
        } else {
          toast.error('Failed to update settings');
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {profileData.profilePicture ? (
              <img 
                src={profileData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Photo</h3>
          <p className="text-gray-600">Upload a professional photo for your profile</p>
          <div className="mt-2">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              {profilePictureLoading ? 'Uploading...' : 'Change Photo'}
              <input 
                type="file" 
                className="sr-only" 
                accept="image/*"
                onChange={(e) => handleProfilePictureUpload(e, 'profile')}
                disabled={profilePictureLoading}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={profileData.firstName}
            onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={profileData.lastName}
            onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('profile')}
          disabled={loading}
        >
          {loading ? <span className="mr-2 text-sm">Saving...</span> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={securityData.currentPassword}
                onChange={(e) => handleInputChange('security', 'currentPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={securityData.newPassword}
              onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={securityData.confirmPassword}
                onChange={(e) => handleInputChange('security', 'confirmPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Security Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <button
              onClick={() => handleInputChange('security', 'twoFactorEnabled', !securityData.twoFactorEnabled)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                securityData.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  securityData.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Timeout (minutes)
            </label>
            <select
              value={securityData.sessionTimeout}
              onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('security')}
          disabled={loading}
        >
          {loading ? <span className="mr-2 text-sm">Saving...</span> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries({
            emailNotifications: 'Email Notifications',
            smsNotifications: 'SMS Notifications',
            pushNotifications: 'Push Notifications',
            appointmentReminders: 'Appointment Reminders',
            emergencyAlerts: 'Emergency Alerts',
            systemUpdates: 'System Updates'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500">Receive {label.toLowerCase()}</p>
              </div>
              <button
                onClick={() => handleInputChange('notifications', key, !notificationData[key])}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  notificationData[key] ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    notificationData[key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('notifications')}
          disabled={loading}
        >
          {loading ? <span className="mr-2 text-sm">Saving...</span> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Appearance Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              value={appearanceData.theme}
              onChange={(e) => handleInputChange('appearance', 'theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={appearanceData.language}
              onChange={(e) => handleInputChange('appearance', 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={appearanceData.dateFormat}
              onChange={(e) => handleInputChange('appearance', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Format
            </label>
            <select
              value={appearanceData.timeFormat}
              onChange={(e) => handleInputChange('appearance', 'timeFormat', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="12h">12 Hour</option>
              <option value="24h">24 Hour</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('appearance')}
          disabled={loading}
        >
          {loading ? <span className="mr-2 text-sm">Saving...</span> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderDoctorTab = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            {doctorData.profilePicture ? (
              <img 
                src={doctorData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 text-gray-400" />
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Doctor Profile Photo</h3>
          <p className="text-gray-600">Upload a professional photo for your doctor profile</p>
          <div className="mt-2">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              {profilePictureLoading ? 'Uploading...' : 'Change Photo'}
              <input 
                type="file" 
                className="sr-only" 
                accept="image/*"
                onChange={(e) => handleProfilePictureUpload(e, 'doctor')}
                disabled={profilePictureLoading}
              />
            </label>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            value={doctorData.firstName}
            onChange={(e) => handleInputChange('doctor', 'firstName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            value={doctorData.lastName}
            onChange={(e) => handleInputChange('doctor', 'lastName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={doctorData.email}
            onChange={(e) => handleInputChange('doctor', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={doctorData.phone}
            onChange={(e) => handleInputChange('doctor', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialization
          </label>
          <input
            type="text"
            value={doctorData.specialization}
            onChange={(e) => handleInputChange('doctor', 'specialization', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number
          </label>
          <input
            type="text"
            value={doctorData.licenseNumber}
            onChange={(e) => handleInputChange('doctor', 'licenseNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience
          </label>
          <input
            type="text"
            value={doctorData.experience}
            onChange={(e) => handleInputChange('doctor', 'experience', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education
          </label>
          <input
            type="text"
            value={doctorData.education}
            onChange={(e) => handleInputChange('doctor', 'education', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('doctor')}
          disabled={loading}
        >
          {loading ? <span className="mr-2 text-sm">Saving...</span> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'security':
        return renderSecurityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'doctor':
        return renderDoctorTab();
      default:
        return renderProfileTab();
    }
  };

  // Create skeleton loader for settings content
  const SettingsSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mt-2 animate-pulse"></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs skeleton */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-2 py-4 px-1">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>
            ))}
          </nav>
        </div>

        {/* Content skeleton */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Show loading spinner while initial data is loading
  if (initialLoading || !dataPopulated) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>
        
        {/* Success indicator */}
        {saveSuccess && (
          <div className="flex items-center space-x-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Settings saved successfully</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 animate-fade-in">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
