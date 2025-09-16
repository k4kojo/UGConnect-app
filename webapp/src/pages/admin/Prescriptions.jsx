import {
  Clock,
  Pill,
  Plus,
  Printer
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import {
  ActionButtons,
  DataTable,
  Modal,
  PageHeader,
  SearchAndFilter,
  StatusBadge,
  UserAvatar
} from '../../components/shared';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext.jsx';

const Prescriptions = () => {
  const { user } = useAuth();
  const { data, loading, error, fetchPrescriptions } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached prescriptions data
  const prescriptions = data.prescriptions || [];

  // Load prescriptions if not already cached
  useEffect(() => {
    if (!data.prescriptions) {
      fetchPrescriptions();
    }
  }, [data.prescriptions, fetchPrescriptions]);

  // Filter prescriptions based on search and status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = !searchTerm || 
      prescription.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.medication?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewPrescription = (prescription) => {
    setSelectedPrescription(prescription);
    setShowModal(true);
  };

  const handlePrintPrescription = async (prescription) => {
    try {
      // Call API to generate printable version
      console.log('Printing prescription:', prescription);
      // In a real app, you would open a print dialog or download PDF
    } catch (err) {
      console.error('Error printing prescription:', err);
    }
  };

  const handleDownloadPrescription = async (prescription) => {
    try {
      // Call API to download prescription
      console.log('Downloading prescription:', prescription);
      // In a real app, you would trigger a download
    } catch (err) {
      console.error('Error downloading prescription:', err);
    }
  };

  const handleNewPrescription = () => {
    console.log('Creating new prescription');
    // Navigate to prescription creation form
  };

  const handleSendToPharmacy = async (prescription) => {
    try {
      console.log('Sending prescription to pharmacy:', prescription);
      // Refresh prescriptions list
      fetchPrescriptions(true); // Force refresh
    } catch (err) {
      console.error('Error sending prescription to pharmacy:', err);
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (prescription) => (
        <div className="flex items-center">
          <UserAvatar 
            user={{ 
              first_name: prescription.patient?.firstName || prescription.patientName?.split(' ')[0], 
              last_name: prescription.patient?.lastName || prescription.patientName?.split(' ')[1] || '' 
            }} 
            size="sm" 
          />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {prescription.patient?.fullName || prescription.patientName}
            </div>
            <div className="text-sm text-gray-500">
              ID: {prescription.patient?.id || prescription.patientId}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'doctorName',
      header: 'Doctor',
      render: (prescription) => (
        <div className="text-sm text-gray-900">
          {prescription.doctor?.fullName || prescription.doctorName}
        </div>
      )
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (prescription) => (
        <div className="text-sm text-gray-900">{prescription.diagnosis}</div>
      )
    },
    {
      key: 'medications',
      header: 'Medications',
      render: (prescription) => (
        <div>
          <div className="text-sm text-gray-900">
            {prescription.medications?.length || 0} medication(s)
          </div>
          <div className="text-sm text-gray-500">
            {prescription.medications?.[0]?.name}
            {prescription.medications?.length > 1 && ` +${prescription.medications.length - 1} more`}
          </div>
        </div>
      )
    },
    {
      key: 'prescribedDate',
      header: 'Date',
      render: (prescription) => (
        <div className="text-sm text-gray-900">
          {formatDate(prescription.prescribedDate || prescription.createdAt)}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (prescription) => <StatusBadge status={prescription.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (prescription) => (
        <ActionButtons
          actions={[
            {
              type: 'view',
              onClick: () => handleViewPrescription(prescription),
              tooltip: 'View Details'
            },
            {
              type: 'print',
              onClick: () => handlePrintPrescription(prescription),
              tooltip: 'Print Prescription'
            },
            {
              type: 'download',
              onClick: () => handleDownloadPrescription(prescription),
              tooltip: 'Download Prescription'
            },
            {
              type: 'send',
              onClick: () => handleSendToPharmacy(prescription),
              tooltip: 'Send to Pharmacy'
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
    searchPlaceholder: "Search prescriptions...",
    filters: [
      {
        key: 'status',
        value: filterStatus,
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'pending', label: 'Pending' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    ],
    onFilterChange: (key, value) => {
      if (key === 'status') setFilterStatus(value);
    },
    primaryAction: {
      label: 'New Prescription',
      icon: Plus,
      onClick: handleNewPrescription
    }
  };

  // Modal actions configuration
  const modalActions = [
    {
      label: 'Close',
      variant: 'outline',
      onClick: () => setShowModal(false)
    },
    {
      label: 'Print',
      variant: 'primary',
      icon: Printer,
      onClick: () => selectedPrescription && handlePrintPrescription(selectedPrescription)
    }
  ];

  // Show error state
  if (error && !loading) {
    return (
      <div className="h-full flex bg-gray-50">
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Prescriptions</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="mb-4 p-4 bg-gray-100 rounded text-left text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>User Role: {user?.role || 'Not set'}</p>
                <p>User ID: {user?.userId || 'Not set'}</p>
                <p>User Email: {user?.email || 'Not set'}</p>
                <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              </div>
              <button
                onClick={fetchPrescriptions}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Prescriptions Management"
            subtitle="Manage and track patient prescriptions"
          />

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>User Role: {user?.role || 'Not set'}</p>
            <p>User ID: {user?.userId || 'Not set'}</p>
            <p>User Email: {user?.email || 'Not set'}</p>
            <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <button
              onClick={fetchPrescriptions}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Test API Call
            </button>
          </div>

          <SearchAndFilter {...searchAndFilterConfig} />

          <DataTable
            columns={columns}
            data={filteredPrescriptions}
            onRowClick={handleViewPrescription}
            selectedRow={selectedPrescription}
            loading={loading}
            emptyMessage="No prescriptions found. Try adjusting your search or filters."
          />

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Prescription Details"
            size="lg"
            actions={modalActions}
          >
            {selectedPrescription && (
              <div className="space-y-6">
                {/* Patient and Doctor Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                    <p className="text-sm text-gray-900">
                      {selectedPrescription.patient?.fullName || selectedPrescription.patientName}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {selectedPrescription.patient?.id || selectedPrescription.patientId}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prescribing Doctor</h3>
                    <p className="text-sm text-gray-900">
                      {selectedPrescription.doctor?.fullName || selectedPrescription.doctorName}
                    </p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                  <p className="text-sm text-gray-900">{selectedPrescription.diagnosis}</p>
                </div>

                {/* Medications */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Medications</h3>
                  <div className="space-y-2">
                    {selectedPrescription.medications?.map((medication, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Pill className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">{medication.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{medication.dosage}</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          <span className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{medication.frequency} for {medication.duration}</span>
                          </span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">No medications listed</p>
                    )}
                  </div>
                </div>

                {/* Prescription Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prescribed Date</h3>
                    <p className="text-sm text-gray-900">
                      {formatDate(selectedPrescription.prescribedDate || selectedPrescription.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <StatusBadge status={selectedPrescription.status} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Refills Remaining</h3>
                    <p className="text-sm text-gray-900">{selectedPrescription.refills || 0}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="text-sm text-gray-900">{selectedPrescription.notes}</p>
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

export default Prescriptions;
