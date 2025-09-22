import {
  ArrowLeftRight,
  Calendar,
  Clock,
  Download,
  Info,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Calendar as CalendarComponent,
  Noticeboard,
  QuickActionCard,
  StatCard,
  TopLoadingBar,
} from "../../components/ui";
import { useData } from "../../contexts/DataContext.jsx";

const AdminDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    fetchAdminDashboard,
    fetchAdminRecentActivity,
    fetchNotifications,
  } = useData();

  // Use cached data from DataContext
  const dashboardData = data.adminDashboard || {
    roleStats: {
      doctor: 0,
      patient: 0,
      nurse: 0,
      pharmacist: 0,
      laboratorist: 0,
      accountant: 0,
    },
    appointmentStats: {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
    },
    paymentStats: {
      total: 0,
      completed: 0,
      pending: 0,
      totalRevenue: 0,
    },
    recentNotifications: [],
    totalUsers: 0,
  };

  const recentActivity = data.adminRecentActivity || {
    recentAppointments: [],
    recentPayments: [],
    recentNotifications: [],
  };

  // Load data if not already cached
  useEffect(() => {
    if (!data.adminDashboard) {
      fetchAdminDashboard();
    }
    if (!data.adminRecentActivity) {
      fetchAdminRecentActivity();
    }
    if (!data.notifications) {
      fetchNotifications();
    }
  }, [
    data.adminDashboard,
    data.adminRecentActivity,
    data.notifications,
    fetchAdminDashboard,
    fetchAdminRecentActivity,
    fetchNotifications,
  ]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      currencyDisplay: "symbol",
    }).format(amount);
  };

  // Statistics cards data
  const statCards = [
    {
      title: "Total Users",
      value: dashboardData.totalUsers,
      icon: Users,
      color: "blue",
      onClick: () => navigate("/admin/users"),
    },
    {
      title: "Total Appointments",
      value: dashboardData.appointmentStats.total,
      icon: Calendar,
      color: "green",
      onClick: () => navigate("/admin/appointments"),
    },
    {
      title: "Total Revenue",
      value: formatCurrency(dashboardData.paymentStats.totalRevenue),
      icon: Wallet,
      color: "yellow",
      onClick: () => navigate("/admin/payments"),
    },
    {
      title: "Pending Appointments",
      value: dashboardData.appointmentStats.pending,
      icon: Clock,
      color: "orange",
      onClick: () => navigate("/admin/appointments?status=pending"),
    },
  ];

  // Role statistics for overview section
  // const roleStats = [
  //   { name: 'doctor', count: dashboardData.roleStats.doctor },
  //   { name: 'patient', count: dashboardData.roleStats.patient },
  //   { name: 'nurse', count: dashboardData.roleStats.nurse },
  //   { name: 'pharmacist', count: dashboardData.roleStats.pharmacist },
  //   { name: 'laboratorist', count: dashboardData.roleStats.laboratorist },
  //   { name: 'accountant', count: dashboardData.roleStats.accountant }
  // ];

  // Quick actions data
  const quickActions = [
    {
      name: "doctors",
      icon: Users,
      color: "bg-blue-100 hover:bg-blue-200",
      onClick: () => navigate("/admin/doctors"),
      description: "Manage doctors",
    },
    {
      name: "patients",
      icon: Users,
      color: "bg-green-100 hover:bg-green-200",
      onClick: () => navigate("/admin/patients"),
      description: "Manage patients",
    },
    {
      name: "appointments",
      icon: ArrowLeftRight,
      color: "bg-purple-100 hover:bg-purple-200",
      onClick: () => navigate("/admin/appointments"),
      description: "Manage appointments",
    },
    {
      name: "payments",
      icon: Wallet,
      color: "bg-green-100 hover:bg-green-200",
      onClick: () => navigate("/admin/payments"),
      description: "Manage payments",
    },
    {
      name: "noticeboard",
      icon: Info,
      color: "bg-indigo-100 hover:bg-indigo-200",
      onClick: () => navigate("/admin/noticeboard"),
      description: "Manage notices",
    },
    {
      name: "settings",
      icon: Settings,
      color: "bg-gray-100 hover:bg-gray-200",
      onClick: () => navigate("/admin/settings"),
      description: "System settings",
    },
    {
      name: "backup",
      icon: Download,
      color: "bg-red-100 hover:bg-red-200",
      onClick: () => navigate("/admin/backup"),
      description: "System backup",
    },
  ];

  // Generate notices from recent notifications
  const notices = (data.notifications || []).slice(0, 5).map((notification) => {
    const createdAt = notification.createdAt
      ? new Date(notification.createdAt)
      : new Date();
    const isValidDate = !isNaN(createdAt.getTime());

    return {
      id: notification.id,
      title: `${
        notification.type === "appointment"
          ? "New Appointment"
          : notification.type === "lab_result"
          ? "Lab Result Ready"
          : notification.type === "system"
          ? "System Notice"
          : "Notification"
      }`,
      description: notification.message || "No description available",
      date: isValidDate
        ? createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Invalid Date",
      time: isValidDate
        ? createdAt.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      type: notification.type || "system",
      isRead: notification.isRead,
    };
  });

  // Generate calendar events from recent appointments
  const calendarEvents = recentActivity.recentAppointments.map(
    (appointment) => ({
      date: new Date(appointment.appointmentDate),
      event: `Appointment: ${
        appointment.reasonForVisit || "No reason specified"
      }`,
      description: `Patient: ${appointment.patientName || "Unknown"}`,
      participants: appointment.patientName || "Unknown",
    })
  );

  return (
    <>
      <TopLoadingBar
        loading={loading}
        colorClass="bg-blue-600"
        trackClass="bg-blue-200/50"
      />
      <div className="space-y-6">
        {/* Admin Dashboard Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Info className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Doctor Count */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.roleStats.doctor}
              </div>
              <div className="text-sm text-gray-600">Doctor</div>
            </div>

            {/* Patient Count */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.roleStats.patient}
              </div>
              <div className="text-sm text-gray-600">Patient</div>
            </div>

            {/* Total Users */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>

            {/* Total Appointments */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.appointmentStats.total}
              </div>
              <div className="text-sm text-gray-600">Total Appointments</div>
            </div>

            {/* Total Revenue */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.paymentStats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>

            {/* Pending Appointments */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData.appointmentStats.pending}
              </div>
              <div className="text-sm text-gray-600">Pending Appointments</div>
            </div>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
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
              console.log("Day clicked:", day);
            }}
          />
          <Noticeboard
            notices={notices}
            title="Notifications"
            onViewAll={() => navigate("/admin/notifications")}
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
