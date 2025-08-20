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

const Users = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchUsers } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached users data
  const users = data.users || [];

  // Load users if not already cached
  useEffect(() => {
    if (!data.users) {
      fetchUsers();
    }
  }, [data.users, fetchUsers]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter users based on search, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    navigate(`/admin/users/${user.userId}/edit`);
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.firstName} ${user.lastName}?`)) {
      try {
        // Call API to delete user
        console.log('Deleting user:', user.userId);
        toast.success('User deleted successfully');
        fetchUsers(true); // Force refresh
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleAddUser = () => {
    navigate('/admin/users/add');
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      // Call API to update user status
      console.log('Updating user status:', user.userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
      fetchUsers(true); // Force refresh
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const columns = [
    {
      header: 'User',
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
      header: 'Role',
      accessorKey: 'role',
      cell: ({ row }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
          {row.original.role}
        </span>
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
      header: 'Verified',
      accessorKey: 'isVerified',
      cell: ({ row }) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.original.isVerified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isVerified ? 'Verified' : 'Not Verified'}
        </span>
      )
    },
    {
      header: 'Joined',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <ActionButtons
            onView={() => handleViewUser(row.original)}
            onEdit={() => handleEditUser(row.original)}
            onDelete={() => handleDeleteUser(row.original)}
          />
          <button
            onClick={() => handleToggleUserStatus(row.original)}
            className={`text-sm ${
              row.original.status === 'active' 
                ? 'text-red-600 hover:text-red-800' 
                : 'text-green-600 hover:text-green-800'
            }`}
            title={row.original.status === 'active' ? 'Deactivate User' : 'Activate User'}
          >
            {row.original.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage all system users"
        onAdd={handleAddUser}
        addButtonText="Add User"
      />

      <div className="flex space-x-4">
        <SearchAndFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterValue={filterRole}
          onFilterChange={setFilterRole}
          filterOptions={[
            { value: 'all', label: 'All Roles' },
            { value: 'admin', label: 'Admin' },
            { value: 'doctor', label: 'Doctor' },
            { value: 'patient', label: 'Patient' },
            { value: 'nurse', label: 'Nurse' },
            { value: 'pharmacist', label: 'Pharmacist' },
            { value: 'laboratorist', label: 'Laboratorist' },
            { value: 'accountant', label: 'Accountant' }
          ]}
          placeholder="Search users..."
        />
        
        <SearchAndFilter
          searchTerm=""
          onSearchChange={() => {}}
          filterValue={filterStatus}
          onFilterChange={setFilterStatus}
          filterOptions={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'pending', label: 'Pending' }
          ]}
          placeholder=""
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        onRowClick={handleViewUser}
        selectedRow={selectedUser}
        loading={loading}
      />

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
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
                  name={`${selectedUser.firstName} ${selectedUser.lastName}`}
                  src={selectedUser.profilePicture}
                  size="lg"
                />
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize ml-2">
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <StatusBadge 
                    status={selectedUser.status || 'active'} 
                    variant={selectedUser.status === 'active' ? 'success' : 'warning'}
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{selectedUser.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Verified:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                    selectedUser.isVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Joined:</span>
                  <p className="text-gray-900">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Login:</span>
                  <p className="text-gray-900">
                    {selectedUser.lastLoginAt ? 
                      new Date(selectedUser.lastLoginAt).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
              </div>
              
              {selectedUser.address && (
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900 mt-1">{selectedUser.address}</p>
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
                  handleEditUser(selectedUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
