import {
  Activity,
  BarChart3,
  DollarSign,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, LoadingSpinner } from '../../components/ui';
import { useData } from '../../contexts/DataContext.jsx';

const Reports = () => {
  const { data, loading, error, fetchReports, generateReport, downloadReport, deleteReport } = useData();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');

  // Use cached reports data
  const reports = data.reports || [];

  // Load reports if not already cached
  useEffect(() => {
    if (!data.reports) {
      fetchReports();
    }
  }, [data.reports, fetchReports]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter reports based on search
  const filteredReports = reports.filter(report => {
    const matchesSearch = !searchTerm ||
      report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'revenue', label: 'Revenue', icon: DollarSign },
    { id: 'staff', label: 'Staff', icon: Activity },
    { id: 'inventory', label: 'Inventory', icon: FileText }
  ];

  const dateRanges = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' },
    { value: '365', label: 'Last year' }
  ];

  const handleGenerateReport = async (reportType) => {
    try {
      const result = await generateReport(reportType, { dateRange });
      if (result) {
        toast.success(`${reportType} report generated successfully!`);
      } else {
        toast.error('Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Failed to generate report');
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const result = await downloadReport(report.id);
      if (result) {
        toast.success('Report downloaded successfully!');
      } else {
        toast.error('Failed to download report');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error('Failed to download report');
    }
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm(`Are you sure you want to delete "${report.name}"?`)) {
      try {
        const success = await deleteReport(report.id);
        if (success) {
          toast.success('Report deleted successfully');
        } else {
          toast.error('Failed to delete report');
        }
      } catch (err) {
        console.error('Error deleting report:', err);
        toast.error('Failed to delete report');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && reports.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage system reports</p>
        </div>
        <Button onClick={() => handleGenerateReport(selectedReport)} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Generate Report</span>
        </Button>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedReport(type.id)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                selectedReport === type.id
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              <type.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
        <div className="flex flex-wrap gap-3">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setDateRange(range.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                dateRange === range.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{report.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{report.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Type: {report.type}</span>
                    <span>Generated: {formatDate(report.lastGenerated)}</span>
                    <span>Size: {report.fileSize}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredReports.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Generate your first report to get started.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
