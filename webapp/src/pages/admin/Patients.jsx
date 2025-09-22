import {
  Calendar,
  Edit,
  Eye,
  Phone,
  Search,
  Trash2,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { TopLoadingBar, ProfileAvatar, Table } from '../../components/ui';
import { useData } from '../../contexts/DataContext.jsx';
import { patientAPI, userAPI } from '../../services/api.js';

const Patients = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchPatients, deletePatient } = useData();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Use cached patients data - ensure we only get patients
  const allUsers = data.patients || [];
  const patients = allUsers.filter(user => user.role === 'patient');

  // Load patients if not already cached
  useEffect(() => {
    if (!data.patients) {
      fetchPatients();
    }
  }, [data.patients, fetchPatients]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter patients based on status
  const filteredPatients = patients.filter(patient => {
    const matchesStatus = statusFilter === 'all' || patient.isActive === (statusFilter === 'active');
    return matchesStatus;
  });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleEditPatient = (patient) => {
    navigate(`/admin/patients/${patient.userId}/edit`);
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        const response = await userAPI.deleteUser(patient.userId);
        
        if (response.status === 200 || response.status === 204) {
          toast.success('Patient deleted successfully');
          fetchPatients(true); // Force refresh
        } else {
          throw new Error('Failed to delete patient');
        }
      } catch (err) {
        console.error('Error deleting patient:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete patient';
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleTogglePatientStatus = async (patient) => {
    const newStatus = patient.isActive ? false : true;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} ${patient.firstName} ${patient.lastName}?`)) {
      setActionLoading(true);
      try {
        const response = await userAPI.toggleUserStatus(patient.userId, { isActive: newStatus });
        
        if (response.status === 200) {
          toast.success(`Patient ${action}d successfully`);
          fetchPatients(true); // Force refresh
        } else {
          throw new Error(`Failed to ${action} patient`);
        }
      } catch (err) {
        console.error(`Error ${action}ing patient:`, err);
        const errorMessage = err.response?.data?.error || err.message || `Failed to ${action} patient`;
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };



  const handleViewPatientProfile = async (patient) => {
    try {
      // Fetch detailed patient profile from backend
      const response = await patientAPI.getProfile(patient.userId);
      
      if (response.status === 200) {
        const profileData = response.data;
        setSelectedPatient({
          ...patient,
          ...profileData,
          // Merge any additional profile data
          address: profileData.address,
          emergencyContact: profileData.emergencyContact,
          medicalHistory: profileData.medicalHistory,
          allergies: profileData.allergies
        });
        setShowModal(true);
      } else {
        // If no profile exists, show basic info
        setSelectedPatient(patient);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error fetching patient profile:', err);
      // Show basic info if profile fetch fails
      setSelectedPatient(patient);
      setShowModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  // Table columns configuration
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (patient) => (
        <div className="flex items-center">
          <ProfileAvatar
            name={`${patient.firstName} ${patient.lastName}`}
            src={patient.profilePicture}
            size="sm"
          />
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {patient.firstName} {patient.lastName}
            </div>
            <div className="text-sm text-gray-500">{patient.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (patient) => (
        <div className="flex items-center text-sm text-gray-900">
          <Phone className="w-4 h-4 mr-2 text-gray-400" />
          {patient.phoneNumber || 'No phone'}
        </div>
      )
    },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      render: (patient) => (
        <div className="text-sm text-gray-900">
          {formatDate(patient.dateOfBirth)}
        </div>
      )
    },
    {
      key: 'userId',
      header: 'Patient ID',
      render: (patient) => (
        <div className="text-sm text-gray-900 font-mono">
          {patient.userId}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (patient) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          getStatusColor(patient.isActive)
        }`}>
          {getStatusText(patient.isActive)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (patient) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewPatientProfile(patient);
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            disabled={actionLoading}
            title="View Profile"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPatient(patient);
            }}
            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
            disabled={actionLoading}
            title="Edit Patient"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTogglePatientStatus(patient);
            }}
            className={`p-2 rounded-md transition-colors ${
              patient.isActive 
                ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            disabled={actionLoading}
            title={patient.isActive ? 'Deactivate' : 'Activate'}
          >
            {patient.isActive ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePatient(patient);
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            disabled={actionLoading}
            title="Delete Patient"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (loading && patients.length === 0) {
    return (
      <>
        <TopLoadingBar loading />
        <div className="min-h-screen" />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-600 mt-2">Manage all patients in the system</p>
      </div>

      {/* Status Filter */}
      <div className="mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Patients Table */}
      <Table
        columns={columns}
        data={filteredPatients}
        onRowClick={handleViewPatientProfile}
        selectedRow={selectedPatient}
        loading={loading}
        searchable={true}
        searchPlaceholder="Search patients by name, email, or phone..."
        emptyMessage="No patients found. Try adjusting your search or filters."
        pageSize={10}
        showRowNumbers={true}
        striped={true}
      />


      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Patient Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <ProfileAvatar 
                  name={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                  src={selectedPatient.profilePicture}
                  size="lg"
                />
                <div>
                  <h4 className="font-semibold text-xl">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedPatient.email}</p>
                  <p className="text-gray-600">{selectedPatient.phoneNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Date of Birth:</span>
                    <p className="text-gray-900">{formatDate(selectedPatient.dateOfBirth)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Gender:</span>
                    <p className="text-gray-900">{selectedPatient.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Blood Type:</span>
                    <p className="text-gray-900">{selectedPatient.bloodType || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Emergency Contact:</span>
                    <p className="text-gray-900">{selectedPatient.emergencyContact || 'Not provided'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedPatient.isActive)}`}>
                        {getStatusText(selectedPatient.isActive)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Patient ID:</span>
                    <p className="text-gray-900">{selectedPatient.userId}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Joined:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedPatient.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedPatient.updatedAt || selectedPatient.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedPatient.address && (
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900 mt-1">{selectedPatient.address}</p>
                </div>
              )}
              
              {selectedPatient.allergies && (
                <div>
                  <span className="font-medium text-gray-700">Allergies:</span>
                  <p className="text-gray-900 mt-1">{selectedPatient.allergies}</p>
                </div>
              )}
              
              {selectedPatient.medicalHistory && (
                <div>
                  <span className="font-medium text-gray-700">Medical History:</span>
                  <p className="text-gray-900 mt-1">{selectedPatient.medicalHistory}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleTogglePatientStatus(selectedPatient);
                }}
                className={`px-4 py-2 rounded-md ${
                  selectedPatient.isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedPatient.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditPatient(selectedPatient);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
