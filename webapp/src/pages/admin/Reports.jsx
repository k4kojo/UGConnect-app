import {
  Activity,
  BarChart3,
  Wallet,
  Download,
  Eye,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, TopLoadingBar, ReportFormModal } from '../../components/ui';

import { useData } from '../../contexts/DataContext.jsx';

const Reports = () => {
  const { data, loading, error, fetchReports, createReport, generateReport, downloadReport, deleteReport } = useData();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewingReport, setViewingReport] = useState(null);

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
    { id: 'revenue', label: 'Revenue', icon: Wallet },
    { id: 'staff', label: 'Staff', icon: Activity },
    { id: 'inventory', label: 'Inventory', icon: FileText }
  ];

  const handleOpenFormModal = () => {
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
  };

  // Single handleSaveReport function as requested
  const handleSaveReport = async (formData) => {
    setActionLoading(true);
    try {
      console.log('Creating new report:', formData);
      
      // Use createReport for form-based reports
      const result = await createReport(formData);
      if (result) {
        toast.success('Report created successfully');
        setShowFormModal(false);
        await fetchReports();
      } else {
        toast.error('Failed to create report');
      }
    } catch (err) {
      console.error('Error creating report:', err);
      
      let errorMessage = 'Failed to create report';
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewReport = async (report) => {
    try {
      setActionLoading(true);
      
      // For now, we'll show the report content in a simple alert
      // In a real app, you might want to open this in a modal or new tab
      if (report.fullContent) {
        // Create a new window/tab to display the report
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head>
                <title>${report.name}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
                  h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                  .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
                  .content { white-space: pre-wrap; }
                </style>
              </head>
              <body>
                <h1>${report.name}</h1>
                <div class="meta">
                  <p><strong>Type:</strong> ${report.type}</p>
                  <p><strong>Created:</strong> ${formatDate(report.lastGenerated)}</p>
                  <p><strong>Size:</strong> ${report.fileSize}</p>
                </div>
                <div class="content">${report.fullContent}</div>
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          toast.error('Please allow popups to view the report');
        }
      } else {
        toast.error('Report content not available');
      }
    } catch (err) {
      console.error('Error viewing report:', err);
      toast.error('Failed to view report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      setActionLoading(true);
      
      const result = await downloadReport(report.id);
      if (result && result.success) {
        // Create a downloadable file
        const content = result.content || report.fullContent || 'No content available';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Report downloaded successfully!');
      } else {
        toast.error('Failed to download report');
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      toast.error('Failed to download report');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm(`Are you sure you want to delete "${report.name}"?`)) {
      try {
        setActionLoading(true);
        
        const success = await deleteReport(report.id);
        if (success) {
          toast.success('Report deleted successfully');
          await fetchReports(); // Refresh the list
        } else {
          toast.error('Failed to delete report');
        }
      } catch (err) {
        console.error('Error deleting report:', err);
        toast.error('Failed to delete report');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid date';
    }
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
      <>
        <TopLoadingBar loading />
        <div className="min-h-screen" />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and manage system reports</p>
        </div>
        <Button 
          onClick={handleOpenFormModal} 
          className="flex items-center space-x-2"
          disabled={actionLoading}
        >
          <Plus className="w-4 h-4" />
          <span>Create Report</span>
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
                    <span>Created: {formatDate(report.lastGenerated)}</span>
                    <span>Size: {report.fileSize}</span>
                    {report.createdBy && <span>By: {report.createdBy}</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                    title="View Report"
                    disabled={actionLoading}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Download Report"
                    disabled={actionLoading}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReport(report)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Report"
                    disabled={actionLoading}
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
                : 'Create your first report to get started.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Report Form Modal */}
      <ReportFormModal
        isOpen={showFormModal}
        onClose={handleCloseFormModal}
        onSave={handleSaveReport}
        loading={actionLoading}
        reportType={selectedReport}
      />
    </div>
  );
};

export default Reports;