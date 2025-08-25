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
  DataTable,
  Modal,
  PageHeader,
  SearchAndFilter,
  StatusBadge,
  UserAvatar
} from '../../components/shared';
import { LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Consultations = () => {
  const { user } = useAuth();
  const { data, loading, error, fetchAdminAppointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter consultations based on search and status
  const filteredConsultations = consultations.filter(consultation => {
    const patientName = `${consultation.patientFirstName || ''} ${consultation.patientLastName || ''}`.trim();
    const doctorName = `${consultation.doctorFirstName || ''} ${consultation.doctorLastName || ''}`.trim();
    
    const matchesSearch = !searchTerm || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultation.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || consultation.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
            <div className="text-sm text-gray-500">ID: {consultation.patientId}</div>
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
      render: (consultation) => (
        <div>
          <div className="text-sm text-gray-900">{formatDate(consultation.scheduledDate)}</div>
          <div className="text-sm text-gray-500">{formatTime(consultation.scheduledDate)}</div>
        </div>
      )
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (consultation) => <div className="text-sm text-gray-900">{consultation.duration} min</div>
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

  // Search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search consultations...",
    filters: [
      {
        key: 'status',
        value: filterStatus,
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'completed', label: 'Completed' },
          { value: 'in-progress', label: 'In Progress' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    ],
    onFilterChange: (key, value) => {
      if (key === 'status') setFilterStatus(value);
    },
    primaryAction: {
      label: 'New Consultation',
      icon: Plus,
      onClick: handleNewConsultation
    }
  };

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
    return <LoadingSpinner size="2xl" text="Loading consultations..." />;
  }

  return (
    <div className="h-full flex bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Consultations"
            subtitle="Manage patient consultations and medical appointments"
          />

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>User Role: {user?.role || 'Not set'}</p>
            <p>User ID: {user?.userId || 'Not set'}</p>
            <p>User Email: {user?.email || 'Not set'}</p>
            <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <button
                              onClick={() => fetchAdminAppointments(true)}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Test API Call
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>User Role: {user?.role || 'Not set'}</p>
                <p>User ID: {user?.userId || 'Not set'}</p>
                <p>User Email: {user?.email || 'Not set'}</p>
                <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              </div>
            </div>
          )}

          <SearchAndFilter {...searchAndFilterConfig} />

          <DataTable
            columns={columns}
            data={filteredConsultations}
            onRowClick={handleViewConsultation}
            selectedRow={selectedConsultation}
            loading={loading}
            emptyMessage="No consultations found. Try adjusting your search or filters."
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
                    <p className="text-xs text-gray-500">ID: {selectedConsultation.patientId}</p>
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
                    <p className="text-sm text-gray-900">{formatDate(selectedConsultation.scheduledDate)}</p>
                    <p className="text-xs text-gray-500">{formatTime(selectedConsultation.scheduledDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="text-sm text-gray-900">{selectedConsultation.duration} minutes</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Follow-up Date</h3>
                    <p className="text-sm text-gray-900">{formatDate(selectedConsultation.followUpDate)}</p>
                    <p className="text-xs text-gray-500">{formatTime(selectedConsultation.followUpDate)}</p>
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
