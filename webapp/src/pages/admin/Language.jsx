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

const Language = () => {
  const navigate = useNavigate();
  const { data, loading, error, fetchLanguages } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached languages data
  const languages = data.languages || [];

  // Load languages if not already cached
  useEffect(() => {
    if (!data.languages) {
      fetchLanguages();
    }
  }, [data.languages, fetchLanguages]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter languages based on search and status
  const filteredLanguages = languages.filter(language => {
    const matchesSearch = !searchTerm ||
      language.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      language.nativeName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || language.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const handleViewLanguage = (language) => {
    setSelectedLanguage(language);
    setShowModal(true);
  };

  const handleEditLanguage = (language) => {
    navigate(`/admin/language/${language.languageId}/edit`);
  };

  const handleDeleteLanguage = async (language) => {
    if (window.confirm(`Are you sure you want to delete language "${language.name}"?`)) {
      try {
        // Call API to delete language
        console.log('Deleting language:', language.languageId);
        toast.success('Language deleted successfully');
        fetchLanguages(true); // Force refresh
      } catch (err) {
        console.error('Error deleting language:', err);
        toast.error('Failed to delete language');
      }
    }
  };

  const handleAddLanguage = () => {
    navigate('/admin/language/add');
  };

  const handleToggleDefault = async (language) => {
    try {
      // Call API to set as default language
      console.log('Setting default language:', language.languageId);
      toast.success(`${language.name} set as default language`);
      fetchLanguages(true); // Force refresh
    } catch (err) {
      console.error('Error setting default language:', err);
      toast.error('Failed to set default language');
    }
  };

  const columns = [
    {
      header: 'Language',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-bold">
            {row.original.code?.toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.nativeName}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Code',
      accessorKey: 'code',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-900">{row.original.code}</span>
      )
    },
    {
      header: 'Direction',
      accessorKey: 'direction',
      cell: ({ row }) => (
        <span className="text-sm text-gray-900 capitalize">{row.original.direction || 'ltr'}</span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => (
        <StatusBadge 
          status={row.original.status} 
          variant={row.original.status === 'active' ? 'success' : 'warning'}
        />
      )
    },
    {
      header: 'Default',
      accessorKey: 'isDefault',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {row.original.isDefault ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Default
            </span>
          ) : (
            <button
              onClick={() => handleToggleDefault(row.original)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Set Default
            </button>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <ActionButtons
          onView={() => handleViewLanguage(row.original)}
          onEdit={() => handleEditLanguage(row.original)}
          onDelete={() => handleDeleteLanguage(row.original)}
        />
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Language Settings"
        subtitle="Manage system languages and translations"
        onAdd={handleAddLanguage}
        addButtonText="Add Language"
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
        placeholder="Search languages..."
      />

      <DataTable
        columns={columns}
        data={filteredLanguages}
        onRowClick={handleViewLanguage}
        selectedRow={selectedLanguage}
        loading={loading}
      />

      {/* Language Details Modal */}
      {showModal && selectedLanguage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Language Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-bold">
                  {selectedLanguage.code?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-lg">{selectedLanguage.name}</h4>
                  <p className="text-gray-600">{selectedLanguage.nativeName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Language Code:</span>
                  <p className="font-mono text-gray-900">{selectedLanguage.code}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Direction:</span>
                  <p className="text-gray-900 capitalize">{selectedLanguage.direction || 'ltr'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <StatusBadge 
                    status={selectedLanguage.status} 
                    variant={selectedLanguage.status === 'active' ? 'success' : 'warning'}
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-700">Default:</span>
                  <p className="text-gray-900">{selectedLanguage.isDefault ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Translation Progress:</span>
                  <p className="text-gray-900">{selectedLanguage.translationProgress || 0}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <p className="text-gray-900">
                    {new Date(selectedLanguage.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {selectedLanguage.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{selectedLanguage.description}</p>
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
                  handleEditLanguage(selectedLanguage);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Language
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Language;
