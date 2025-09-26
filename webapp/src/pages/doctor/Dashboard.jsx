import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MapPin,
  Mic,
  MicOff,
  Phone,
  TestTube,
  User,
  Users,
  Video,
  VideoOff,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  CalendarSection,
  DashboardLayout,
  NoticeboardSection,
  PageHeader,
  QuickActions,
  StatisticsGrid,
} from "../../components/shared";
import {
  AppointmentCard,
  Button,
  Modal,
  TopLoadingBar,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useData } from "../../contexts/DataContext.jsx";
import { appointmentAPI } from "../../services/api.js";

// Reschedule Form Component
const RescheduleForm = ({ onSubmit, onCancel }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    setIsSubmitting(true);
    try {
      const newDateTime = new Date(`${selectedDate}T${selectedTime}`);
      await onSubmit(newDateTime);
    } catch (error) {
      console.error("Error in reschedule form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={today}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          New Time
        </label>
        <input
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? "Rescheduling..." : "Reschedule"}
        </Button>
      </div>
    </form>
  );
};

// Video Session Controls Component
const VideoSessionControls = ({ onStartCall, onCancel }) => {
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [stream, setStream] = useState(null);
  const [permissionError, setPermissionError] = useState("");
  const videoRef = React.useRef(null);

  const requestMediaAccess = async (video = false, audio = false) => {
    try {
      setPermissionError("");

      if (stream) {
        // Stop existing stream
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      if (!video && !audio) {
        return;
      }

      // Request media with specific constraints
      const constraints = {};
      if (video) constraints.video = true;
      if (audio) constraints.audio = true;

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      setStream(newStream);

      if (videoRef.current && video) {
        videoRef.current.srcObject = newStream;
      }

      return newStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      let errorMessage = "Error accessing ";

      // More specific error messages based on what was requested
      if (video && audio) {
        errorMessage += "camera/microphone. ";
      } else if (video) {
        errorMessage += "camera. ";
      } else if (audio) {
        errorMessage += "microphone. ";
      }

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow permissions.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "Device not found.";
      } else if (error.name === "NotReadableError") {
        errorMessage += "Device is already in use.";
      } else {
        errorMessage += error.message;
      }

      setPermissionError(errorMessage);
      throw error; // Re-throw so calling functions can handle it
    }
  };

  const handleCameraToggle = async () => {
    const newCameraState = !cameraEnabled;
    console.debug("Camera toggle:", {
      current: cameraEnabled,
      new: newCameraState,
    });

    if (newCameraState) {
      toast.loading("Camera turning on...");
    }

    setCameraEnabled(newCameraState);

    try {
      if (newCameraState || micEnabled) {
        await requestMediaAccess(newCameraState, micEnabled);
        if (newCameraState) {
          toast.dismiss();
          toast.success("Camera is on");
        }
      } else {
        // Turn off all media if both camera and mic are disabled
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        toast.dismiss();
      }
    } catch {
      toast.dismiss();
      toast.error("Failed to access camera");
      setCameraEnabled(!newCameraState); // Revert state on error
    }
  };

  const handleMicToggle = async () => {
    const newMicState = !micEnabled;
    console.debug("Microphone toggle:", {
      current: micEnabled,
      new: newMicState,
    });

    if (newMicState) {
      toast.loading("Microphone turning on...");
    }

    setMicEnabled(newMicState);

    try {
      if (cameraEnabled || newMicState) {
        await requestMediaAccess(cameraEnabled, newMicState);
        if (newMicState) {
          toast.dismiss();
          toast.success("Microphone is on");
        }
      } else {
        // Turn off all media if both camera and mic are disabled
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        toast.dismiss();
      }
    } catch {
      toast.dismiss();
      toast.error("Failed to access microphone");
      setMicEnabled(!newMicState); // Revert state on error
    }
  };

  const handleStartCall = async () => {
    setIsStarting(true);
    console.debug("Starting video call process");

    try {
      await onStartCall(stream);
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start video session");
    } finally {
      setIsStarting(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="relative w-64 h-48 mx-auto bg-gray-900 rounded-lg overflow-hidden mb-4">
          {cameraEnabled && stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {cameraEnabled ? (
                <div className="text-center text-white">
                  <Video className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Starting camera...</p>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <VideoOff className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Camera is off</p>
                </div>
              )}
            </div>
          )}
        </div>

        {permissionError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <p className="text-sm text-red-600">{permissionError}</p>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-4">
          Enable your camera and microphone to start the session
        </p>
      </div>

      <div className="flex justify-center space-x-4 mb-6">
        <button
          type="button"
          onClick={handleCameraToggle}
          className={`flex items-center px-4 py-2 rounded-md ${
            cameraEnabled
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
          disabled={isStarting}
        >
          {cameraEnabled ? (
            <>
              <Video className="h-4 w-4 mr-2" />
              Camera On
            </>
          ) : (
            <>
              <VideoOff className="h-4 w-4 mr-2" />
              Camera Off
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleMicToggle}
          className={`flex items-center px-4 py-2 rounded-md ${
            micEnabled
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
          disabled={isStarting}
        >
          {micEnabled ? (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Mic On
            </>
          ) : (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Mic Off
            </>
          )}
        </button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} disabled={isStarting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleStartCall}
          disabled={isStarting || (!cameraEnabled && !micEnabled)}
          className="bg-green-600 hover:bg-green-700"
        >
          {isStarting ? "Starting Session..." : "Start Video Session"}
        </Button>
      </div>
    </div>
  );
};

const DoctorDashboard = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showStartSessionModal, setShowStartSessionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    data,
    loading,
    error,
    fetchDoctorDashboard,
    fetchNotifications,
    fetchDoctorPatients,
    fetchDoctorAppointments,
    fetchDoctorPrescriptions,
    fetchDoctorLabResults,
  } = useData();

  // Use cached data from DataContext
  const dashboardData = data.doctorDashboard || {
    todayStats: {
      total: 0,
      completed: 0,
      pending: 0,
      confirmed: 0,
      inProgress: 0,
    },
    totalPatients: 0,
    totalAppointments: 0,
    totalMedicalRecords: 0,
    totalLabResults: 0,
    totalPrescriptions: 0,
    doctorProfile: {},
    todayAppointments: [],
  };

  // Use notifications from shared data instead of non-existent recent activity
  const notifications = data.notifications || [];

  // Load data once per user session: core first, then secondary in background
  useEffect(() => {
    const loadCoreThenSecondary = async () => {
      if (!user?.userId) return;

      try {
        await fetchDoctorDashboard();

        Promise.allSettled([
          fetchNotifications(),
          fetchDoctorPatients?.(),
          fetchDoctorAppointments?.(),
          fetchDoctorPrescriptions?.(),
          fetchDoctorLabResults?.(),
        ]).catch(() => {});
      } catch (err) {
        console.error("Error fetching dashboard core data:", err);
        toast.error("Failed to load dashboard");
      }
    };
    loadCoreThenSecondary();
  }, [
    user?.userId,
    fetchDoctorDashboard,
    fetchNotifications,
    fetchDoctorPatients,
    fetchDoctorAppointments,
    fetchDoctorPrescriptions,
    fetchDoctorLabResults,
  ]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Doctor statistics cards data
  const doctorStatCards = [
    {
      title: "Today Patients",
      value: dashboardData.todayStats.total,
      icon: User,
      color: "blue",
      onClick: () => navigate("/doctor/patients"),
    },
    {
      title: "Completed Today",
      value: dashboardData.todayStats.completed,
      icon: CheckCircle,
      color: "green",
      onClick: () => navigate("/doctor/appointments?status=completed"),
    },
    {
      title: "Pending Today",
      value: dashboardData.todayStats.pending,
      icon: Clock,
      color: "orange",
      onClick: () => navigate("/doctor/appointments?status=pending"),
    },
    {
      title: "Total Patients",
      value: dashboardData.totalPatients,
      icon: Users,
      color: "purple",
      onClick: () => navigate("/doctor/patients"),
    },
    {
      title: "Total Appointments",
      value: dashboardData.totalAppointments,
      icon: Calendar,
      color: "bg-indigo-100",
      onClick: () => navigate("/doctor/appointments"),
    },
    {
      title: "Medical Records",
      value: dashboardData.totalMedicalRecords,
      icon: FileText,
      color: "bg-red-100",
      onClick: () => navigate("/doctor/medical-records"),
    },
  ];

  // Quick Actions with functionality
  const quickActions = [
    {
      name: "patients",
      icon: User,
      color: "bg-green-100 hover:bg-green-200",
      onClick: () => navigate("/doctor/patients"),
      description: "View patient list",
    },
    {
      name: "appointments",
      icon: Calendar,
      color: "bg-purple-100 hover:bg-purple-200",
      onClick: () => navigate("/doctor/appointments"),
      description: "Manage appointments",
    },
    {
      name: "reports",
      icon: FileText,
      color: "bg-yellow-100 hover:bg-yellow-200",
      onClick: () => navigate("/doctor/reports"),
      description: "View medical reports",
    },
    {
      name: "medical records",
      icon: FileText,
      color: "bg-indigo-100 hover:bg-indigo-200",
      onClick: () => navigate("/doctor/medical-records"),
      description: "Access medical records",
    },
    {
      name: "prescriptions",
      icon: FileText,
      color: "bg-pink-100 hover:bg-pink-200",
      onClick: () => navigate("/doctor/prescriptions"),
      description: "Manage prescriptions",
    },
    {
      name: "lab results",
      icon: TestTube,
      color: "bg-orange-100 hover:bg-orange-200",
      onClick: () => navigate("/doctor/lab-results"),
      description: "View lab results",
    },
    {
      name: "consultations",
      icon: Users,
      color: "bg-teal-100 hover:bg-teal-200",
      onClick: () => setShowConsultationModal(true),
      description: "Start consultation",
    },
    {
      name: "follow-ups",
      icon: Calendar,
      color: "bg-cyan-100 hover:bg-cyan-200",
      onClick: () => setShowFollowUpModal(true),
      description: "Schedule follow-ups",
    },
  ];

  // Generate notices from notifications data
  const notices = notifications.slice(0, 5).map((notification) => {
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

  // Generate today's appointments from real data only
  const todayAppointments = dashboardData.todayAppointments.map(
    (appointment) => {
      // Safely parse the appointment date
      let appointmentTime = "N/A";
      try {
        const appointmentDate = new Date(appointment.appointmentDate);
        if (!isNaN(appointmentDate.getTime())) {
          appointmentTime = appointmentDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } catch (error) {
        console.warn("Error parsing appointment date:", error);
      }

      return {
        id: appointment.appointmentId || appointment.id,
        patientName:
          appointment.patientName ||
          `${appointment.patientFirstName || ""} ${
            appointment.patientLastName || ""
          }`.trim() ||
          "Unknown Patient",
        time: appointmentTime,
        status: appointment.status || "pending",
        phone: appointment.patientPhoneNumber || appointment.phone || "N/A",
        email: appointment.patientEmail || appointment.email || "N/A",
        address: appointment.patientAddress || appointment.address || "N/A",
        reason:
          appointment.reasonForVisit ||
          appointment.reason ||
          "No reason specified",
      };
    }
  );

  // Generate calendar events from today's appointments (since we removed recent activity)
  const calendarEvents = todayAppointments.map((appointment) => ({
    date: new Date(),
    event: `Appointment: ${appointment.reason}`,
    description: `Patient: ${appointment.patientName}`,
    participants: appointment.patientName,
  }));

  // Appointment action handlers
  const handleViewDetails = async (appointment) => {
    setSelectedAppointment(appointment);

    try {
      const response = await appointmentAPI.getById(appointment.id);
      setAppointmentDetails(response.data);
      setShowViewDetailsModal(true);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      toast.error("Failed to load appointment details");
      setAppointmentDetails(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleStartSession = (appointment) => {
    setSelectedAppointment(appointment);
    setShowStartSessionModal(true);
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (newDateTime) => {
    if (!selectedAppointment) return;

    try {
      await appointmentAPI.update(selectedAppointment.id, {
        appointmentDate: newDateTime,
      });

      toast.success("Appointment rescheduled successfully");
      setShowRescheduleModal(false);
      setSelectedAppointment(null);

      // Refresh dashboard data
      if (data.doctorDashboard) {
        fetchDoctorDashboard();
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
      toast.error("Failed to reschedule appointment");
    }
  };

  const handleStartVideoCall = async (stream) => {
    if (!selectedAppointment) return;

    console.debug(
      "Starting video session for appointment:",
      selectedAppointment.id
    );

    try {
      // Step 1: Ring the patient
      toast.loading("Ringing patient...");

      // Try to send notification to patient about incoming video call
      try {
        // If we can find the patient ID, send them a notification
        const patientId = selectedAppointment.patientId;
        if (patientId) {
          // This would create a real-time notification for the patient
          console.debug("Sending ring notification to patient:", patientId);
        }
      } catch (notifyError) {
        console.warn("Could not send ring notification:", notifyError);
      }

      // Simulate patient acceptance (since we don't have real-time patient response)
      // In a real implementation, this would wait for patient response
      setTimeout(async () => {
        try {
          toast.dismiss();
          toast.loading("Starting video session...");

          // Step 2: Update appointment status to in-progress
          await appointmentAPI.update(selectedAppointment.id, {
            status: "in-progress",
          });

          toast.dismiss();
          toast.success("Video session started successfully");
          setShowStartSessionModal(false);

          // Step 3: Navigate to dedicated session page
          navigate(`/doctor/session/${selectedAppointment.id}`, {
            state: {
              appointment: selectedAppointment,
              initialStream: stream,
            },
          });
        } catch (error) {
          toast.dismiss();
          console.error("Error initializing video session:", error);
          toast.error("Failed to start video session");
        }
      }, 2000); // Simulate 2 second ring time
    } catch (error) {
      toast.dismiss();
      console.error("Error ringing patient:", error);

      // Check if it's a backend error with specific message
      const errorMessage = error.response?.data?.error || error.message;
      if (
        errorMessage.includes("not answer") ||
        errorMessage.includes("timeout")
      ) {
        toast.error("Patient did not answer");
      } else {
        toast.error("Failed to start video session");
      }
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) return;

    setIsUpdatingStatus(true);
    try {
      await appointmentAPI.update(selectedAppointment.id, {
        status: "confirmed",
      });

      toast.success(
        `Appointment with ${selectedAppointment.patientName} has been confirmed`
      );
      setShowViewDetailsModal(false);
      setSelectedAppointment(null);
      setAppointmentDetails(null);

      // Refresh dashboard data
      if (data.doctorDashboard) {
        fetchDoctorDashboard();
      }
    } catch (error) {
      console.error("Error confirming appointment:", error);
      toast.error("Failed to confirm appointment");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRejectAppointment = async () => {
    if (!selectedAppointment) return;

    setIsUpdatingStatus(true);
    try {
      await appointmentAPI.update(selectedAppointment.id, {
        status: "cancelled",
      });

      toast.success(
        `Appointment with ${selectedAppointment.patientName} has been rejected`
      );
      setShowViewDetailsModal(false);
      setSelectedAppointment(null);
      setAppointmentDetails(null);

      // Refresh dashboard data
      if (data.doctorDashboard) {
        fetchDoctorDashboard();
      }
    } catch (error) {
      console.error("Error rejecting appointment:", error);
      toast.error("Failed to reject appointment");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <DashboardLayout loading={loading} loadingColor="bg-green-600">
      <PageHeader
        title={`Welcome back, Dr. ${user?.firstName} ${user?.lastName}`}
        subtitle="Here's what's happening with your practice today"
      />

      {/* Overview Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
        </div>
        <StatisticsGrid
          stats={doctorStatCards}
          columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Appointments
        </h3>
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
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No appointments scheduled for today
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                You have a clear schedule today. Use this time to catch up on
                other tasks.
              </p>
              <Button
                variant="outline"
                onClick={() => navigate("/doctor/appointments")}
                className="inline-flex items-center"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View All Appointments
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions
        actions={quickActions}
        title="Quick Actions"
        columns="grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      />

      {/* Bottom Section - Calendar and Noticeboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarSection
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          events={calendarEvents}
          onDayClick={(day) => {
            // Handle day click - could open appointment details
            console.log("Day clicked:", day);
          }}
          title="Appointment Calendar"
        />
        <NoticeboardSection
          notices={notices}
          title="System Notifications"
          onViewAll={() => navigate("/doctor/notifications")}
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
            <Button
              variant="outline"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">Schedule</Button>
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
            <Button
              variant="outline"
              onClick={() => setShowConsultationModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">Start Consultation</Button>
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
            <Button
              variant="outline"
              onClick={() => setShowFollowUpModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary">Schedule Follow-up</Button>
          </div>
        </div>
      </Modal>

      {/* View Details Modal */}
      <Modal
        isOpen={showViewDetailsModal}
        onClose={() => {
          setShowViewDetailsModal(false);
          setSelectedAppointment(null);
          setAppointmentDetails(null);
        }}
        title="Appointment Details"
        size="lg"
      >
        <div className="space-y-6">
          {isLoadingDetails ? (
            <>
              <TopLoadingBar loading />
              <div className="py-8 text-center text-gray-500">
                Loading appointment details...
              </div>
            </>
          ) : appointmentDetails ? (
            <div>
              {/* Patient Information */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Patient Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Name:</strong>{" "}
                      {selectedAppointment?.patientName || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Email:</strong>{" "}
                      {selectedAppointment?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Phone:</strong>{" "}
                      {selectedAppointment?.phone || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Address:</strong>{" "}
                      {selectedAppointment?.address || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Appointment Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Date & Time:</strong>{" "}
                      {selectedAppointment?.time || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Status:</strong>{" "}
                      {selectedAppointment?.status || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Reason:</strong>{" "}
                      {appointmentDetails.reasonForVisit || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm">
                      <strong>Mode:</strong>{" "}
                      {appointmentDetails.appointmentMode || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {appointmentDetails.appointmentAmount && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Payment Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-sm">
                      <strong>Amount:</strong> $
                      {appointmentDetails.appointmentAmount || 0}
                    </div>
                    <div className="text-sm">
                      <strong>Paid:</strong> $
                      {appointmentDetails.paidAmount || 0}
                    </div>
                    <div className="text-sm">
                      <strong>Payment Status:</strong>{" "}
                      {appointmentDetails.paymentStatus || "N/A"}
                    </div>
                    <div className="text-sm">
                      <strong>Payment Method:</strong>{" "}
                      {appointmentDetails.paymentMethod || "N/A"}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>Failed to load appointment details.</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            {/* Status-based action buttons */}
            <div className="flex space-x-2">
              {selectedAppointment?.status === "pending" && (
                <>
                  <Button
                    variant="primary"
                    onClick={handleConfirmAppointment}
                    disabled={isUpdatingStatus}
                    className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isUpdatingStatus ? "Confirming..." : "Confirm"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRejectAppointment}
                    disabled={isUpdatingStatus}
                    className="border-red-300 text-red-700 hover:bg-red-50 focus:ring-red-500"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {isUpdatingStatus ? "Rejecting..." : "Reject"}
                  </Button>
                </>
              )}
              {selectedAppointment?.status === "confirmed" && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Appointment Confirmed
                  </span>
                </div>
              )}
              {selectedAppointment?.status === "cancelled" && (
                <div className="flex items-center text-red-600">
                  <XCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Appointment Cancelled
                  </span>
                </div>
              )}
            </div>

            {/* Close button */}
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDetailsModal(false);
                setSelectedAppointment(null);
                setAppointmentDetails(null);
              }}
              disabled={isUpdatingStatus}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
        title="Reschedule Appointment"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Current Appointment
            </h4>
            <p className="text-sm text-gray-600">
              <strong>Patient:</strong>{" "}
              {selectedAppointment?.patientName || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Current Time:</strong>{" "}
              {selectedAppointment?.time || "N/A"}
            </p>
          </div>

          <RescheduleForm
            onSubmit={handleRescheduleSubmit}
            onCancel={() => {
              setShowRescheduleModal(false);
              setSelectedAppointment(null);
            }}
          />
        </div>
      </Modal>

      {/* Start Session Modal */}
      <Modal
        isOpen={showStartSessionModal}
        onClose={() => {
          setShowStartSessionModal(false);
          setSelectedAppointment(null);
        }}
        title="Start Video Session"
        size="md"
      >
        <div className="space-y-6">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Patient Information
            </h4>
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {selectedAppointment?.patientName || "N/A"}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Appointment Time:</strong>{" "}
              {selectedAppointment?.time || "N/A"}
            </p>
          </div>

          <VideoSessionControls
            onStartCall={handleStartVideoCall}
            onCancel={() => {
              setShowStartSessionModal(false);
              setSelectedAppointment(null);
            }}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
