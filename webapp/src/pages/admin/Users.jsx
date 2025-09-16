import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Eye, User, Phone, Shield, Calendar, CheckCircle, XCircle, Save, Loader, Plus } from 'lucide-react';
import { userAPI } from '../../services/api.js';

// Add User Modal Component
const AddUserModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phoneNumber: '',
    // Patient fields
    studentId: '',
    birthDate: '',
    sex: '',
    // Doctor fields
    licenseNumber: '',
    yearsOfExperience: '',
    education: '',
    specialization: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState('');

  const specializations = [
    'Anesthesiology',
    'Bacteriological Laboratory',
    'Physical Therapy',
    'Plastic Surgery',
    'Infectious Disease Doctors',
    'Dermatologists',
    'Allergists',
    'Ophthalmologists',
    'Obstetrician/Gynecologists',
    'Cardiologists',
    'Endocrinologists',
    'Gastroenterologists',
    'Nephrologists',
    'Urologists',
    'Pulmonologists',
    'Otolaryngologists',
    'Neurologists',
    'Psychiatrists',
    'Oncologists',
    'Radiologists',
    'General Surgeons',
    'Orthopedic Surgeons',
    'Cardiac Surgeons'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle role change
    if (name === 'role') {
      setSelectedRole(value);
      // Reset role-specific fields when role changes
      setFormData(prev => ({
        ...prev,
        studentId: '',
        birthDate: '',
        sex: '',
        licenseNumber: '',
        yearsOfExperience: '',
        education: '',
        specialization: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Role-specific validation
    if (formData.role === 'patient') {
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.birthDate) newErrors.birthDate = 'Birth Date is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
      
      // Phone validation for patients
      const phoneRegex = /^\d{10,}$/;
      if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
        newErrors.phoneNumber = 'Phone number must be at least 10 digits';
      }
    }

    if (formData.role === 'doctor') {
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of Experience is required';
      if (!formData.education.trim()) newErrors.education = 'Education is required';
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      
      // Phone validation for doctors
      const phoneRegex = /^\d{10,}$/;
      if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
        newErrors.phoneNumber = 'Phone number must be at least 10 digits';
      }
      
      // Years of experience validation
      if (formData.yearsOfExperience && isNaN(formData.yearsOfExperience)) {
        newErrors.yearsOfExperience = 'Years of Experience must be a number';
      }
    }

    if (formData.role === 'admin') {
      // Admin only requires basic fields, phone is optional
      if (formData.phoneNumber) {
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
          newErrors.phoneNumber = 'Phone number must be at least 10 digits';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    await onSave(formData);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      phoneNumber: '',
      studentId: '',
      birthDate: '',
      sex: '',
      licenseNumber: '',
      yearsOfExperience: '',
      education: '',
      specialization: ''
    });
    setErrors({});
    setSelectedRole('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Add New User</h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number {formData.role === 'admin' ? '' : <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
          </div>

          {/* Patient-specific fields */}
          {formData.role === 'patient' && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-gray-900">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.studentId ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter student ID"
                  />
                  {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.birthDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sex ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
              </div>
            </div>
          )}

          {/* Doctor-specific fields */}
          {formData.role === 'doctor' && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-gray-900">Doctor Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter license number"
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter years of experience"
                    min="0"
                  />
                  {errors.yearsOfExperience && <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter education details"
                />
                {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Creating User...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ user, isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    phoneNumber: '',
    status: 'active',
    isVerified: false,
    // Patient fields
    studentId: '',
    birthDate: '',
    sex: '',
    // Doctor fields
    licenseNumber: '',
    yearsOfExperience: '',
    education: '',
    specialization: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState('');

  const specializations = [
    'Anesthesiology',
    'Bacteriological Laboratory',
    'Physical Therapy',
    'Plastic Surgery',
    'Infectious Disease Doctors',
    'Dermatologists',
    'Allergists',
    'Ophthalmologists',
    'Obstetrician/Gynecologists',
    'Cardiologists',
    'Endocrinologists',
    'Gastroenterologists',
    'Nephrologists',
    'Urologists',
    'Pulmonologists',
    'Otolaryngologists',
    'Neurologists',
    'Psychiatrists',
    'Oncologists',
    'Radiologists',
    'General Surgeons',
    'Orthopedic Surgeons',
    'Cardiac Surgeons'
  ];

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
        role: user.role || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        status: user.status || 'active',
        isVerified: user.isVerified || user.verified || false,
        // Patient fields
        studentId: user.studentId || '',
        birthDate: user.birthDate || '',
        sex: user.sex || '',
        // Doctor fields
        licenseNumber: user.licenseNumber || '',
        yearsOfExperience: user.yearsOfExperience || '',
        education: user.education || '',
        specialization: user.specialization || ''
      });
      setSelectedRole(user.role || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Handle role change
    if (name === 'role') {
      setSelectedRole(value);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common required fields
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role) newErrors.role = 'Role is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Role-specific validation
    if (formData.role === 'patient') {
      if (!formData.studentId.trim()) newErrors.studentId = 'Student ID is required';
      if (!formData.birthDate) newErrors.birthDate = 'Birth Date is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
      
      // Phone validation for patients
      const phoneRegex = /^\d{10,}$/;
      if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
        newErrors.phoneNumber = 'Phone number must be at least 10 digits';
      }
    }

    if (formData.role === 'doctor') {
      if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
      if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of Experience is required';
      if (!formData.education.trim()) newErrors.education = 'Education is required';
      if (!formData.specialization) newErrors.specialization = 'Specialization is required';
      
      // Phone validation for doctors
      const phoneRegex = /^\d{10,}$/;
      if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
        newErrors.phoneNumber = 'Phone number must be at least 10 digits';
      }
      
      // Years of experience validation
      if (formData.yearsOfExperience && isNaN(formData.yearsOfExperience)) {
        newErrors.yearsOfExperience = 'Years of Experience must be a number';
      }
    }

    if (formData.role === 'admin') {
      // Admin only requires basic fields, phone is optional
      if (formData.phoneNumber) {
        const phoneRegex = /^\d{10,}$/;
        if (!phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
          newErrors.phoneNumber = 'Phone number must be at least 10 digits';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    await onSave(formData);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="patient">Patient</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number {formData.role === 'admin' ? '' : <span className="text-red-500">*</span>}
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">Email Verified</label>
          </div>

          {/* Patient-specific fields */}
          {formData.role === 'patient' && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-gray-900">Patient Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.studentId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.studentId && <p className="text-red-500 text-xs mt-1">{errors.studentId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Birth Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.birthDate ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex <span className="text-red-500">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sex ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.sex && <p className="text-red-500 text-xs mt-1">{errors.sex}</p>}
              </div>
            </div>
          )}

          {/* Doctor-specific fields */}
          {formData.role === 'doctor' && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="font-medium text-gray-900">Doctor Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.yearsOfExperience ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                  />
                  {errors.yearsOfExperience && <p className="text-red-500 text-xs mt-1">{errors.yearsOfExperience}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.education ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization <span className="text-red-500">*</span>
                </label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Specialization</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userAPI.getAllUsers();
      console.log('Users API response:', response);
      if (response.data) {
        setUsers(response.data);
      } else {
        setError('No users data received');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Load users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search, role, and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      (user.firstName && user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName && user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phoneNumber && user.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || (user.status || 'active') === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = async (updatedData) => {
    setActionLoading(true);
    try {
      const userId = editingUser.id || editingUser.userId;
      
      // Build the correct payload structure based on role
      let payload = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        email: updatedData.email,
        role: updatedData.role,
        phoneNumber: updatedData.phoneNumber || undefined,
        status: updatedData.status,
        isVerified: updatedData.isVerified
      };

      // Add role-specific fields
      if (updatedData.role === 'doctor') {
        payload = {
          ...payload,
          licenseNumber: updatedData.licenseNumber,
          yearsOfExperience: parseInt(updatedData.yearsOfExperience) || 0,
          education: updatedData.education,
          specialization: updatedData.specialization
        };
      }

      if (updatedData.role === 'patient') {
        payload = {
          ...payload,
          studentId: updatedData.studentId,
          birthDate: updatedData.birthDate,
          sex: updatedData.sex
        };
      }

      // Remove undefined values to avoid sending them to backend
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      console.log('Updating user with payload:', payload);
      console.log('User ID:', userId);
      
      const response = await userAPI.updateUser(userId, payload);
      console.log('Update response:', response);
      
      if (response.data) {
        // Update the user in the local state
        setUsers(prevUsers => 
          prevUsers.map(user => 
            (user.id === userId || user.userId === userId) 
              ? { 
                  ...user, 
                  firstName: updatedData.firstName,
                  lastName: updatedData.lastName,
                  email: updatedData.email,
                  role: updatedData.role,
                  phoneNumber: updatedData.phoneNumber,
                  status: updatedData.status,
                  isVerified: updatedData.isVerified,
                  // Add role-specific fields
                  ...(updatedData.role === 'doctor' && {
                    licenseNumber: updatedData.licenseNumber,
                    yearsOfExperience: updatedData.yearsOfExperience,
                    education: updatedData.education,
                    specialization: updatedData.specialization
                  }),
                  ...(updatedData.role === 'patient' && {
                    studentId: updatedData.studentId,
                    birthDate: updatedData.birthDate,
                    sex: updatedData.sex
                  })
                }
              : user
          )
        );
        
        toast.success('User updated successfully');
        setShowEditModal(false);
        setEditingUser(null);
      } else {
        throw new Error('Failed to update user');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to update user';
      let errorDetails = null;
      
      // Handle different types of backend errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Check for validation details
        if (errorData.details && Array.isArray(errorData.details)) {
          errorDetails = errorData.details.join(', ');
        }
      }
      
      // Handle specific HTTP status codes
      if (err.response?.status === 500) {
        errorMessage = 'Server error: Please check the data format and try again';
      } else if (err.response?.status === 400) {
        if (!errorMessage || errorMessage === 'Failed to update user') {
          errorMessage = 'Invalid data: Please check all required fields';
        }
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (err.response?.status === 409) {
        errorMessage = 'User already exists with this email';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error with details if available
      if (errorDetails) {
        toast.error(`${errorMessage}: ${errorDetails}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const userName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.name || user.email || 'this user';
      
    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        const userId = user.id || user.userId;
        console.log('Deleting user with ID:', userId);
        
        const response = await userAPI.deleteUser(userId);
        console.log('Delete response:', response);
        
        // Remove the user from the local state
        setUsers(prevUsers => 
          prevUsers.filter(u => (u.id !== userId && u.userId !== userId))
        );
        
        toast.success('User deleted successfully');
      } catch (err) {
        console.error('Error deleting user:', err);
        console.error('Error response:', err.response);
        console.error('Error data:', err.response?.data);
        
        let errorMessage = 'Failed to delete user';
        let errorDetails = null;
        
        // Handle different types of backend errors
        if (err.response?.data) {
          const errorData = err.response.data;
          
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
          
          // Check for validation details
          if (errorData.details && Array.isArray(errorData.details)) {
            errorDetails = errorData.details.join(', ');
          }
        }
        
        // Handle specific HTTP status codes
        if (err.response?.status === 500) {
          errorMessage = 'Server error: Unable to delete user at this time';
        } else if (err.response?.status === 400) {
          if (!errorMessage || errorMessage === 'Failed to delete user') {
            errorMessage = 'Invalid data: Cannot delete user';
          }
        } else if (err.response?.status === 404) {
          errorMessage = 'User not found';
        } else if (err.response?.status === 403) {
          errorMessage = 'Permission denied: Cannot delete this user';
        } else if (err.response?.status === 409) {
          errorMessage = 'Cannot delete user: User has linked records';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        // Show error with details if available
        if (errorDetails) {
          toast.error(`${errorMessage}: ${errorDetails}`);
        } else {
          toast.error(errorMessage);
        }
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleCreateUser = async (userData) => {
    setActionLoading(true);
    try {
      // Build the correct payload structure based on role
      let payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        phoneNumber: userData.phoneNumber || undefined
      };

      // Add role-specific fields
      if (userData.role === 'doctor') {
        payload = {
          ...payload,
          licenseNumber: userData.licenseNumber,
          yearsOfExperience: parseInt(userData.yearsOfExperience) || 0,
          education: userData.education,
          specialization: userData.specialization
        };
      }

      if (userData.role === 'patient') {
        payload = {
          ...payload,
          studentId: userData.studentId,
          birthDate: userData.birthDate,
          sex: userData.sex
        };
      }

      // Remove undefined values to avoid sending them to backend
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      console.log('Creating user with payload:', payload);
      
      const response = await userAPI.createUserByAdmin(payload);
      console.log('Create user response:', response);
      
      if (response.data) {
        // Add the new user to the local state
        setUsers(prevUsers => [...prevUsers, response.data]);
        
        toast.success('User created successfully');
        setShowAddModal(false);
      } else {
        throw new Error('Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to create user';
      let errorDetails = null;
      
      // Handle different types of backend errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Check for validation details
        if (errorData.details && Array.isArray(errorData.details)) {
          errorDetails = errorData.details.join(', ');
        }
      }
      
      // Handle specific HTTP status codes
      if (err.response?.status === 500) {
        errorMessage = 'Server error: Unable to create user at this time';
      } else if (err.response?.status === 400) {
        if (!errorMessage || errorMessage === 'Failed to create user') {
          errorMessage = 'Invalid data: Please check all required fields';
        }
      } else if (err.response?.status === 409) {
        errorMessage = 'User already exists with this email';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error with details if available
      if (errorDetails) {
        toast.error(`${errorMessage}: ${errorDetails}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    setActionLoading(true);
    try {
      const newStatus = (user.status || 'active') === 'active' ? 'inactive' : 'active';
      const userId = user.id || user.userId;
      
      console.log('Toggling user status:', { userId, currentStatus: user.status, newStatus });
      
      // Use the new dedicated status toggle endpoint
      const response = await userAPI.toggleUserStatus(userId, { 
        isActive: newStatus === 'active' 
      });
      
      console.log('Status update response:', response);
      
      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          (u.id === userId || u.userId === userId) 
            ? { ...u, status: newStatus }
            : u
        )
      );
      
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to update user status';
      let errorDetails = null;
      
      // Handle different types of backend errors
      if (err.response?.data) {
        const errorData = err.response.data;
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
        
        // Check for validation details
        if (errorData.details && Array.isArray(errorData.details)) {
          errorDetails = errorData.details.join(', ');
        }
      }
      
      // Handle specific HTTP status codes
      if (err.response?.status === 500) {
        errorMessage = 'Server error: Unable to update status at this time';
      } else if (err.response?.status === 400) {
        if (!errorMessage || errorMessage === 'Failed to update user status') {
          errorMessage = 'Invalid data: Status update failed';
        }
      } else if (err.response?.status === 404) {
        errorMessage = 'User not found';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error with details if available
      if (errorDetails) {
        toast.error(`${errorMessage}: ${errorDetails}`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Users</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage all system users</p>
          </div>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="doctor">Doctor</option>
              <option value="patient">Patient</option>

            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    {searchTerm || filterRole !== 'all' || filterStatus !== 'all' 
                      ? 'No users match your filters' 
                      : 'No users found'
                    }
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id || user.userId} className="hover:bg-gray-50">
                    {/* User Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.name || user.email || 'Unknown'
                            }
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {user.role || 'Unknown'}
                      </span>
                    </td>

                    {/* Phone Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.phoneNumber || user.phone || 'Not provided'}
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (user.status || 'active') === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>

                    {/* Verified Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isVerified || user.verified
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isVerified || user.verified ? 'Yes' : 'No'}
                      </span>
                    </td>

                    {/* Joined Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString() 
                        : 'Unknown'
                      }
                    </td>

                    {/* Actions Column */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View User"
                          disabled={actionLoading}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit User"
                          disabled={actionLoading}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete User"
                          disabled={actionLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`text-sm px-2 py-1 rounded ${
                            (user.status || 'active') === 'active' 
                              ? 'text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100' 
                              : 'text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100'
                          }`}
                          title={(user.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                          disabled={actionLoading}
                        >
                          {(user.status || 'active') === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">User Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg">
                    {selectedUser.firstName && selectedUser.lastName 
                      ? `${selectedUser.firstName} ${selectedUser.lastName}` 
                      : selectedUser.name || selectedUser.email || 'Unknown'
                    }
                  </h4>
                  <p className="text-gray-600">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Role:</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize ml-2">
                    {selectedUser.role || 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                    (selectedUser.status || 'active') === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.status || 'active'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{selectedUser.phoneNumber || selectedUser.phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Verified:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                    selectedUser.isVerified || selectedUser.verified
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser.isVerified || selectedUser.verified ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Joined:</span>
                  <p className="text-gray-900">
                    {selectedUser.createdAt 
                      ? new Date(selectedUser.createdAt).toLocaleDateString() 
                      : 'Unknown'
                    }
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Last Login:</span>
                  <p className="text-gray-900">
                    {selectedUser.lastLoginAt ? 
                      new Date(selectedUser.lastLoginAt).toLocaleDateString() : 
                      'Never'
                    }
                  </p>
                </div>
              </div>
              
              {selectedUser.address && (
                <div>
                  <span className="font-medium text-gray-700">Address:</span>
                  <p className="text-gray-900 mt-1">{selectedUser.address}</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditUser(selectedUser);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      <EditUserModal
        user={editingUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        loading={actionLoading}
      />

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateUser}
        loading={actionLoading}
      />
    </div>
  );
};

export default Users;
