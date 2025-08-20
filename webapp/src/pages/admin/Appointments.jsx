import {
  Calendar,
  Clock,
  Edit,
  Eye,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Trash2,
  Video
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { UserAvatar } from '../../components/shared';
import { Button, LoadingSpinner } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const Appointments = () => {
  const { user } = useAuth();
  const { data, loading, error, fetchAdminAppointments } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');

  // Use cached appointments data
  const appointments = data.adminAppointments || [];

  // Load appointments if not already cached
  useEffect(() => {
    if (!data.adminAppointments) {
      fetchAdminAppointments();
    }
  }, [data.adminAppointments, fetchAdminAppointments]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = `${appointment.patientFirstName || ''} ${appointment.patientLastName || ''}`.trim();
    const doctorName = `${appointment.doctorFirstName || ''} ${appointment.doctorLastName || ''}`.trim();
    
    const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.reasonForVisit?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewAppointment = (appointment) => {
    console.log('View appointment:', appointment);
    // Implement view appointment modal
  };

  const handleEditAppointment = (appointment) => {
    console.log('Edit appointment:', appointment);
    // Implement edit appointment modal
  };

  const handleDeleteAppointment = async (appointment) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        console.log('Deleting appointment:', appointment);
        // Refresh the list
        await fetchAdminAppointments(true);
      } catch (err) {
        toast.error('Failed to delete appointment');
        console.error('Error deleting appointment:', err);
      }
    }
  };

  const handleNewAppointment = () => {
    console.log('Create new appointment');
    // Implement new appointment modal
  };

  const handleStartSession = (appointment) => {
    console.log('Start consultation session:', appointment);
    // Navigate to consultation room
  };

  const handleSendMessage = (appointment) => {
    console.log('Send message to patient:', appointment);
    // Navigate to chat
  };

  const isDoctor = user?.role === 'doctor';
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <LoadingSpinner size="2xl" text="Loading appointments..." />;
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
              <h3 className="text-sm font-medium text-red-800">Error Loading Appointments</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => fetchAdminAppointments(true)}>
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isDoctor ? 'My Appointments' : 'Appointments'}
          </h1>
          <p className="text-gray-600">
            {isDoctor 
              ? 'Manage your patient appointments and consultations'
              : 'Manage all appointments in the system'
            }
          </p>
        </div>
        {isAdmin && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleNewAppointment}
          >
            New Appointment
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search appointments..."
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
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Clear Filters */}
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setSelectedDate('');
            }}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isDoctor ? 'Patient' : 'Patient'}
                </th>
                {!isDoctor && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAppointments.map((appointment) => {
                const patientName = `${appointment.patientFirstName || ''} ${appointment.patientLastName || ''}`.trim();
                const doctorName = `${appointment.doctorFirstName || ''} ${appointment.doctorLastName || ''}`.trim();
                const appointmentDate = new Date(appointment.appointmentDate);
                const formattedDate = appointmentDate.toLocaleDateString();
                const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                return (
                  <tr key={appointment.appointmentId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserAvatar 
                              user={{ 
                                first_name: appointment.patientFirstName || 'P', 
                                last_name: appointment.patientLastName || 'atient' 
                              }} 
                              size="sm" 
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {patientName || 'Unknown Patient'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.patientEmail || 'No email'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.patientPhoneNumber || 'No phone'}
                          </div>
                        </div>
                      </div>
                    </td>
                    {!isDoctor && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctorName || 'Unknown Doctor'}</div>
                        <div className="text-sm text-gray-500">{appointment.doctorSpecialization || 'No specialization'}</div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">{formattedDate}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formattedTime}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{appointment.appointmentMode || 'Online'}</div>
                      <div className="text-sm text-gray-500">{appointment.reasonForVisit || 'No reason specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        
                        {isDoctor && appointment.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStartSession(appointment)}
                              className="text-green-600 hover:text-green-900"
                              title="Start Session"
                            >
                              <Video className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSendMessage(appointment)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Send Message"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        
                        {(isAdmin || (isDoctor && appointment.status === 'pending')) && (
                          <button
                            onClick={() => handleEditAppointment(appointment)}
                            className="text-green-600 hover:text-green-900"
                            title="Edit Appointment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteAppointment(appointment)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Appointment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No appointments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all' || selectedDate 
                ? 'Try adjusting your search or filters.'
                : isDoctor 
                  ? 'You have no appointments scheduled.'
                  : 'Get started by creating a new appointment.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && !selectedDate && isAdmin && (
              <div className="mt-6">
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={handleNewAppointment}
                >
                  New Appointment
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.length}
              </div>
              <div className="text-sm text-gray-500">Total Appointments</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'confirmed').length}
              </div>
              <div className="text-sm text-gray-500">Confirmed</div>
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
                {appointments.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">
                {appointments.filter(a => a.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
