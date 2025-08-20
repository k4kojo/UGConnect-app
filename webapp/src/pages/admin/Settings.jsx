import {
  Bell,
  Check,
  Database,
  Eye,
  EyeOff,
  Palette,
  Save,
  Shield,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, LoadingSpinner } from '../../components/ui';

const Settings = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hospital.com',
    phone: '+1 (555) 123-4567',
    department: 'Administration',
    position: 'System Administrator',
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

  const [hospitalData, setHospitalData] = useState({
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
    { id: 'hospital', label: 'Hospital Info', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'doctor', label: 'Doctor Settings', icon: User }
  ];

  // Map URL param to tab state and vice versa
  const paramToTabId = (p) => {
    switch (p) {
      case 'general':
        return 'profile';
      case 'security':
      case 'notifications':
      case 'hospital':
      case 'appearance':
      case 'doctor':
        return p;
      default:
        return null;
    }
  };

  const tabIdToParam = (id) => {
    if (id === 'profile') return 'general';
    return id;
  };

  // Initialize/sync active tab from URL param
  useEffect(() => {
    if (!tab) {
      // No param -> normalize to general for consistency
      navigate('/admin/settings/general', { replace: true });
      return;
    }
    const mapped = paramToTabId(tab);
    if (mapped) {
      setActiveTab(mapped);
    } else {
      // Unknown tab param -> normalize to general
      navigate('/admin/settings/general', { replace: true });
    }
  }, [tab, navigate]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    const p = tabIdToParam(id);
    navigate(`/admin/settings/${p}`);
  };

  const handleSave = async (settingsSection) => {
    setLoading(true);
    setSaveSuccess(false);
    
    // Simulate API call
    console.log(`Saving ${settingsSection} settings`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setSaveSuccess(true);
    
    setTimeout(() => setSaveSuccess(false), 3000);
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
      case 'hospital':
        setHospitalData(prev => ({ ...prev, [field]: value }));
        break;
      case 'doctor':
        setDoctorData(prev => ({ ...prev, [field]: value }));
        break;
      default:
        break;
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDoctorData(prev => ({ ...prev, profilePicture: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, profilePicture: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {profileData.profilePicture ? (
                <img 
                  src={profileData.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAdminProfilePictureChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Recommended: Square image, 400x400 pixels or larger
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Email
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
              Phone
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              value={profileData.department}
              onChange={(e) => handleInputChange('profile', 'department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              value={profileData.position}
              onChange={(e) => handleInputChange('profile', 'position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('profile')}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={securityData.newPassword}
                onChange={(e) => handleInputChange('security', 'newPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={securityData.twoFactorEnabled}
                onChange={(e) => handleInputChange('security', 'twoFactorEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          {Object.entries(notificationData).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-500">
                  Receive notifications for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
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
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderHospitalTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hospital Name
            </label>
            <input
              type="text"
              value={hospitalData.name}
              onChange={(e) => handleInputChange('hospital', 'name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={hospitalData.address}
              onChange={(e) => handleInputChange('hospital', 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={hospitalData.city}
              onChange={(e) => handleInputChange('hospital', 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={hospitalData.state}
              onChange={(e) => handleInputChange('hospital', 'state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              value={hospitalData.zipCode}
              onChange={(e) => handleInputChange('hospital', 'zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={hospitalData.phone}
              onChange={(e) => handleInputChange('hospital', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={hospitalData.email}
              onChange={(e) => handleInputChange('hospital', 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              value={hospitalData.website}
              onChange={(e) => handleInputChange('hospital', 'website', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              value={hospitalData.timezone}
              onChange={(e) => handleInputChange('hospital', 'timezone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('hospital')}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['blue', 'green', 'purple'].map((color) => (
                <button
                  key={color}
                  className={`w-full h-12 rounded-lg border-2 ${
                    color === 'blue' ? 'border-blue-500 bg-blue-500' :
                    color === 'green' ? 'border-green-500 bg-green-500' :
                    'border-purple-500 bg-purple-500'
                  }`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Font Size
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="small">Small</option>
              <option value="medium" selected>Medium</option>
              <option value="large">Large</option>
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
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderDoctorTab = () => (
    <div className="space-y-6">
      {/* Profile Picture Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {doctorData.profilePicture ? (
                <img 
                  src={doctorData.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload New Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Recommended: Square image, 400x400 pixels or larger
            </p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Email
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
              Phone
            </label>
            <input
              type="tel"
              value={doctorData.phone}
              onChange={(e) => handleInputChange('doctor', 'phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>
      
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => handleSave('doctor')}
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
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
      case 'hospital':
        return renderHospitalTab();
      case 'appearance':
        return renderAppearanceTab();
      case 'doctor':
        return renderDoctorTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="h-full flex bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-2">
              <Check className="h-5 w-5 text-green-500" />
              <span className="text-green-800">Settings saved successfully!</span>
            </div>
          )}

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
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
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
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
