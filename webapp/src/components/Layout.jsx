import {
    Calendar,
    FileText,
    HelpCircle,
    Home,
    LogOut,
    Menu,
    MessageCircle,
    Settings,
    Settings as SettingsIcon,
    TestTube,
    User,
    UserCheck,
    Users
} from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Header, Sidebar } from './layout/index';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleUserMenuClose = () => {
    setUserMenuOpen(false);
  };

  const handleSidebarToggle = (type) => {
    if (type === 'settings') {
      setSettingsOpen(!settingsOpen);
    }
  };

  const handleNavigation = (item) => {
      // Check if the route exists before navigating
  const validRoutes = [
    '/admin',
    '/doctor',
    '/admin/appointments',
    '/admin/patients',
    '/admin/prescriptions',
    '/admin/lab-results',
    '/admin/consultations',
    '/admin/chat',
    '/admin/notifications',
    '/admin/settings',
    '/admin/settings/general',
    '/admin/settings/security',
    '/admin/settings/notifications',
    '/admin/settings/hospital',
    '/admin/settings/appearance',
    '/admin/reports',
    '/doctor/appointments',
    '/doctor/prescriptions',
    '/doctor/chat',
    '/doctor/patients',
    '/doctor/consultations',
    '/doctor/lab-results',
    '/doctor/availability',
    '/doctor/notifications'
  ];

    if (validRoutes.includes(item.path)) {
      navigate(item.path);
      setSidebarOpen(false);
    } else {
      // For routes that don't exist yet, show an alert or handle gracefully
      alert('This feature is coming soon!');
    }
  };

  const handleProfileClick = () => {
    // For now, navigate to the main dashboard since profile page doesn't exist
    navigate(user?.role === 'admin' ? '/admin' : '/doctor');
    handleUserMenuClose();
  };

  const handleSettingsClick = () => {
    // Navigate to settings if it exists, otherwise show message
    if (user?.role === 'admin') {
      navigate('/admin/settings');
    } else {
      alert('Settings page is coming soon!');
    }
    handleUserMenuClose();
  };

  const handleHelpClick = () => {
    alert('Help & Support is coming soon!');
    handleUserMenuClose();
  };

  const getSidebarItems = () => {
    // Doctor-focused sidebar
    if (user?.role === 'doctor') {
      const baseItems = [
        { name: 'overview', icon: Home, path: '/doctor', isActive: location.pathname === '/doctor' },
        { name: 'appointments', icon: Calendar, path: '/doctor/appointments', isActive: location.pathname === '/doctor/appointments' },
        { name: 'patients', icon: Users, path: '/doctor/patients', isActive: location.pathname === '/doctor/patients' },
        { name: 'consultations', icon: UserCheck, path: '/doctor/consultations', isActive: location.pathname === '/doctor/consultations' },
        { name: 'prescriptions', icon: FileText, path: '/doctor/prescriptions', isActive: location.pathname.includes('/doctor/prescriptions') },
        { name: 'lab results', icon: TestTube, path: '/doctor/lab-results', isActive: location.pathname === '/doctor/lab-results' },
        { name: 'chats', icon: MessageCircle, path: '/doctor/chat', isActive: location.pathname === '/doctor/chat' },
        { name: 'availability', icon: Calendar, path: '/doctor/availability', isActive: location.pathname === '/doctor/availability' },
      ];

      // Doctor has no settings submenu yet
      const settingsItems = [];
      return { baseItems, settingsItems };
    }

    // Admin-focused sidebar
    const baseItems = [
      { name: 'overview', icon: Home, path: '/admin', isActive: location.pathname === '/admin' },
      { name: 'appointments', icon: Calendar, path: '/admin/appointments', isActive: location.pathname === '/admin/appointments' },
      { name: 'patients', icon: Users, path: '/admin/patients', isActive: location.pathname === '/admin/patients' },
      { name: 'prescriptions', icon: FileText, path: '/admin/prescriptions', isActive: location.pathname.includes('/admin/prescriptions') },
      { name: 'lab results', icon: TestTube, path: '/admin/lab-results', isActive: location.pathname === '/admin/lab-results' },
      { name: 'consultations', icon: UserCheck, path: '/admin/consultations', isActive: location.pathname === '/admin/consultations' },
      { name: 'reports', icon: FileText, path: '/admin/reports', isActive: location.pathname === '/admin/reports' },
    ];

    const settingsItems = [
      { 
        name: 'settings', 
        icon: Settings, 
        path: '/admin/settings', 
        hasDropdown: true,
        isOpen: settingsOpen,
        isActive: location.pathname.includes('/settings'),
        subItems: [
          { name: 'general', path: '/admin/settings/general' },
          { name: 'security', path: '/admin/settings/security' },
          { name: 'notifications', path: '/admin/settings/notifications' }
        ]
      },
    ];

    return { baseItems, settingsItems };
  };

  const { baseItems, settingsItems } = getSidebarItems();

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Header Bar */}
      <Header
        title="UNIVERSITY OF GHANA HOSPITAL MANAGEMENT SYSTEM"
        user={user}
        onUserMenuToggle={handleUserMenuToggle}
        userMenuOpen={userMenuOpen}
      >
        {/* Additional header content can go here */}
      </Header>

      {/* Yellow Separator Line */}
      <div className="h-1 bg-yellow-400 flex-shrink-0" />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          items={baseItems}
          settingsItems={settingsItems}
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          onItemClick={handleNavigation}
        />

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">
                {user?.role === 'admin' ? 'Admin Dashboard' : 'Doctor Dashboard'}
              </h2>
              <div className="w-6" />
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>

      {/* User Menu Dropdown */}
      {userMenuOpen && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className="fixed inset-0 z-40"
            onClick={handleUserMenuClose}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={handleProfileClick}>
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || 'User'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              <button
                onClick={handleProfileClick}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <User className="mr-3 h-4 w-4" />
                My Profile
              </button>
              
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <SettingsIcon className="mr-3 h-4 w-4" />
                Settings
              </button>
              
              <button
                onClick={handleHelpClick}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
              >
                <HelpCircle className="mr-3 h-4 w-4" />
                Help & Support
              </button>
              
              <div className="border-t border-gray-100 my-1" />
              
              <button
                onClick={() => {
                  handleLogout();
                  handleUserMenuClose();
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
