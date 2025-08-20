import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
    ActionButtons,
    DataTable,
    PageHeader,
    SearchAndFilter,
    StatusBadge
} from '../../components/shared';
import { useData } from '../../contexts/DataContext.jsx';

const Backup = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchBackups } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached backups data
  const backups = data.backups || [];

  // Load backups if not already cached
  useEffect(() => {
    if (!data.backups) {
      fetchBackups();
    }
  }, [data.backups, fetchBackups]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter backups based on search and status
  const filteredBackups = backups.filter(backup => {
    const matchesSearch = !searchTerm ||
      backup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || backup.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewBackup = (backup) => {
    setSelectedBackup(backup);
    setShowModal(true);
  };

  const handleEditBackup = (backup) => {
    navigate(`/admin/backup/${backup.backupId}/edit`);
  };

  const handleDeleteBackup = async (backup) => {
    if (window.confirm(`Are you sure you want to delete backup "${backup.name}"?`)) {
      try {
        // Call API to delete backup
        console.log('Deleting backup:', backup.backupId);
        toast.success('Backup deleted successfully');
        fetchBackups(true); // Force refresh
      } catch (err) {
        console.error('Error deleting backup:', err);
        toast.error('Failed to delete backup');
      }
    }
  };

  // const handleAddBackup = () => {
  //   navigate('/admin/backup/add');
  // };

  const handleCreateBackup = async () => {
    try {
      // Call API to create new backup
      console.log('Creating new backup...');
      toast.success('Backup creation started');
      fetchBackups(true); // Force refresh
    } catch (err) {
      console.error('Error creating backup:', err);
      toast.error('Failed to create backup');
    }
  };

  const handleRestoreBackup = async (backup) => {
    if (window.confirm(`Are you sure you want to restore from backup "${backup.name}"? This will overwrite current data.`)) {
      try {
        // Call API to restore backup
        console.log('Restoring backup:', backup.backupId);
        toast.success('Backup restoration started');
      } catch (err) {
        console.error('Error restoring backup:', err);
        toast.error('Failed to restore backup');
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const columns = [
    {
      header: 'Backup Name',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.description}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900 capitalize">{row.original.type}</span>
      )
    },
    {
      header: 'Size',
      accessorKey: 'size',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{formatFileSize(row.original.size || 0)}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          variant={
            row.original.status === 'completed' ? 'success' : 
            row.original.status === 'in_progress' ? 'warning' : 
            row.original.status === 'failed' ? 'error' : 'default'
          }
        />
      )
    },
    {
      header: 'Created',
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
            onView={() => handleViewBackup(row.original)}
            onEdit={() => handleEditBackup(row.original)}
            onDelete={() => handleDeleteBackup(row.original)}
          />
          {row.original.status === 'completed' && (
            <button
              onClick={() => handleRestoreBackup(row.original)}
              className="text-sm text-orange-600 hover:text-orange-800"
              title="Restore Backup"
            >
              Restore
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Backup"
        subtitle="Manage system backups and restoration"
        onAdd={handleCreateBackup}
        addButtonText="Create Backup"
      />

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={filterStatus}
        onFilterChange={setFilterStatus}
        filterOptions={[
          { value: 'all', label: 'All Status' },
          { value: 'completed', label: 'Completed' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'failed', label: 'Failed' }
        ]}
        placeholder="Search backups..."
      />

      <DataTable
        columns={columns}
        data={filteredBackups}
        onRowClick={handleViewBackup}
        selectedRow={selectedBackup}
        loading={loading}
      />

      {/* Backup Details Modal */}
      {showModal && selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Backup Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{selectedBackup.name}</h4>
                <p className="text-gray-600">{selectedBackup.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <p className="text-gray-900 capitalize">{selectedBackup.type}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Size:</span>
                  <p className="text-gray-900">{formatFileSize(selectedBackup.size || 0)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <StatusBadge 
                    status={selectedBackup.status} 
                    variant={
                      selectedBackup.status === 'completed' ? 'success' : 
                      selectedBackup.status === 'in_progress' ? 'warning' : 
                      selectedBackup.status === 'failed' ? 'error' : 'default'
                    }
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">
                    {new Date(selectedBackup.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Location:</span>
                  <p className="text-gray-900">{selectedBackup.location || 'Local storage'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Compression:</span>
                  <p className="text-gray-900">{selectedBackup.compression || 'None'}</p>
                </div>
              </div>
              
              {selectedBackup.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-900 mt-1">{selectedBackup.notes}</p>
                </div>
              )}
              
              {selectedBackup.error && (
                <div>
                  <span className="font-medium text-red-700">Error:</span>
                  <p className="text-red-600 mt-1">{selectedBackup.error}</p>
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
              {selectedBackup.status === 'completed' && (
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleRestoreBackup(selectedBackup);
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Restore Backup
                </button>
              )}
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditBackup(selectedBackup);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Backup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backup;
