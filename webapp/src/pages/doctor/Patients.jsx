import {
  Calendar,
  Eye,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Search,
  TestTube,
  User
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserAvatar } from '../../components/shared';
import { Button, LoadingSpinner } from '../../components/ui';
import { useData } from '../../contexts/DataContext';

const DoctorPatients = () => {
  const { data, loading, error, fetchDoctorPatients } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  // Use cached patients data
  const patients = data.doctorPatients || [];

  // Load patients if not already cached
  useEffect(() => {
    if (!data.doctorPatients) {
      fetchDoctorPatients();
    }
  }, [data.doctorPatients, fetchDoctorPatients]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleViewPatient = (patient) => {
    console.log('View patient details:', patient);
    // Navigate to patient details page
  };

  const handleSendMessage = (patient) => {
    console.log('Send message to patient:', patient);
    // Navigate to chat with patient
  };

  const handleViewRecords = (patient) => {
    console.log('View medical records for patient:', patient);
    // Navigate to medical records
  };

  const handleViewLabResults = (patient) => {
    console.log('View lab results for patient:', patient);
    // Navigate to lab results
  };

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading patients..." />;
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Patients</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => fetchDoctorPatients(true)}>
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
          <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600">Manage and view information about your patients</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.map((patient) => {
          const fullName = `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
          const lastAppointmentDate = new Date(patient.lastAppointment).toLocaleDateString();
          
          return (
            <div key={patient.patientId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Patient Header */}
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 h-12 w-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserAvatar 
                      user={{ 
                        first_name: patient.firstName || 'P', 
                        last_name: patient.lastName || 'atient' 
                      }} 
                      size="md" 
                    />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {fullName || 'Unknown Patient'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {patient.appointmentCount} appointment{patient.appointmentCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Patient Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{patient.email || 'No email'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{patient.phoneNumber || 'No phone'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Last visit: {lastAppointmentDate}</span>
                </div>
                {patient.recentReason && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Recent reason:</span> {patient.recentReason}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewPatient(patient)}
                  className="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Details
                </button>
                <button
                  onClick={() => handleSendMessage(patient)}
                  className="flex-1 bg-green-50 text-green-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-green-100 transition-colors"
                  title="Send Message"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </button>
                <button
                  onClick={() => handleViewRecords(patient)}
                  className="flex-1 bg-purple-50 text-purple-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors"
                  title="Medical Records"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Records
                </button>
                <button
                  onClick={() => handleViewLabResults(patient)}
                  className="flex-1 bg-orange-50 text-orange-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-orange-100 transition-colors"
                  title="Lab Results"
                >
                  <TestTube className="h-4 w-4 mr-1" />
                  Labs
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search terms.'
              : 'You have no patients assigned yet.'
            }
          </p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {patients.length}
              </div>
              <div className="text-sm text-gray-500">Total Patients</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {patients.reduce((sum, patient) => sum + patient.appointmentCount, 0)}
              </div>
              <div className="text-sm text-gray-500">Total Appointments</div>
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
                {patients.filter(p => p.appointmentCount > 1).length}
              </div>
              <div className="text-sm text-gray-500">Returning Patients</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorPatients;
