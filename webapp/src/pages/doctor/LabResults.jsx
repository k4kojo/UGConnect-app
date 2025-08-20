import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Search,
  TestTube,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserAvatar } from '../../components/shared';
import { Button, LoadingSpinner } from '../../components/ui';
import { useData } from '../../contexts/DataContext';

const DoctorLabResults = () => {
  const { data, loading, error, fetchLabResults } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filteredLabResults = labResults.filter(result => {
    const patientName = `${result.patientFirstName || ''} ${result.patientLastName || ''}`.trim();
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.testName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.labName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || result.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'abnormal': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      case 'abnormal': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleViewResult = (result) => {
    console.log('View lab result:', result);
    // Navigate to detailed lab result view
  };

  const handleDownloadResult = (result) => {
    console.log('Download lab result:', result);
    // Download lab result PDF
  };

  const handleViewPatient = (result) => {
    console.log('View patient details:', result);
    // Navigate to patient details
  };

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading lab results..." />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-red-400">⚠️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Lab Results</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => fetchLabResults(true)}>
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Results</h1>
          <p className="text-gray-600">View and manage laboratory test results for your patients</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search lab results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="normal">Normal</option>
            <option value="abnormal">Abnormal</option>
            <option value="critical">Critical</option>
            <option value="pending">Pending</option>
          </select>

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Lab Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabResults.map((result) => {
          const patientName = `${result.patientFirstName || ''} ${result.patientLastName || ''}`.trim();
          const resultDate = new Date(result.testDate).toLocaleDateString();
          
          return (
            <div key={result.labResultId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Result Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserAvatar 
                        user={{ 
                          first_name: result.patientFirstName || 'P', 
                          last_name: result.patientLastName || 'atient' 
                        }} 
                        size="sm" 
                      />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {patientName || 'Unknown Patient'}
                    </h3>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(result.status)}
                      <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(result.status)}`}>
                        {result.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Info */}
              <div className="space-y-3 mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Test:</span> {result.testName || 'Unknown Test'}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Lab:</span> {result.labName || 'Unknown Lab'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{resultDate}</span>
                </div>
                {result.resultValue && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Result:</span> {result.resultValue}
                  </div>
                )}
                {result.referenceRange && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Reference:</span> {result.referenceRange}
                  </div>
                )}
                {result.notes && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {result.notes}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewResult(result)}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>

                <button
                  onClick={() => handleDownloadResult(result)}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                  title="Download Report"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>

                <button
                  onClick={() => handleViewPatient(result)}
                  className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
                  title="Patient Details"
                >
                  <User className="h-4 w-4 mr-1" />
                  Patient
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredLabResults.length === 0 && (
        <div className="text-center py-12">
          <TestTube className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No lab results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'No lab results available for your patients.'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TestTube className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {labResults.length}
              </div>
              <div className="text-sm text-gray-500">Total Results</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {labResults.filter(r => r.status === 'normal').length}
              </div>
              <div className="text-sm text-gray-500">Normal</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {labResults.filter(r => r.status === 'abnormal' || r.status === 'critical').length}
              </div>
              <div className="text-sm text-gray-500">Abnormal</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {labResults.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorLabResults;
