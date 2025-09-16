import { AlertCircle, CheckCircle, Clock, Mail, MapPin, Phone, User } from 'lucide-react';
import React from 'react';

const AppointmentCard = ({ 
  appointment, 
  onViewDetails, 
  onStartSession,
  onReschedule,
  className = '' 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-gray-900">{appointment.patientName}</h4>
            <p className="text-sm text-gray-600">{appointment.time}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span className="ml-1">{appointment.status}</span>
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          {appointment.phone}
        </div>
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          {appointment.email}
        </div>
        <div className="flex items-center text-gray-600">
          <MapPin className="h-4 w-4 mr-2" />
          {appointment.address}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        {onViewDetails && (
          <button 
            onClick={() => onViewDetails(appointment)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
          >
            View Details
          </button>
        )}
        {onStartSession && (
          <button 
            onClick={() => onStartSession(appointment)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
          >
            Start Session
          </button>
        )}
        {onReschedule && (
          <button 
            onClick={() => onReschedule(appointment)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded"
          >
            Reschedule
          </button>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
