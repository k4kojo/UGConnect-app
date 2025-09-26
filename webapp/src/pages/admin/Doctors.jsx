import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Edit,
  Eye,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  GraduationCap,
  Award,
  Clock,
  Save
} from 'lucide-react';
import { Button, TopLoadingBar, ProfileAvatar } from '../../components/ui';
import { userAPI } from '../../services/api.js';
import { dashboardService } from '../../services/dashboardService.js';

// Add Doctor Modal Component
const AddDoctorModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: '',
    yearsOfExperience: '',
    education: '',
    specialization: ''
  });

  const [errors, setErrors] = useState({});

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
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone Number is required';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License Number is required';
    if (!formData.yearsOfExperience.trim()) newErrors.yearsOfExperience = 'Years of Experience is required';
    if (!formData.education.trim()) newErrors.education = 'Education is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^\d{10,}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be at least 10 digits';
    }

    // Years of experience validation
    if (formData.yearsOfExperience && isNaN(formData.yearsOfExperience)) {
      newErrors.yearsOfExperience = 'Years of Experience must be a number';
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
      phoneNumber: '',
      licenseNumber: '',
      yearsOfExperience: '',
      education: '',
      specialization: ''
    });
    setErrors({});
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <TopLoadingBar loading={loading} />
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Add New Doctor</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Phone Number <span className="text-red-500">*</span>
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

          {/* Doctor-specific fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <span>Creating...</span>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Doctor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Doctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch doctors from backend API using centralized service
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await dashboardService.getDoctors();
      if (response.success) {
        setDoctors(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch doctors');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch doctors';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Filter doctors based on search and status
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = !searchTerm ||
      doctor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.education?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || doctor.isActive === (statusFilter === 'active');

    return matchesSearch && matchesStatus;
  });

  const handleViewDoctor = (doctor) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleEditDoctor = (doctor) => {
    navigate(`/admin/doctors/${doctor.userId}/edit`);
  };

  const handleDeleteDoctor = async (doctor) => {
    if (window.confirm(`Are you sure you want to delete Dr. ${doctor.firstName} ${doctor.lastName}? This action cannot be undone.`)) {
      setActionLoading(true);
      try {
        const response = await userAPI.deleteUser(doctor.userId);
        
        if (response.status === 200 || response.status === 204) {
          toast.success('Doctor deleted successfully');
          fetchDoctors(); // Refresh the list
        } else {
          throw new Error('Failed to delete doctor');
        }
      } catch (err) {
        console.error('Error deleting doctor:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Failed to delete doctor';
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleDoctorStatus = async (doctor) => {
    const newStatus = doctor.isActive ? false : true;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} Dr. ${doctor.firstName} ${doctor.lastName}?`)) {
      setActionLoading(true);
      try {
        const response = await userAPI.toggleUserStatus(doctor.userId, { isActive: newStatus });
        
        if (response.status === 200) {
          toast.success(`Doctor ${action}d successfully`);
          fetchDoctors(); // Refresh the list
        } else {
          throw new Error(`Failed to ${action} doctor`);
        }
      } catch (err) {
        console.error(`Error ${action}ing doctor:`, err);
        const errorMessage = err.response?.data?.error || err.message || `Failed to ${action} doctor`;
        toast.error(errorMessage);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddDoctor = () => {
    setShowAddModal(true);
  };

  const handleCreateDoctor = async (doctorData) => {
    setActionLoading(true);
    try {
      // Build the correct payload structure for doctor
      let payload = {
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        email: doctorData.email,
        role: 'doctor', // Always set role to doctor
        phoneNumber: doctorData.phoneNumber,
        licenseNumber: doctorData.licenseNumber,
        yearsOfExperience: parseInt(doctorData.yearsOfExperience) || 0,
        education: doctorData.education,
        specialization: doctorData.specialization
      };

      // Remove undefined values to avoid sending them to backend
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') {
          delete payload[key];
        }
      });

      console.log('Creating doctor with payload:', payload);
      
      const response = await userAPI.createUserByAdmin(payload);
      console.log('Create doctor response:', response);
      
      if (response.data) {
        // Add the new doctor to the local state
        setDoctors(prevDoctors => [...prevDoctors, response.data]);
        
        toast.success('Doctor created successfully');
        setShowAddModal(false);
      } else {
        throw new Error('Failed to create doctor');
      }
    } catch (err) {
      console.error('Error creating doctor:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to register doctor';
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
        errorMessage = 'Server error: Unable to register doctor at this time';
      } else if (err.response?.status === 400) {
        if (!errorMessage || errorMessage === 'Failed to register doctor') {
          errorMessage = 'Invalid data: Registration failed';
        }
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

  const handleViewDoctorProfile = async (doctor) => {
    try {
      // For now, show basic info since we don't have a detailed doctor profile API
      setSelectedDoctor(doctor);
      setShowModal(true);
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      // Show basic info if profile fetch fails
      setSelectedDoctor(doctor);
      setShowModal(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  if (loading && doctors.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-gray-600 mt-2">Manage all doctors in the system</p>
        </div>
        <Button onClick={handleAddDoctor} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Doctor</span>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search doctors by name, email, license, specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.userId}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewDoctorProfile(doctor)}
          >
            <div className="flex items-center space-x-4 mb-4">
              <ProfileAvatar
                name={`${doctor.firstName} ${doctor.lastName}`}
                src={doctor.profilePicture}
                size="lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-gray-600 text-sm">{doctor.email}</p>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getStatusColor(doctor.isActive)}`}>
                  {getStatusText(doctor.isActive)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{doctor.phoneNumber || 'No phone'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Award className="w-4 h-4" />
                <span>License: {doctor.licenseNumber || 'Not provided'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Experience: {doctor.yearsOfExperience || 0} years</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <GraduationCap className="w-4 h-4" />
                <span>Education: {doctor.education || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>Specialization: {doctor.specialization || 'Not specified'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined: {formatDate(doctor.createdAt)}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDoctorProfile(doctor);
                }}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                disabled={actionLoading}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditDoctor(doctor);
                }}
                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                disabled={actionLoading}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleDoctorStatus(doctor);
                }}
                className={`p-2 rounded-md transition-colors ${
                  doctor.isActive 
                    ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' 
                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                }`}
                disabled={actionLoading}
                title={doctor.isActive ? 'Deactivate' : 'Activate'}
              >
                {doctor.isActive ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDoctor(doctor);
                }}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                disabled={actionLoading}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'No doctors have been added to the system yet.'
            }
          </p>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Doctor Details</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <ProfileAvatar 
                  name={`${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                  src={selectedDoctor.profilePicture}
                  size="lg"
                />
                <div>
                  <h4 className="font-semibold text-xl">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h4>
                  <p className="text-gray-600">{selectedDoctor.email}</p>
                  <p className="text-gray-600">{selectedDoctor.phoneNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">License Number:</span>
                    <p className="text-gray-900">{selectedDoctor.licenseNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Years of Experience:</span>
                    <p className="text-gray-900">
                      {selectedDoctor.yearsOfExperience ? `${selectedDoctor.yearsOfExperience} years` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Education:</span>
                    <p className="text-gray-900">{selectedDoctor.education || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Specialization:</span>
                    <p className="text-gray-900">{selectedDoctor.specialization || 'Not specified'}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDoctor.isActive)}`}>
                        {getStatusText(selectedDoctor.isActive)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Joined:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedDoctor.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <p className="text-gray-900">
                      {formatDate(selectedDoctor.updatedAt || selectedDoctor.createdAt)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">User ID:</span>
                    <p className="text-gray-900">{selectedDoctor.userId}</p>
                  </div>
                </div>
              </div>
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
                  handleToggleDoctorStatus(selectedDoctor);
                }}
                className={`px-4 py-2 rounded-md ${
                  selectedDoctor.isActive 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {selectedDoctor.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  handleEditDoctor(selectedDoctor);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Edit Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateDoctor}
        loading={actionLoading}
      />
    </div>
  );
};

export default Doctors;
