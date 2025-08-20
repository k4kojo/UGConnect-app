import {
  ArrowLeftRight,
  Calendar,
  Clock,
  DollarSign,
  Download,
  Globe,
  Info,
  Settings,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarComponent,
  LoadingSpinner,
  Noticeboard,
  QuickActionCard,
  StatCard
} from '../../components/ui';
import { useData } from '../../contexts/DataContext.jsx';

const AdminDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const { 
    data, 
    loading, 
    error, 
    fetchAdminDashboard, 
    fetchAdminRecentActivity 
  } = useData();
  
  // Use cached data from DataContext
  const dashboardData = data.adminDashboard || {
    roleStats: {
      doctor: 0,
      patient: 0,
      nurse: 0,
      pharmacist: 0,
      laboratorist: 0,
      accountant: 0
    },
    appointmentStats: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    },
    paymentStats: {
      total: 0,
      completed: 0,
      pending: 0,
      totalRevenue: 0
    },
    recentNotifications: [],
    totalUsers: 0
  };
  
  const recentActivity = data.adminRecentActivity || {
    recentAppointments: [],
    recentPayments: [],
    recentNotifications: []
  };

  // Load data if not already cached
  useEffect(() => {
    if (!data.adminDashboard) {
      fetchAdminDashboard();
    }
    if (!data.adminRecentActivity) {
      fetchAdminRecentActivity();
    }
  }, [data.adminDashboard, data.adminRecentActivity, fetchAdminDashboard, fetchAdminRecentActivity]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  // Statistics cards data
  const statCards = [
    { 
      title: 'Total Users', 
      value: dashboardData.totalUsers, 
      icon: Users, 
      color: 'blue',
      onClick: () => navigate('/admin/users')
    },
    { 
      title: 'Total Appointments', 
      value: dashboardData.appointmentStats.total, 
      icon: Calendar, 
      color: 'green',
      onClick: () => navigate('/admin/appointments')
    },
    { 
      title: 'Total Revenue', 
      value: formatCurrency(dashboardData.paymentStats.totalRevenue), 
      icon: DollarSign, 
      color: 'yellow',
      onClick: () => navigate('/admin/payments')
    },
    { 
      title: 'Pending Appointments', 
      value: dashboardData.appointmentStats.pending, 
      icon: Clock, 
      color: 'orange',
      onClick: () => navigate('/admin/appointments?status=pending')
    }
  ];

  // Role statistics for overview section
  const roleStats = [
    { name: 'doctor', count: dashboardData.roleStats.doctor },
    { name: 'patient', count: dashboardData.roleStats.patient },
    { name: 'nurse', count: dashboardData.roleStats.nurse },
    { name: 'pharmacist', count: dashboardData.roleStats.pharmacist },
    { name: 'laboratorist', count: dashboardData.roleStats.laboratorist },
    { name: 'accountant', count: dashboardData.roleStats.accountant }
  ];

  // Quick actions data
  const quickActions = [
    { 
      name: 'doctors', 
      icon: Users, 
      color: 'bg-blue-100 hover:bg-blue-200',
      onClick: () => navigate('/admin/doctors'),
      description: 'Manage doctors'
    },
    { 
      name: 'patients', 
      icon: Users, 
      color: 'bg-green-100 hover:bg-green-200',
      onClick: () => navigate('/admin/patients'),
      description: 'Manage patients'
    },
    { 
      name: 'appointments', 
      icon: ArrowLeftRight, 
      color: 'bg-purple-100 hover:bg-purple-200',
      onClick: () => navigate('/admin/appointments'),
      description: 'Manage appointments'
    },
    { 
      name: 'payments', 
      icon: DollarSign, 
      color: 'bg-yellow-100 hover:bg-yellow-200',
      onClick: () => navigate('/admin/payments'),
      description: 'Manage payments'
    },
    { 
      name: 'noticeboard', 
      icon: Info, 
      color: 'bg-indigo-100 hover:bg-indigo-200',
      onClick: () => navigate('/admin/noticeboard'),
      description: 'Manage notices'
    },
    { 
      name: 'settings', 
      icon: Settings, 
      color: 'bg-gray-100 hover:bg-gray-200',
      onClick: () => navigate('/admin/settings'),
      description: 'System settings'
    },
    { 
      name: 'language', 
      icon: Globe, 
      color: 'bg-pink-100 hover:bg-pink-200',
      onClick: () => navigate('/admin/language'),
      description: 'Language settings'
    },
    { 
      name: 'backup', 
      icon: Download, 
      color: 'bg-red-100 hover:bg-red-200',
      onClick: () => navigate('/admin/backup'),
      description: 'System backup'
    },
    { 
      name: 'calendar-test', 
      icon: Calendar, 
      color: 'bg-green-100 hover:bg-green-200',
      onClick: () => navigate('/admin/calendar-test'),
      description: 'Test calendar views'
    }
  ];

  // Generate notices from recent notifications
  const notices = recentActivity.recentNotifications.map(notification => ({
    id: notification.id,
    title: notification.title || 'System Notification',
    description: notification.message || notification.content || 'No description available',
    date: new Date(notification.createdAt).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    type: notification.type || 'system'
  }));

  // Generate calendar events from recent appointments
  const calendarEvents = recentActivity.recentAppointments.map(appointment => ({
    date: new Date(appointment.appointmentDate),
    event: `Appointment: ${appointment.reasonForVisit || 'No reason specified'}`,
    description: `Patient: ${appointment.patientName || 'Unknown'}`,
    participants: appointment.patientName || 'Unknown'
  }));

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-6">
      {/* Admin Dashboard Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {roleStats.map((stat) => (
            <div key={stat.name} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.count}</div>
              <div className="text-sm text-gray-600 capitalize">{stat.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            onClick={stat.onClick}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard
              key={index}
              name={action.name}
              icon={action.icon}
              color={action.color}
              onClick={action.onClick}
              description={action.description}
            />
          ))}
        </div>
      </div>

      {/* Bottom Section - Calendar and Noticeboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarComponent
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={calendarEvents}
          onDayClick={(day) => {
            // Handle day click - could open appointment details
            console.log('Day clicked:', day);
          }}
        />
        <Noticeboard 
          notices={notices}
          title="Notifications"
          onViewAll={() => navigate('/admin/notifications')}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
