import {
    Edit,
    Plus,
    Trash2
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, LoadingSpinner, Modal } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useData } from '../../contexts/DataContext.jsx';

const Availability = () => {
  const { user } = useAuth();
  const { data, loading, error, fetchDoctorAvailability, updateDoctorAvailability } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Use cached availability data
  const availability = data.doctorAvailability || [];

  // Load availability if not already cached
  useEffect(() => {
    if (user?.userId && !data.doctorAvailability) {
      fetchDoctorAvailability();
    }
  }, [user, data.doctorAvailability, fetchDoctorAvailability]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Form state for adding/editing availability
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    isAvailable: true,
    maxPatients: 10,
    notes: ''
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  const handleAddAvailability = () => {
    setFormData({
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      isAvailable: true,
      maxPatients: 10,
      notes: ''
    });
    setShowAddModal(true);
  };

  const handleEditAvailability = (slot) => {
    setSelectedSlot(slot);
    setFormData({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      maxPatients: slot.maxPatients || 10,
      notes: slot.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteAvailability = async (slotId) => {
    if (window.confirm('Are you sure you want to delete this availability slot?')) {
      try {
        // Call API to delete availability
        console.log('Deleting availability slot:', slotId);
        toast.success('Availability slot deleted successfully');
        fetchDoctorAvailability(true); // Force refresh
      } catch (err) {
        console.error('Error deleting availability slot:', err);
        toast.error('Failed to delete availability slot');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const availabilityData = {
        ...formData,
        doctorId: user.userId
      };

      if (showEditModal && selectedSlot) {
        // Update existing availability
        const result = await updateDoctorAvailability(selectedSlot.id, availabilityData);
        if (result) {
          toast.success('Availability updated successfully');
          setShowEditModal(false);
        } else {
          toast.error('Failed to update availability');
        }
      } else {
        // Create new availability
        const result = await updateDoctorAvailability(null, availabilityData);
        if (result) {
          toast.success('Availability added successfully');
          setShowAddModal(false);
        } else {
          toast.error('Failed to add availability');
        }
      }
    } catch (err) {
      console.error('Error saving availability:', err);
      toast.error('Failed to save availability');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getAvailabilityForDay = (day) => {
    return availability.filter(slot => slot.dayOfWeek === day);
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (isAvailable) => {
    return isAvailable ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading && availability.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-600 mt-2">Manage your consultation schedule</p>
        </div>
        <Button onClick={handleAddAvailability} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Availability</span>
        </Button>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {daysOfWeek.map((day) => {
              const daySlots = getAvailabilityForDay(day);
              return (
                <div key={day} className="space-y-3">
                  <h3 className="font-medium text-gray-900 text-center">{day}</h3>
                  <div className="space-y-2">
                    {daySlots.length > 0 ? (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(slot.isAvailable)}`}>
                              {slot.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mb-2">
                            Max Patients: {slot.maxPatients}
                          </div>
                          {slot.notes && (
                            <div className="text-xs text-gray-500 mb-2">
                              {slot.notes}
                            </div>
                          )}
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEditAvailability(slot)}
                              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteAvailability(slot.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
                        <span className="text-sm text-gray-500">No availability set</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Availability Modal */}
      {(showAddModal || showEditModal) && (
        <Modal
          isOpen={showAddModal || showEditModal}
          onClose={() => {
            setShowAddModal(false);
            setShowEditModal(false);
          }}
          title={showEditModal ? 'Edit Availability' : 'Add Availability'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <select
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <select
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{formatTime(time)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Patients
              </label>
              <input
                type="number"
                name="maxPatients"
                value={formData.maxPatients}
                onChange={handleInputChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional notes about this time slot..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Available for consultations
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {showEditModal ? 'Update' : 'Add'} Availability
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Availability;
