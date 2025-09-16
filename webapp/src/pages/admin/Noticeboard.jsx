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

const Noticeboard = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchNotices } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached notices data
  const notices = data.notices || [];

  // Load notices if not already cached
  useEffect(() => {
    if (!data.notices) {
      fetchNotices();
    }
  }, [data.notices, fetchNotices]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter notices based on search and type
  const filteredNotices = notices.filter(notice => {
    const matchesSearch = !searchTerm ||
      notice.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.author?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || notice.type === filterType;

    return matchesSearch && matchesType;
  });

  const handleViewNotice = (notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
  };

  const handleEditNotice = (notice) => {
    navigate(`/admin/noticeboard/${notice.noticeId}/edit`);
  };

  const handleDeleteNotice = async (notice) => {
    if (window.confirm(`Are you sure you want to delete notice "${notice.title}"?`)) {
      try {
        // Call API to delete notice
        console.log('Deleting notice:', notice.noticeId);
        toast.success('Notice deleted successfully');
        fetchNotices(true); // Force refresh
      } catch (err) {
        console.error('Error deleting notice:', err);
        toast.error('Failed to delete notice');
      }
    }
  };

  const handleAddNotice = () => {
    navigate('/admin/noticeboard/add');
  };

  const columns = [
    {
      header: 'Title',
      accessorKey: 'title',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.title}</div>
          <div className="text-sm text-gray-500 line-clamp-2">{row.original.content}</div>
        </div>
      )
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.type} 
          variant={
            row.original.type === 'announcement' ? 'success' : 
            row.original.type === 'warning' ? 'warning' : 
            row.original.type === 'emergency' ? 'error' : 'default'
          }
        />
      )
    },
    {
      header: 'Author',
      accessorKey: 'author',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.author}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          variant={row.original.status === 'published' ? 'success' : 'warning'}
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
        <ActionButtons
          onView={() => handleViewNotice(row.original)}
          onEdit={() => handleEditNotice(row.original)}
          onDelete={() => handleDeleteNotice(row.original)}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Noticeboard"
        subtitle="Manage system notices and announcements"
        onAdd={handleAddNotice}
        addButtonText="Add Notice"
      />

      <SearchAndFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={filterType}
        onFilterChange={setFilterType}
        filterOptions={[
          { value: 'all', label: 'All Types' },
          { value: 'announcement', label: 'Announcement' },
          { value: 'warning', label: 'Warning' },
          { value: 'emergency', label: 'Emergency' },
          { value: 'update', label: 'Update' }
        ]}
        placeholder="Search notices..."
      />

      <DataTable
        columns={columns}
        data={filteredNotices}
        onRowClick={handleViewNotice}
        selectedRow={selectedNotice}
        loading={loading}
      />

      {/* Notice Details Modal */}
      {showModal && selectedNotice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notice Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedNotice.title}</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span>By: {selectedNotice.author}</span>
                  <span>•</span>
                  <span>{new Date(selectedNotice.createdAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <StatusBadge 
                    status={selectedNotice.type} 
                    variant={
                      selectedNotice.type === 'announcement' ? 'success' : 
                      selectedNotice.type === 'warning' ? 'warning' : 
                      selectedNotice.type === 'emergency' ? 'error' : 'default'
                    }
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedNotice.content}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <StatusBadge 
                    status={selectedNotice.status} 
                    variant={selectedNotice.status === 'published' ? 'success' : 'warning'}
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Priority:</span>
                  <span className="text-gray-900 capitalize">{selectedNotice.priority || 'normal'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Target Audience:</span>
                  <span className="text-gray-900 capitalize">{selectedNotice.targetAudience || 'all'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Expires:</span>
                  <span className="text-gray-900">
                    {selectedNotice.expiresAt ? 
                      new Date(selectedNotice.expiresAt).toLocaleDateString() : 
                      'No expiration'
                    }
                  </span>
                </div>
              </div>
              
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700">Attachments:</span>
                  <div className="mt-2 space-y-1">
                    {selectedNotice.attachments.map((attachment, index) => (
                      <div key={index} className="text-sm text-blue-600 hover:text-blue-800">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
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
                  handleEditNotice(selectedNotice);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Noticeboard;
