import {
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  TestTube,
  User,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  AppointmentCard,
  Button,
  Calendar as CalendarComponent,
  LoadingSpinner,
  Modal,
  Noticeboard,
  QuickActionCard,
  StatCard
} from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useData } from '../../contexts/DataContext.jsx';

const DoctorDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    data, 
    loading, 
    error, 
    fetchDoctorDashboard, 
    fetchDoctorRecentActivity 
  } = useData();
  
  // Use cached data from DataContext
  const dashboardData = data.doctorDashboard || {
    todayStats: {
      total: 0,
      completed: 0,
      pending: 0,
      confirmed: 0,
      inProgress: 0
    },
    totalPatients: 0,
    totalAppointments: 0,
    totalMedicalRecords: 0,
    totalLabResults: 0,
    totalPrescriptions: 0,
    doctorProfile: {},
    todayAppointments: []
  };

  const recentActivity = data.doctorRecentActivity || {
    recentAppointments: [],
    recentNotifications: [],
    recentMedicalRecords: [],
    recentLabResults: []
  };

  // Load data if not already cached
  useEffect(() => {
    if (user?.userId && !data.doctorDashboard) {
      fetchDoctorDashboard();
    }
    if (user?.userId && !data.doctorRecentActivity) {
      fetchDoctorRecentActivity();
    }
  }, [user, data.doctorDashboard, data.doctorRecentActivity, fetchDoctorDashboard, fetchDoctorRecentActivity]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Doctor statistics cards data
  const doctorStatCards = [
    { 
      title: 'Today Patients', 
      value: dashboardData.todayStats.total, 
      icon: User, 
      color: 'blue',
      onClick: () => navigate('/doctor/patients')
    },
    { 
      title: 'Completed Today', 
      value: dashboardData.todayStats.completed, 
      icon: CheckCircle, 
      color: 'green',
      onClick: () => navigate('/doctor/appointments?status=completed')
    },
    { 
      title: 'Pending Today', 
      value: dashboardData.todayStats.pending, 
      icon: Clock, 
      color: 'orange',
      onClick: () => navigate('/doctor/appointments?status=pending')
    },
    { 
      title: 'Total Patients', 
      value: dashboardData.totalPatients, 
      icon: Users, 
      color: 'purple',
      onClick: () => navigate('/doctor/patients')
    },
    { 
      title: 'Total Appointments', 
      value: dashboardData.totalAppointments, 
      icon: Calendar, 
      color: 'bg-indigo-100',
      onClick: () => navigate('/doctor/appointments')
    },
    { 
      title: 'Medical Records', 
      value: dashboardData.totalMedicalRecords, 
      icon: FileText, 
      color: 'bg-red-100',
      onClick: () => navigate('/doctor/medical-records')
    }
  ];

  // Quick Actions with functionality
  const quickActions = [
    { 
      name: 'patients', 
      icon: User, 
      color: 'bg-green-100 hover:bg-green-200',
      onClick: () => navigate('/doctor/patients'),
      description: 'View patient list'
    },
    { 
      name: 'appointments', 
      icon: Calendar, 
      color: 'bg-purple-100 hover:bg-purple-200',
      onClick: () => navigate('/doctor/appointments'),
      description: 'Manage appointments'
    },
    { 
      name: 'reports', 
      icon: FileText, 
      color: 'bg-yellow-100 hover:bg-yellow-200',
      onClick: () => navigate('/doctor/reports'),
      description: 'View medical reports'
    },
    { 
      name: 'medical records', 
      icon: FileText, 
      color: 'bg-indigo-100 hover:bg-indigo-200',
      onClick: () => navigate('/doctor/medical-records'),
      description: 'Access medical records'
    },
    { 
      name: 'prescriptions', 
      icon: FileText, 
      color: 'bg-pink-100 hover:bg-pink-200',
      onClick: () => navigate('/doctor/prescriptions'),
      description: 'Manage prescriptions'
    },
    { 
      name: 'lab results', 
      icon: TestTube, 
      color: 'bg-orange-100 hover:bg-orange-200',
      onClick: () => navigate('/doctor/lab-results'),
      description: 'View lab results'
    },
    { 
      name: 'consultations', 
      icon: Users, 
      color: 'bg-teal-100 hover:bg-teal-200',
      onClick: () => setShowConsultationModal(true),
      description: 'Start consultation'
    },
    { 
      name: 'follow-ups', 
      icon: Calendar, 
      color: 'bg-cyan-100 hover:bg-cyan-200',
      onClick: () => setShowFollowUpModal(true),
      description: 'Schedule follow-ups'
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

  // Generate today's appointments from real data or use mock data if empty
  const todayAppointments = dashboardData.todayAppointments.length > 0 
    ? dashboardData.todayAppointments.map(appointment => ({
    id: appointment.appointmentId,
    patientName: appointment.patientName || `${appointment.patientFirstName || ''} ${appointment.patientLastName || ''}`.trim(),
    time: new Date(appointment.appointmentDate).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    status: appointment.status,
    phone: appointment.patientPhoneNumber || 'N/A',
    email: appointment.patientEmail || 'N/A',
    address: appointment.patientAddress || 'N/A',
    reason: appointment.reasonForVisit || 'No reason specified'
      }))
    : [
        {
          id: 1,
          patientName: 'Alice Brown',
          time: '09:00 AM',
          status: 'completed',
          phone: '555-0123',
          email: 'alice@email.com',
          address: '123 Main St, City',
          reason: 'General checkup'
        },
        {
          id: 2,
          patientName: 'Bob Wilson',
          time: '10:30 AM',
          status: 'in-progress',
          phone: '555-0456',
          email: 'bob@email.com',
          address: '456 Oak Ave, City',
          reason: 'Follow-up consultation'
        },
        {
          id: 3,
          patientName: 'Carol Davis',
          time: '02:00 PM',
          status: 'pending',
          phone: '555-0789',
          email: 'carol@email.com',
          address: '789 Pine Rd, City',
          reason: 'Specialist consultation'
        }
      ];

  // Generate calendar events from recent appointments
  const calendarEvents = recentActivity.recentAppointments.map(appointment => ({
    date: new Date(appointment.appointmentDate),
    event: `Appointment: ${appointment.reasonForVisit || 'No reason specified'}`,
    description: `Patient: ${appointment.patientName || 'Unknown'}`,
    participants: appointment.patientName || 'Unknown'
  }));

  // Appointment action handlers
  const handleViewDetails = (appointment) => {
    navigate(`/doctor/appointments/${appointment.id}`);
  };

  const handleStartSession = (appointment) => {
    navigate(`/doctor/consultation/${appointment.id}`);
  };

  const handleReschedule = (appointment) => {
    setShowScheduleModal(true);
    // TODO: Pass appointment data to modal for editing
    console.log('Rescheduling appointment:', appointment);
  };

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading dashboard data..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome back, Dr. {user?.firstName} {user?.lastName}</h3>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctorStatCards.map((stat, index) => (
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
      </div>


      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Appointments</h3>
        <div className="space-y-4">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onViewDetails={handleViewDetails}
                onStartSession={handleStartSession}
                onReschedule={handleReschedule}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No appointments scheduled for today</p>
            </div>
          )}
        </div>
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
          title="System Notifications"
          onViewAll={() => navigate('/doctor/notifications')}
        />
      </div>

      {/* Modals */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Appointment"
        size="md"
      >
        <div className="space-y-4">
          <p>Schedule appointment modal content would go here.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Schedule
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        title="Start Consultation"
        size="lg"
      >
        <div className="space-y-4">
          <p>Consultation modal content would go here.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowConsultationModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Start Consultation
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFollowUpModal}
        onClose={() => setShowFollowUpModal(false)}
        title="Schedule Follow-up"
        size="md"
      >
        <div className="space-y-4">
          <p>Follow-up scheduling modal content would go here.</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowFollowUpModal(false)}>
              Cancel
            </Button>
            <Button variant="primary">
              Schedule Follow-up
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
