import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { DataProvider } from './contexts/DataContext.jsx';
import Login from './pages/Login';
import AddDoctor from './pages/admin/AddDoctor';
import AdminAppointments from './pages/admin/Appointments';
import AdminBackup from './pages/admin/Backup';
import CalendarTest from './pages/admin/CalendarTest';
import AdminChat from './pages/admin/Chat';
import AdminConsultations from './pages/admin/Consultations';
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminLabResults from './pages/admin/LabResults';
import AdminLanguage from './pages/admin/Language';
import AdminNoticeboard from './pages/admin/Noticeboard';
import AdminNotifications from './pages/admin/Notifications';
import AdminPatients from './pages/admin/Patients';
import AdminPayments from './pages/admin/Payments';
import AdminPrescriptions from './pages/admin/Prescriptions';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminUsers from './pages/admin/Users';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorAvailability from './pages/doctor/Availability';
import DoctorChat from './pages/doctor/Chat';
import DoctorConsultations from './pages/doctor/Consultations';
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorLabResults from './pages/doctor/LabResults';
import DoctorNotifications from './pages/doctor/Notifications';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPrescriptions from './pages/doctor/Prescriptions';

function DefaultRedirect() {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('DefaultRedirect - User:', user, 'Authenticated:', isAuthenticated, 'Loading:', loading);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('DefaultRedirect - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  switch (user?.role) {
    case 'admin':
      console.log('DefaultRedirect - Admin user, redirecting to /admin');
      return <Navigate to="/admin" replace />;
    case 'doctor':
      console.log('DefaultRedirect - Doctor user, redirecting to /doctor');
      return <Navigate to="/doctor" replace />;
    default:
      console.log('DefaultRedirect - Unknown role:', user?.role, 'redirecting to login');
      return <Navigate to="/login" replace />;
  }
}

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log('ProtectedRoute - User:', user, 'Authenticated:', isAuthenticated, 'Loading:', loading, 'AllowedRoles:', allowedRoles);
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.log('ProtectedRoute - User role not allowed:', user?.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }
  
  console.log('ProtectedRoute - Access granted');
  return children;
}

function ComingSoonPage({ title }) {
  console.log('ComingSoonPage rendered with title:', title);
  console.log('Current URL:', window.location.href);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">This feature is coming soon!</p>
        <div className="mt-4 text-sm text-gray-500">
          <p>URL: {window.location.href}</p>
          <p>Please check the browser console for more details.</p>
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/patients" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminPatients />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/appointments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminAppointments />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/chat" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminChat />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminSettings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/settings/:tab" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminSettings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/reports" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminReports />
          </Layout>
        </ProtectedRoute>
      } />
      
            {/* Admin Prescriptions */}
      <Route path="/admin/prescriptions" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminPrescriptions />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Lab Results */}
      <Route path="/admin/lab-results" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminLabResults />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Consultations */}
      <Route path="/admin/consultations" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminConsultations />
          </Layout>
        </ProtectedRoute>
      } />

      {/* Admin Notifications */}
      <Route path="/admin/notifications" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminNotifications />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Doctors */}
      <Route path="/admin/doctors" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminDoctors />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Add Doctor */}
      <Route path="/admin/doctors/add" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AddDoctor />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Payments */}
      <Route path="/admin/payments" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminPayments />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Noticeboard */}
      <Route path="/admin/noticeboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminNoticeboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Language */}
      <Route path="/admin/language" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminLanguage />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Backup */}
      <Route path="/admin/backup" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminBackup />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Users */}
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <AdminUsers />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Calendar Test */}
      <Route path="/admin/calendar-test" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout>
            <CalendarTest />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Doctor Routes */}
      <Route path="/doctor" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/appointments" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorAppointments />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/patients" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorPatients />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/consultations" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorConsultations />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/prescriptions" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorPrescriptions />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/lab-results" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorLabResults />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/chat" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorChat />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/availability" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorAvailability />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/doctor/notifications" element={
        <ProtectedRoute allowedRoles={['doctor']}>
          <Layout>
            <DoctorNotifications />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Default redirect */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="/unauthorized" element={<ComingSoonPage title="Unauthorized: Access denied" />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
