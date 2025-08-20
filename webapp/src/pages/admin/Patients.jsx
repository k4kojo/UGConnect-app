import {
    Calendar,
    Edit,
    Eye,
    Phone,
    Plus,
    Search,
    Trash2,
    User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, ProfileAvatar } from '../../components/ui';
import { useData } from '../../contexts/DataContext.jsx';

const Patients = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchPatients, deletePatient } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached patients data
  const patients = data.patients || [];

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

  // Filter patients based on search and status
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = !searchTerm ||
      patient.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || patient.isActive === (statusFilter === 'active');

    return matchesSearch && matchesStatus;
  });

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setShowModal(true);
  };

  const handleEditPatient = (patient) => {
    navigate(`/admin/patients/${patient.userId}/edit`);
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.firstName} ${patient.lastName}?`)) {
      try {
        const success = await deletePatient(patient.userId);
        if (success) {
          toast.success('Patient deleted successfully');
        } else {
          toast.error('Failed to delete patient');
        }
      } catch (err) {
        console.error('Error deleting patient:', err);
        toast.error('Failed to delete patient');
      }
    }
  };

  const handleAddPatient = () => {
    navigate('/admin/patients/add');
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

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">Manage all patients in the system</p>
        </div>
        <Button onClick={handleAddPatient} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
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

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => (
          <div
            key={patient.userId}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewPatient(patient)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <ProfileAvatar
                name={`${patient.firstName} ${patient.lastName}`}
                src={patient.profilePicture}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-gray-600 text-sm">{patient.email}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(patient.isActive)}`}>
                  {getStatusText(patient.isActive)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{patient.phoneNumber || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>DOB: {formatDate(patient.dateOfBirth)}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>ID: {patient.userId}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewPatient(patient);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditPatient(patient);
                }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePatient(patient);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first patient.'
            }
          </p>
        </div>
      )}

      {/* Patient Details Modal */}
      {showModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Patient Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ProfileAvatar 
                  name={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                  src={selectedPatient.profilePicture}
                  size="lg"
                />
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedPatient.email}</p>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(selectedPatient.isActive)}`}>
                    {getStatusText(selectedPatient.isActive)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{selectedPatient.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Date of Birth:</span>
                  <p className="text-gray-900">{formatDate(selectedPatient.dateOfBirth)}</p>
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
                    {formatDate(selectedPatient.updatedAt)}
                  </p>
                </div>
              </div>
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
