import {
  Edit,
  Pill,
  Plus,
  Printer,
  Send
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
import { LoadingSpinner } from '../../components/ui';
import { useData } from '../../contexts/DataContext';

const DoctorPrescriptions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { data, loading, error, fetchPrescriptions } = useData();

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

  const handleEditPrescription = async (prescription) => {
    try {
      // Navigate to prescription edit form
      console.log('Editing prescription:', prescription.id);
    } catch (err) {
      console.error('Error editing prescription:', err);
    }
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

  const handlePrintPrescription = async (prescription) => {
    try {
      // Call API to generate printable version
      console.log('Printing prescription:', prescription);
      // In a real app, you would open a print dialog or download PDF
    } catch (err) {
      console.error('Error printing prescription:', err);
    }
  };

  const handleNewPrescription = () => {
    console.log('Creating new prescription');
    // Navigate to prescription creation form
  };

  // Table columns configuration
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (prescription) => (
        <div className="flex items-center">
          <UserAvatar user={{ first_name: prescription.patientName?.split(' ')[0], last_name: prescription.patientName?.split(' ')[1] || '' }} size="sm" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{prescription.patientName}</div>
            <div className="text-sm text-gray-500">ID: {prescription.patientId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (prescription) => <div className="text-sm text-gray-900">{prescription.diagnosis}</div>
    },
    {
      key: 'medications',
      header: 'Medications',
      render: (prescription) => (
        <div>
          <div className="text-sm text-gray-900">{prescription.medications?.length || 0} medication(s)</div>
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
      render: (prescription) => <div className="text-sm text-gray-900">{formatDate(prescription.prescribedDate)}</div>
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
              type: 'edit',
              onClick: () => handleEditPrescription(prescription),
              tooltip: 'Edit Prescription'
            },
            {
              type: 'send',
              onClick: () => handleSendToPharmacy(prescription),
              tooltip: 'Send to Pharmacy'
            },
            {
              type: 'print',
              onClick: () => handlePrintPrescription(prescription),
              tooltip: 'Print Prescription'
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
      label: 'Edit',
      variant: 'outline',
      icon: Edit,
      onClick: () => selectedPrescription && handleEditPrescription(selectedPrescription)
    },
    {
      label: 'Send to Pharmacy',
      variant: 'outline',
      icon: Send,
      onClick: () => selectedPrescription && handleSendToPharmacy(selectedPrescription)
    },
    {
      label: 'Print',
      variant: 'primary',
      icon: Printer,
      onClick: () => selectedPrescription && handlePrintPrescription(selectedPrescription)
    }
  ];

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading prescriptions..." />;
  }

  return (
    <div className="h-full flex bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="My Prescriptions"
            subtitle="Manage prescriptions for your patients"
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

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
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                    <p className="text-sm text-gray-900">{selectedPrescription.patientName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedPrescription.patientId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Contact</h3>
                    <p className="text-sm text-gray-900">{selectedPrescription.patientEmail}</p>
                    <p className="text-xs text-gray-500">{selectedPrescription.patientPhone}</p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Diagnosis</h3>
                  <p className="text-sm text-gray-900">{selectedPrescription.diagnosis}</p>
                </div>

                {/* Medications */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Medications</h3>
                  <div className="space-y-3">
                    {selectedPrescription.medications?.map((medication, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Pill className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-gray-900">{medication.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{medication.dosage}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {medication.duration}
                          </div>
                          <div className="md:col-span-2">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prescribed Date</h3>
                    <p className="text-sm text-gray-900">{formatDate(selectedPrescription.prescribedDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <StatusBadge status={selectedPrescription.status} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Refills Remaining</h3>
                    <p className="text-sm text-gray-900">{selectedPrescription.refills}</p>
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pharmacy</h3>
                    <p className="text-sm text-gray-900">{selectedPrescription.pharmacy}</p>
                    <p className="text-xs text-gray-500">{selectedPrescription.pharmacyPhone}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedPrescription.notes}</p>
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

export default DoctorPrescriptions;
