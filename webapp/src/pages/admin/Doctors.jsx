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

const Doctors = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchDoctors } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    if (window.confirm(`Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
      try {
        // Call API to delete doctor
        console.log('Deleting doctor:', doctor.userId);
        toast.success('Doctor deleted successfully');
        fetchDoctors(true); // Force refresh
      } catch (err) {
        console.error('Error deleting doctor:', err);
        toast.error('Failed to delete doctor');
      }
    }
  };

  const handleAddDoctor = () => {
    navigate('/admin/doctors/add');
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
          status={row.original.status || 'active'} 
          variant={row.original.status === 'active' ? 'success' : 'warning'}
        />
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <ActionButtons
          onView={() => handleViewDoctor(row.original)}
          onEdit={() => handleEditDoctor(row.original)}
          onDelete={() => handleDeleteDoctor(row.original)}
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
          { value: 'inactive', label: 'Inactive' },
          { value: 'pending', label: 'Pending' }
        ]}
        placeholder="Search doctors..."
      />

      <DataTable
        columns={columns}
        data={filteredDoctors}
        onRowClick={handleViewDoctor}
        selectedRow={selectedDoctor}
        loading={loading}
      />

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Doctor Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserAvatar 
                  name={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  src={selectedDoctor.profilePicture}
                  size="lg"
                />
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedDoctor.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Specialization:</span>
                  <p className="text-gray-900">{selectedDoctor.specialization || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{selectedDoctor.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <StatusBadge 
                    status={selectedDoctor.status || 'active'} 
                    variant={selectedDoctor.status === 'active' ? 'success' : 'warning'}
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Joined:</span>
                  <p className="text-gray-900">
                    {new Date(selectedDoctor.createdAt).toLocaleDateString()}
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
