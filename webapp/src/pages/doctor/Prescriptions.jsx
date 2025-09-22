import {
  Edit,
  Pill,
  Plus,
  Printer,
  RefreshCw,
  Send
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
import { Button, PatientAvatar, PrescriptionFormModal, TopLoadingBar, Table } from '../../components/ui';
import { useData } from '../../contexts/DataContext';

const DoctorPrescriptions = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, loading, error, fetchPrescriptions, createDirectPrescription, createAppointmentPrescription, fetchDoctorPatients, fetchDoctorAppointments } = useData();

  // Use cached prescriptions, patients, and appointments data
  const prescriptions = data.prescriptions || [];
  const patients = data.doctorPatients || [];
  const appointments = data.doctorAppointments || [];

  // Debug logging to check prescription data
  console.log('Doctor Prescriptions Debug:', {
    prescriptionsCount: prescriptions.length,
    prescriptions: prescriptions,
    loading,
    error
  });

  // Load prescriptions, patients, and appointments on component mount only
  useEffect(() => {
    if (!data.prescriptions) {
      fetchPrescriptions();
    }
    if (!data.doctorPatients) {
      fetchDoctorPatients();
    }
    if (!data.doctorAppointments) {
      fetchDoctorAppointments();
    }
  }, []); // Empty dependency array - only runs once on mount

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter prescriptions based on status
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;
    return matchesStatus;
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
    setShowFormModal(true);
  };

  const handleSavePrescription = async (formData) => {
    setActionLoading(true);
    try {
      console.log('Creating new prescription:', formData);
      
      let result;
      
      // Determine which API to use based on appointment or direct prescription
      if (formData.appointmentId) {
        result = await createAppointmentPrescription(formData);
      } else {
        result = await createDirectPrescription(formData);
      }
      
      if (result) {
        toast.success('Prescription created and sent to patient successfully!');
        setShowFormModal(false);
        // Prescriptions will be automatically refreshed by the create function
      } else {
        toast.error('Failed to create prescription');
      }
    } catch (err) {
      console.error('Error creating prescription:', err);
      toast.error('Failed to create prescription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
  };

  const handleRefresh = async () => {
    await fetchPrescriptions(true);
    toast.success('Prescriptions refreshed');
  };

  // Table columns configuration
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (prescription) => (
        <div className="flex items-center">
          <PatientAvatar 
            patient={prescription.patient} 
            size="sm" 
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {prescription.patient?.name || prescription.patientName || 'Unknown Patient'}
            </div>
            <div className="text-sm text-gray-500">
              {prescription.patient?.email || 'No email available'}
            </div>
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
          <div className="text-sm text-gray-900 font-medium">
            {prescription.medications?.[0]?.name || prescription.medication || 'No medication specified'}
          </div>
          <div className="text-sm text-gray-500">
            {prescription.medications?.[0]?.dosage || prescription.dosage || 'No dosage specified'}
            {prescription.medications?.[0]?.frequency || prescription.frequency ? 
              ` • ${prescription.medications?.[0]?.frequency || prescription.frequency}` : ''}
          </div>
          {prescription.medications?.length > 1 && (
            <div className="text-xs text-blue-600">
              +{prescription.medications.length - 1} more medications
            </div>
          )}
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

  // Status filter options for future use if needed
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

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
            title="My Prescriptions"
            subtitle="Manage prescriptions for your patients"
          >
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleNewPrescription}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
              <span>New Prescription</span>
            </button>
          </PageHeader>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <Table
            columns={columns}
            data={filteredPrescriptions}
            onRowClick={handleViewPrescription}
            selectedRow={selectedPrescription}
            loading={loading}
            searchable={true}
            searchPlaceholder="Search patients, medications, or diagnoses..."
            emptyMessage="No prescriptions found. Try adjusting your search or filters."
            pageSize={10}
            showRowNumbers={true}
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
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Patient Information</h3>
                  <div className="flex items-center space-x-4">
                    <PatientAvatar 
                      patient={selectedPrescription.patient} 
                      size="lg" 
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-base font-medium text-gray-900">
                            {selectedPrescription.patient?.name || selectedPrescription.patientName || 'Unknown Patient'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Patient ID: {selectedPrescription.patient?.id || selectedPrescription.patientId || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">
                            {selectedPrescription.patient?.email || selectedPrescription.patientEmail || 'No email available'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedPrescription.patientPhone || 'No phone available'}
                          </p>
                        </div>
                      </div>
                    </div>
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

          {/* Prescription Form Modal */}
          <PrescriptionFormModal
            isOpen={showFormModal}
            onClose={handleCloseFormModal}
            onSave={handleSavePrescription}
            loading={actionLoading}
            patients={patients}
            appointments={appointments}
          />
        </div>
      </div>
    </div>
  );
};

export default DoctorPrescriptions;
