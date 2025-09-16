import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  ActionButtons,
  DataTable,
  PageHeader,
  SearchAndFilter,
  StatusBadge,
  UserAvatar
} from '../../components/shared';
import { useData } from '../../contexts/DataContext.jsx';
import { doctorAPI, userAPI } from '../../services/api.js';

const Doctors = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchDoctors } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Use cached doctors data
  const doctors = data.doctors || [];

  // Load doctors if not already cached
  useEffect(() => {
    if (!data.doctors) {
      fetchDoctors();
    }
  }, [data.doctors, fetchDoctors]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter doctors based on search and status
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm ||
      doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || doctor.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleEditDoctor = (doctor) => {
    navigate(`/admin/doctors/${doctor.userId}/edit`);
  };

  const handleDeleteDoctor = async (doctor) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        // Call API to delete doctor
        const response = await userAPI.deleteUser(doctor.userId);
        
        if (response.status === 200 || response.status === 204) {
          toast.success('Doctor deleted successfully');
          fetchDoctors(true); // Force refresh
        } else {
          throw new Error('Failed to delete doctor');
        }
      } catch (err) {
        console.error('Error deleting doctor:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete doctor';
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleDoctorStatus = async (doctor) => {
    const newStatus = doctor.isActive ? false : true;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
      setActionLoading(true);
      try {
        const response = await userAPI.toggleUserStatus(doctor.userId, { isActive: newStatus });
        
        if (response.status === 200) {
          toast.success(`Doctor ${action}d successfully`);
          fetchDoctors(true); // Force refresh
        } else {
          throw new Error(`Failed to ${action} doctor`);
        }
      } catch (err) {
        console.error(`Error ${action}ing doctor:`, err);
        const errorMessage = err.response?.data?.error || err.message || `Failed to ${action} doctor`;
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddDoctor = () => {
    navigate('/admin/doctors/add');
  };

  const handleViewDoctorProfile = async (doctor) => {
    try {
      // Fetch detailed doctor profile from backend
      const response = await doctorAPI.getById(doctor.userId);
      
      if (response.status === 200) {
        const profileData = response.data;
        setSelectedDoctor({
          ...doctor,
          ...profileData,
          specialization: profileData.specialization || doctor.specialization,
          licenseNumber: profileData.licenseNumber,
          bio: profileData.bio,
          experienceYears: profileData.experienceYears,
          rating: profileData.rating,
          reviews: profileData.reviews
        });
        setShowModal(true);
      } else {
        // If no profile exists, show basic info
        setSelectedDoctor(doctor);
        setShowModal(true);
      }
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      // Show basic info if profile fetch fails
      setSelectedDoctor(doctor);
      setShowModal(true);
    }
  };

  const columns = [
    {
      header: 'Doctor',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <UserAvatar 
            name={`${row.original.firstName} ${row.original.lastName}`}
            src={row.original.profilePicture}
            size="sm"
          />
          <div>
            <div className="font-medium text-gray-900">
              {row.original.firstName} {row.original.lastName}
            </div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Specialization',
      accessorKey: 'specialization',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.specialization || 'Not specified'}</span>
      )
    },
    {
      header: 'Phone',
      accessorKey: 'phoneNumber',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.phoneNumber || 'Not provided'}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.isActive ? 'active' : 'inactive'} 
          variant={row.original.isActive ? 'success' : 'warning'}
        />
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <ActionButtons
          onView={() => handleViewDoctorProfile(row.original)}
          onEdit={() => handleEditDoctor(row.original)}
          onDelete={() => handleDeleteDoctor(row.original)}
          onToggle={() => handleToggleDoctorStatus(row.original)}
          toggleText={row.original.isActive ? 'Deactivate' : 'Activate'}
          loading={actionLoading}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctors"
        subtitle="Manage all doctors in the system"
        onAdd={handleAddDoctor}
        addButtonText="Add Doctor"
      />

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ]}
        placeholder="Search doctors..."
      />

      <DataTable
        columns={columns}
        data={filteredDoctors}
        onRowClick={handleViewDoctorProfile}
        selectedRow={selectedDoctor}
        loading={loading || actionLoading}
      />

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Doctor Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <UserAvatar 
                  name={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  src={selectedDoctor.profilePicture}
                  size="lg"
                />
                <div>
                  <h4 className="font-semibold text-xl">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedDoctor.email}</p>
                  <p className="text-gray-600">{selectedDoctor.phoneNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Specialization:</span>
                    <p className="text-gray-900">{selectedDoctor.specialization || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">License Number:</span>
                    <p className="text-gray-900">{selectedDoctor.licenseNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Experience:</span>
                    <p className="text-gray-900">
                      {selectedDoctor.experienceYears ? `${selectedDoctor.experienceYears} years` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Rating:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">{selectedDoctor.rating || 'No ratings'}</span>
                      {selectedDoctor.rating && (
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < Math.floor(selectedDoctor.rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="mt-1">
                      <StatusBadge 
                        status={selectedDoctor.isActive ? 'active' : 'inactive'} 
                        variant={selectedDoctor.isActive ? 'success' : 'warning'}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Joined:</span>
                    <p className="text-gray-900">
                      {new Date(selectedDoctor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Reviews:</span>
                    <p className="text-gray-900">{selectedDoctor.reviews || 0} reviews</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <p className="text-gray-900">
                      {new Date(selectedDoctor.updatedAt || selectedDoctor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedDoctor.bio && (
                <div>
                  <span className="font-medium text-gray-700">Bio:</span>
                  <p className="text-gray-900 mt-1">{selectedDoctor.bio}</p>
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
                  handleToggleDoctorStatus(selectedDoctor);
                }}
                className={`px-4 py-2 rounded-md ${
                  selectedDoctor.isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedDoctor.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
