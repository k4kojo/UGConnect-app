import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  MessageCircle,
  Play,
  Search,
  Video,
  XCircle
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserAvatar } from '../../components/shared';
import { Button, LoadingSpinner } from '../../components/ui';
import { useData } from '../../contexts/DataContext';

const DoctorConsultations = () => {
  const { data, loading, error, fetchConsultations } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Use cached consultations data
  const consultations = data.consultations || [];

  // Load consultations if not already cached
  useEffect(() => {
    if (!data.consultations) {
      fetchConsultations();
    }
  }, [data.consultations, fetchConsultations]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredConsultations = consultations.filter(consultation => {
    const patientName = `${consultation.patientFirstName || ''} ${consultation.patientLastName || ''}`.trim();
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <AlertCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStartConsultation = (consultation) => {
    console.log('Start consultation:', consultation);
    // Navigate to video consultation room
  };

  const handleViewDetails = (consultation) => {
    console.log('View consultation details:', consultation);
    // Navigate to consultation details
  };

  const handleSendMessage = (consultation) => {
    console.log('Send message to patient:', consultation);
    // Navigate to chat
  };

  const handleViewRecords = (consultation) => {
    console.log('View medical records:', consultation);
    // Navigate to medical records
  };

  const handleCompleteConsultation = (consultation) => {
    console.log('Complete consultation:', consultation);
    // Mark consultation as completed
  };

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading consultations..." />;
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Consultations</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={fetchConsultations}>
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
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-600">Manage your patient consultation sessions</p>
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
              placeholder="Search consultations..."
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
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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

      {/* Consultations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConsultations.map((consultation) => {
          const patientName = `${consultation.patientFirstName || ''} ${consultation.patientLastName || ''}`.trim();
          const consultationDate = new Date(consultation.appointmentDate);
          const formattedDate = consultationDate.toLocaleDateString();
          const formattedTime = consultationDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const isToday = new Date().toDateString() === consultationDate.toDateString();
          const isUpcoming = consultationDate > new Date();
          
          return (
            <div key={consultation.appointmentId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Consultation Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserAvatar 
                        user={{ 
                          first_name: consultation.patientFirstName || 'P', 
                          last_name: consultation.patientLastName || 'atient' 
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
                      {getStatusIcon(consultation.status)}
                      <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                </div>
                {isToday && consultation.status === 'confirmed' && (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Today
                  </div>
                )}
              </div>

              {/* Consultation Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{formattedTime}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Video className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{consultation.appointmentMode || 'Online'}</span>
                </div>
                {consultation.reasonForVisit && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {consultation.reasonForVisit}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                {consultation.status === 'confirmed' && isUpcoming && (
                  <button
                    onClick={() => handleStartConsultation(consultation)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
                    title="Start Consultation"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </button>
                )}
                
                {consultation.status === 'confirmed' && !isUpcoming && (
                  <button
                    onClick={() => handleCompleteConsultation(consultation)}
                    className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    title="Complete Consultation"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </button>
                )}

                <button
                  onClick={() => handleViewDetails(consultation)}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </button>

                <button
                  onClick={() => handleSendMessage(consultation)}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                  title="Send Message"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </button>

                <button
                  onClick={() => handleViewRecords(consultation)}
                  className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
                  title="Medical Records"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Records
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredConsultations.length === 0 && (
        <div className="text-center py-12">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No consultations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'You have no consultations scheduled.'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Video className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {consultations.length}
              </div>
              <div className="text-sm text-gray-500">Total Consultations</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-500">Confirmed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {consultations.filter(c => {
                  const consultationDate = new Date(c.appointmentDate);
                  return consultationDate > new Date() && c.status === 'confirmed';
                }).length}
              </div>
              <div className="text-sm text-gray-500">Upcoming</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultations;
