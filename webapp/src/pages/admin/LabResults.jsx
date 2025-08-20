import {
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Minus,
  Plus,
  Printer,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
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
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const LabResults = () => {
  const { user } = useAuth();
  const { data, loading, error, fetchLabResults } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedResult, setSelectedResult] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Use cached lab results data
  const labResults = data.labResults || [];

  // Load lab results if not already cached
  useEffect(() => {
    if (!data.labResults) {
      fetchLabResults();
    }
  }, [data.labResults, fetchLabResults]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter lab results based on search and status
  const filteredLabResults = labResults.filter(result => {
    const matchesSearch = !searchTerm || 
      result.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.labName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setShowModal(true);
  };

  const handlePrintResult = async (result) => {
    try {
      // Call API to generate printable version
      console.log('Printing lab result:', result);
      // In a real app, you would open a print dialog or download PDF
    } catch (err) {
      console.error('Error printing lab result:', err);
    }
  };

  const handleDownloadResult = async (result) => {
    try {
      // Call API to download lab result
      console.log('Downloading lab result:', result);
      // In a real app, you would trigger a download
    } catch (err) {
      console.error('Error downloading lab result:', err);
    }
  };

  const handleNewTest = () => {
    console.log('Ordering new lab test');
    // Navigate to lab test ordering form
  };

  const getResultStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-orange-500" />;
      case 'abnormal': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (result) => (
        <div className="flex items-center">
          <UserAvatar user={{ first_name: result.patientName?.split(' ')[0], last_name: result.patientName?.split(' ')[1] || '' }} size="sm" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{result.patientName}</div>
            <div className="text-sm text-gray-500">ID: {result.patientId}</div>
          </div>
        </div>
      )
    },
    {
      key: 'testName',
      header: 'Test',
      render: (result) => <div className="text-sm text-gray-900">{result.testName}</div>
    },
    {
      key: 'testType',
      header: 'Type',
      render: (result) => <div className="text-sm text-gray-900">{result.testType}</div>
    },
    {
      key: 'orderedBy',
      header: 'Ordered By',
      render: (result) => <div className="text-sm text-gray-900">{result.orderedBy}</div>
    },
    {
      key: 'orderedDate',
      header: 'Ordered Date',
      render: (result) => <div className="text-sm text-gray-900">{formatDate(result.orderedDate)}</div>
    },
    {
      key: 'status',
      header: 'Status',
      render: (result) => <StatusBadge status={result.status} />
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (result) => (
        <ActionButtons
          actions={[
            {
              type: 'view',
              onClick: () => handleViewResult(result),
              tooltip: 'View Details'
            },
            ...(result.status === 'completed' ? [
              {
                type: 'print',
                onClick: () => handlePrintResult(result),
                tooltip: 'Print Result'
              },
              {
                type: 'download',
                onClick: () => handleDownloadResult(result),
                tooltip: 'Download Result'
              }
            ] : [])
          ]}
        />
      )
    }
  ];

  // Search and filter configuration
  const searchAndFilterConfig = {
    searchTerm,
    onSearchChange: setSearchTerm,
    searchPlaceholder: "Search lab results...",
    filters: [
      {
        key: 'status',
        value: filterStatus,
        options: [
          { value: 'all', label: 'All Status' },
          { value: 'completed', label: 'Completed' },
          { value: 'pending', label: 'Pending' },
          { value: 'processing', label: 'Processing' },
          { value: 'cancelled', label: 'Cancelled' }
        ]
      }
    ],
    onFilterChange: (key, value) => {
      if (key === 'status') setFilterStatus(value);
    },
    primaryAction: {
      label: 'Order New Test',
      icon: Plus,
      onClick: handleNewTest
    }
  };

  // Modal actions configuration
  const modalActions = [
    {
      label: 'Close',
      variant: 'outline',
      onClick: () => setShowModal(false)
    },
    ...(selectedResult?.status === 'completed' ? [
      {
        label: 'Print',
        variant: 'outline',
        icon: Printer,
        onClick: () => selectedResult && handlePrintResult(selectedResult)
      },
      {
        label: 'Download',
        variant: 'primary',
        icon: Download,
        onClick: () => selectedResult && handleDownloadResult(selectedResult)
      }
    ] : [])
  ];

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading lab results..." />;
  }

  return (
    <div className="h-full flex bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <PageHeader
            title="Laboratory Results"
            subtitle="View and manage laboratory test results"
          />

          {/* Debug Info */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>User Role: {user?.role || 'Not set'}</p>
            <p>User ID: {user?.userId || 'Not set'}</p>
            <p>User Email: {user?.email || 'Not set'}</p>
            <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
            <button
              onClick={fetchLabResults}
              className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700"
            >
              Test API Call
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded text-left text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>User Role: {user?.role || 'Not set'}</p>
                <p>User ID: {user?.userId || 'Not set'}</p>
                <p>User Email: {user?.email || 'Not set'}</p>
                <p>Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}</p>
              </div>
            </div>
          )}

          <SearchAndFilter {...searchAndFilterConfig} />

          <DataTable
            columns={columns}
            data={filteredLabResults}
            onRowClick={handleViewResult}
            selectedRow={selectedResult}
            loading={loading}
            emptyMessage="No lab results found. Try adjusting your search or filters."
          />

          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Lab Result Details"
            size="xl"
            actions={modalActions}
          >
            {selectedResult && (
              <div className="space-y-6">
                {/* Test Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Patient</h3>
                    <p className="text-sm text-gray-900">{selectedResult.patientName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedResult.patientId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Test Name</h3>
                    <p className="text-sm text-gray-900">{selectedResult.testName}</p>
                    <p className="text-xs text-gray-500">{selectedResult.testType}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ordered By</h3>
                    <p className="text-sm text-gray-900">{selectedResult.orderedBy}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <StatusBadge status={selectedResult.status} />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Ordered Date</h3>
                    <p className="text-sm text-gray-900">{formatDate(selectedResult.orderedDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Completed Date</h3>
                    <p className="text-sm text-gray-900">{formatDate(selectedResult.completedDate)}</p>
                  </div>
                </div>

                {/* Results */}
                {selectedResult.status === 'completed' && selectedResult.results && selectedResult.results.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Test Results</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parameter</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Normal Range</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedResult.results.map((result, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-sm text-gray-900">{result.parameter}</td>
                              <td className="px-4 py-2 text-sm text-gray-900 font-medium">{result.value}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{result.unit}</td>
                              <td className="px-4 py-2 text-sm text-gray-500">{result.normalRange}</td>
                              <td className="px-4 py-2 text-sm">
                                <div className="flex items-center space-x-1">
                                  {getResultStatusIcon(result.status)}
                                  <StatusBadge status={result.status} size="xs" />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedResult.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedResult.notes}</p>
                  </div>
                )}

                {/* Pending Status Message */}
                {selectedResult.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <p className="text-sm text-yellow-800">
                        This test is currently being processed. Results will be available once the test is completed.
                      </p>
                    </div>
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

export default LabResults;
