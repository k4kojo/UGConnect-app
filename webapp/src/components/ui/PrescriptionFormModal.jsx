import { Calendar, Pill, User, Clock, FileText, Stethoscope } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Button from './Button';
import Modal from './Modal';

const PrescriptionFormModal = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
  patients = [],
  appointments = []
}) => {
  const [formData, setFormData] = useState({
    appointmentId: '',
    patientId: '',
    diagnosis: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });

  // Form supports both appointment-based and direct prescriptions
  // Mode is determined by whether appointmentId is selected or not

  const [errors, setErrors] = useState({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        appointmentId: '',
        patientId: '',
        diagnosis: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If appointment is selected, auto-fill patient information
    if (field === 'appointmentId' && value) {
      const selectedAppointment = appointments.find(apt => apt.appointmentId === value);
      if (selectedAppointment) {
        setFormData(prev => ({
          ...prev,
          appointmentId: value,
          patientId: selectedAppointment.patientId,
          diagnosis: selectedAppointment.reasonForVisit || ''
        }));
      }
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate that either appointment or patient is selected
    if (!formData.appointmentId.trim() && !formData.patientId.trim()) {
      newErrors.selection = 'Please select either an appointment or a patient';
    }

    // Validate diagnosis
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    } else if (formData.diagnosis.trim().length < 3) {
      newErrors.diagnosis = 'Diagnosis must be at least 3 characters';
    } else if (formData.diagnosis.trim().length > 200) {
      newErrors.diagnosis = 'Diagnosis must not exceed 200 characters';
    }

    // Validate medication
    if (!formData.medication.trim()) {
      newErrors.medication = 'Medication name is required';
    } else if (formData.medication.trim().length < 2) {
      newErrors.medication = 'Medication name must be at least 2 characters';
    } else if (formData.medication.trim().length > 100) {
      newErrors.medication = 'Medication name must not exceed 100 characters';
    }

    // Validate dosage
    if (!formData.dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    } else if (!/^[\d\.]+\s*[a-zA-Z]+$/.test(formData.dosage.trim())) {
      newErrors.dosage = 'Dosage must be in format like "500mg" or "10ml"';
    }

    // Validate frequency
    if (!formData.frequency.trim()) {
      newErrors.frequency = 'Frequency is required';
    } else if (formData.frequency.trim().length > 50) {
      newErrors.frequency = 'Frequency must not exceed 50 characters';
    }

    // Validate duration
    if (!formData.duration.trim()) {
      newErrors.duration = 'Duration is required';
    } else if (formData.duration.trim().length > 50) {
      newErrors.duration = 'Duration must not exceed 50 characters';
    }

    // Validate notes
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes must not exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to create prescription');
    }
  };

  const handleCancel = () => {
    setFormData({
      appointmentId: '',
      patientId: '',
      diagnosis: '',
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      notes: ''
    });
    setErrors({});
    onClose();
  };

  // Get selected appointment and patient info
  const selectedAppointment = appointments.find(apt => apt.appointmentId === formData.appointmentId);
  const selectedDirectPatient = patients.find(p => p.userId === formData.patientId);
  
  // Get patient name for display
  const getPatientName = () => {
    if (selectedAppointment) {
      return `${selectedAppointment.patientFirstName || ''} ${selectedAppointment.patientLastName || ''}`.trim();
    } else if (selectedDirectPatient) {
      return `${selectedDirectPatient.firstName || ''} ${selectedDirectPatient.lastName || ''}`.trim();
    }
    return '';
  };

  // Footer with action buttons
  const modalFooter = (
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
      <Button
        variant="outline"
        onClick={handleCancel}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        loading={loading}
        disabled={loading || 
          (!formData.diagnosis || !formData.medication || !formData.dosage || !formData.frequency || !formData.duration) ||
          (!formData.appointmentId && !formData.patientId)
        }
        className="w-full sm:w-auto"
      >
        {loading ? 'Creating...' : 'Create Prescription'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Create New Prescription"
      size="lg"
      className="max-w-2xl"
      scrollable={true}
      footer={modalFooter}
    >
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Appointment Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            Appointment (Optional)
          </label>
          <select
            value={formData.appointmentId}
            onChange={(e) => {
              handleInputChange('appointmentId', e.target.value);
              // Clear patient selection when appointment is selected
              if (e.target.value) {
                handleInputChange('patientId', '');
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.appointmentId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="">Select an appointment (or leave blank for direct prescription)...</option>
            {appointments.filter(apt => apt.status === 'confirmed' || apt.status === 'completed').map(appointment => (
              <option key={appointment.appointmentId} value={appointment.appointmentId}>
                {`${appointment.patientFirstName || ''} ${appointment.patientLastName || ''}`.trim()} - {new Date(appointment.appointmentDate).toLocaleDateString()} ({appointment.reasonForVisit || 'No reason specified'})
              </option>
            ))}
          </select>
          {errors.appointmentId && (
            <p className="mt-1 text-sm text-red-600">{errors.appointmentId}</p>
          )}
        </div>

        {/* Patient Selection (when no appointment selected) */}
        {!formData.appointmentId && (
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <User className="h-4 w-4 mr-2" />
              Patient *
            </label>
            <select
              value={formData.patientId}
              onChange={(e) => handleInputChange('patientId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.patientId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Select a patient...</option>
              {patients.map(patient => (
                <option key={patient.userId} value={patient.userId}>
                  {patient.firstName} {patient.lastName} {patient.email && `(${patient.email})`}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
            )}
            {errors.selection && (
              <p className="mt-1 text-sm text-red-600">{errors.selection}</p>
            )}
          </div>
        )}

        {/* Diagnosis */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Stethoscope className="h-4 w-4 mr-2" />
            Diagnosis *
          </label>
          <input
            type="text"
            value={formData.diagnosis}
            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
            placeholder="e.g., Hypertension, Common Cold, Diabetes"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.diagnosis ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={200}
          />
          {errors.diagnosis && (
            <p className="mt-1 text-sm text-red-600">{errors.diagnosis}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.diagnosis.length}/200 characters
          </p>
        </div>

        {/* Medication Name */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Pill className="h-4 w-4 mr-2" />
            Medication Name *
          </label>
          <input
            type="text"
            value={formData.medication}
            onChange={(e) => handleInputChange('medication', e.target.value)}
            placeholder="e.g., Paracetamol, Amoxicillin"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.medication ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={100}
          />
          {errors.medication && (
            <p className="mt-1 text-sm text-red-600">{errors.medication}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.medication.length}/100 characters
          </p>
        </div>

        {/* Dosage */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            Dosage *
          </label>
          <input
            type="text"
            value={formData.dosage}
            onChange={(e) => handleInputChange('dosage', e.target.value)}
            placeholder="e.g., 500mg, 10ml, 2 tablets"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dosage ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={20}
          />
          {errors.dosage && (
            <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Format: number + unit (e.g., "500mg", "2 tablets")
          </p>
        </div>

        {/* Frequency */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Clock className="h-4 w-4 mr-2" />
            Frequency *
          </label>
          <input
            type="text"
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', e.target.value)}
            placeholder="e.g., Twice daily, Every 8 hours, As needed"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.frequency ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={50}
          />
          {errors.frequency && (
            <p className="mt-1 text-sm text-red-600">{errors.frequency}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.frequency.length}/50 characters
          </p>
        </div>

        {/* Duration */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            Duration *
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="e.g., 5 days, 2 weeks, 1 month"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.duration ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={50}
          />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.duration.length}/50 characters
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <FileText className="h-4 w-4 mr-2" />
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="e.g., Take after meals, Do not exceed recommended dose"
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.notes ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
            maxLength={500}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {formData.notes.length}/500 characters
          </p>
        </div>

        {/* Prescription Summary */}
        {(selectedDirectPatient || selectedAppointment) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Prescription Summary</h4>
            <div className="text-sm text-blue-800">
              <p><strong>Patient:</strong> {getPatientName()}</p>
              {selectedAppointment && (
                <p><strong>Appointment:</strong> {new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
              )}
              {formData.diagnosis && <p><strong>Diagnosis:</strong> {formData.diagnosis}</p>}
              {formData.medication && <p><strong>Medication:</strong> {formData.medication}</p>}
              {formData.dosage && <p><strong>Dosage:</strong> {formData.dosage}</p>}
              {formData.frequency && <p><strong>Frequency:</strong> {formData.frequency}</p>}
              {formData.duration && <p><strong>Duration:</strong> {formData.duration}</p>}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default PrescriptionFormModal;
