import {
  AlertCircle,
  Edit,
  Play,
  Plus,
  UserCheck,
  Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ActionButtons,
  Modal,
  PageHeader,
  StatusBadge,
  UserAvatar
} from '../../components/shared';
import { TopLoadingBar, Table } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Consultations = () => {
  const { user } = useAuth();
  const { data, loading, error, fetchAdminAppointments } = useData();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached appointments data for consultations
  const consultations = data.adminAppointments || [];

  // Load appointments if not already cached
  useEffect(() => {
    if (!data.adminAppointments) {
      fetchAdminAppointments();
    }
  }, [data.adminAppointments, fetchAdminAppointments]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter consultations based on status
  const filteredConsultations = consultations.filter(consultation => {
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    return matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      const dateStr = date.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
      const timeStr = date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
      return `${dateStr}, ${timeStr}`;
    } catch (error) {
      return 'N/A';
    }
  };

  const formatDuration = (consultation) => {
    if (!consultation) return '-';
    
    // If consultation object has startTime and endTime, calculate duration
    if (consultation.startTime && consultation.endTime) {
      try {
        const start = new Date(consultation.startTime);
        const end = new Date(consultation.endTime);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const durationMs = end.getTime() - start.getTime();
          const durationMins = Math.round(durationMs / (1000 * 60));
          return `${durationMins} mins`;
        }
      } catch (error) {
        console.warn('Error calculating duration from start/end time:', error);
      }
    }
    
    // If startTime/endTime not available, try scheduledDate and completedAt
    if (consultation.scheduledDate && consultation.completedAt) {
      try {
        const start = new Date(consultation.scheduledDate);
        const end = new Date(consultation.completedAt);
        
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const durationMs = end.getTime() - start.getTime();
          const durationMins = Math.round(durationMs / (1000 * 60));
          return `${durationMins} mins`;
        }
      } catch (error) {
        console.warn('Error calculating duration from scheduled/completed time:', error);
      }
    }
    
    // If duration is already provided as a field, use that
    const duration = consultation.duration || 
                    consultation.consultationDuration || 
                    consultation.appointmentDuration;
    
    if (duration) {
      // If duration is already a number, format it
      if (typeof duration === 'number') {
        return `${duration} mins`;
      }
      // If duration is a string, try to parse it
      if (typeof duration === 'string') {
        const parsed = parseInt(duration);
        if (!isNaN(parsed)) {
          return `${parsed} mins`;
        }
        // If it's already formatted, return as is
        if (duration.includes('min') || duration.includes('mins')) {
          return duration;
        }
      }
    }
    
    // If no duration can be determined, show a dash
    return '-';
  };

  const handleViewConsultation = (consultation) => {
    setSelectedConsultation(consultation);
    setShowModal(true);
  };

  const handleEditConsultation = async (consultation) => {
    try {
      // Navigate to consultation edit form
      console.log('Editing consultation:', consultation.id);
    } catch (err) {
      console.error('Error editing consultation:', err);
    }
  };

  const handleStartConsultation = async (consultation) => {
    try {
      console.log('Starting consultation:', consultation);
      // Refresh appointments list
      fetchAdminAppointments(true);
    } catch (err) {
      console.error('Error starting consultation:', err);
    }
  };

  const handleNewConsultation = () => {
    console.log('Creating new consultation');
    // Navigate to consultation creation form
  };

  const getConsultationTypeIcon = (type) => {
    switch (type) {
      case 'Telemedicine': return <Video className="h-4 w-4" />;
      case 'Emergency Consultation': return <AlertCircle className="h-4 w-4" />;
      default: return <UserCheck className="h-4 w-4" />;
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (consultation) => (
        <div className="flex items-center">
          <UserAvatar user={{ first_name: consultation.patientFirstName || 'P', last_name: consultation.patientLastName || 'atient' }} size="sm" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{`${consultation.patientFirstName || ''} ${consultation.patientLastName || ''}`.trim()}</div>
          </div>
        </div>
      )
    },
    {
      key: 'doctorName',
      header: 'Doctor',
      render: (consultation) => <div className="text-sm text-gray-900">{`${consultation.doctorFirstName || ''} ${consultation.doctorLastName || ''}`.trim()}</div>
    },
    {
      key: 'consultationType',
      header: 'Type',
      render: (consultation) => (
        <div className="flex items-center space-x-2">
          {getConsultationTypeIcon(consultation.consultationType)}
          <span className="text-sm text-gray-900">{consultation.consultationType}</span>
        </div>
      )
    },
    {
      key: 'scheduledDate',
      header: 'Date & Time',
      render: (consultation) => {
        // Try to get the consultation date from various possible fields
        const consultationDate = consultation.scheduledDate || 
                               consultation.appointmentDate || 
                               consultation.consultationDate || 
                               consultation.createdAt;
        
        return (
          <div className="text-sm text-gray-900">
            {formatDateTime(consultationDate)}
          </div>
        );
      }
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (consultation) => {
        return <div className="text-sm text-gray-900">{formatDuration(consultation)}</div>;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (consultation) => <StatusBadge status={consultation.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (consultation) => (
        <ActionButtons
          actions={[
            {
              type: 'view',
              onClick: () => handleViewConsultation(consultation),
              tooltip: 'View Details'
            },
            ...(consultation.status === 'scheduled' ? [
              {
                type: 'start',
                onClick: () => handleStartConsultation(consultation),
                tooltip: 'Start Consultation'
              }
            ] : []),
            {
              type: 'edit',
              onClick: () => handleEditConsultation(consultation),
              tooltip: 'Edit Consultation'
            }
          ]}
        />
      )
    }
  ];

  // Status filter options for future use if needed
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'completed', label: 'Completed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Modal actions configuration
  const modalActions = [
    {
      label: 'Close',
      variant: 'outline',
      onClick: () => setShowModal(false)
    },
    ...(selectedConsultation?.status === 'scheduled' ? [
      {
        label: 'Start Consultation',
        variant: 'primary',
        icon: Play,
        onClick: () => selectedConsultation && handleStartConsultation(selectedConsultation)
      }
    ] : []),
    {
      label: 'Edit',
      variant: 'outline',
      icon: Edit,
      onClick: () => selectedConsultation && handleEditConsultation(selectedConsultation)
    }
  ];

  if (loading) {
    return (
      <>
        <TopLoadingBar loading />
        <div className="min-h-screen" />
      </>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Consultations"
            subtitle="Manage patient consultations and medical appointments"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <Table
            columns={columns}
            data={filteredConsultations}
            onRowClick={handleViewConsultation}
            selectedRow={selectedConsultation}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search patients, doctors, or reasons..."
            emptyMessage="No consultations found. Try adjusting your search or filters."
            pageSize={10}
            showRowNumbers={true}
          />

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Consultation Details"
            size="lg"
            actions={modalActions}
          >
            {selectedConsultation && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                    <p className="text-sm text-gray-900">{`${selectedConsultation.patientFirstName || ''} ${selectedConsultation.patientLastName || ''}`.trim()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                    <p className="text-sm text-gray-900">{`${selectedConsultation.doctorFirstName || ''} ${selectedConsultation.doctorLastName || ''}`.trim()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Consultation Type</h3>
                    <div className="flex items-center space-x-2">
                      {getConsultationTypeIcon(selectedConsultation.consultationType)}
                      <span className="text-sm text-gray-900">{selectedConsultation.consultationType}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <StatusBadge status={selectedConsultation.status} />
                  </div>
                </div>

                {/* Schedule Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Scheduled Date</h3>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedConsultation.scheduledDate || selectedConsultation.appointmentDate || selectedConsultation.consultationDate || selectedConsultation.createdAt)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="text-sm text-gray-900">{formatDuration(selectedConsultation)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Follow-up Date</h3>
                    <p className="text-sm text-gray-900">{formatDateTime(selectedConsultation.followUpDate)}</p>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Symptoms</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedConsultation.symptoms}</p>
                  </div>
                  
                  {selectedConsultation.diagnosis && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                      <p className="text-sm text-gray-900 bg-blue-50 p-3 rounded-lg">{selectedConsultation.diagnosis}</p>
                    </div>
                  )}
                  
                  {selectedConsultation.treatment && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Treatment</h3>
                      <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg">{selectedConsultation.treatment}</p>
                    </div>
                  )}
                </div>

                {/* Vital Signs */}
                {selectedConsultation.vitalSigns && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Vital Signs</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Blood Pressure</p>
                        <p className="text-sm font-medium text-gray-900">{selectedConsultation.vitalSigns.bloodPressure}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Heart Rate</p>
                        <p className="text-sm font-medium text-gray-900">{selectedConsultation.vitalSigns.heartRate} bpm</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Temperature</p>
                        <p className="text-sm font-medium text-gray-900">{selectedConsultation.vitalSigns.temperature}°F</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Weight</p>
                        <p className="text-sm font-medium text-gray-900">{selectedConsultation.vitalSigns.weight}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedConsultation.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="text-sm text-gray-900 bg-yellow-50 p-3 rounded-lg">{selectedConsultation.notes}</p>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Consultations;
