import api from './api.js';

/**
 * Enhanced Profile Picture Service with comprehensive error handling,
 * progress tracking, and better user experience
 */

// Supported image formats and their MIME types
const SUPPORTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp']
};

// Configuration constants
const CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_TYPES: Object.keys(SUPPORTED_FORMATS),
  UPLOAD_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000 // 1 second
};

/**
 * Validate image file before upload
 */
const validateImageFile = (file) => {
  const errors = [];

  // Check if file exists
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }

  // Check file type
  if (!CONFIG.SUPPORTED_TYPES.includes(file.type)) {
    const supportedExtensions = Object.values(SUPPORTED_FORMATS).flat().join(', ');
    errors.push(`Unsupported file type. Please use: ${supportedExtensions}`);
  }

  // Check file size
  if (file.size > CONFIG.MAX_FILE_SIZE) {
    const sizeMB = (CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
    errors.push(`File size must be less than ${sizeMB}MB`);
  }

  // Check if file is actually an image (additional validation)
  if (file.type.startsWith('image/') && file.size === 0) {
    errors.push('Selected file appears to be corrupted');
  }

  return {
    isValid: errors.length === 0,
    errors,
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: (file.size / (1024 * 1024)).toFixed(2)
    }
  };
};

/**
 * Create optimized FormData for upload
 */
const createUploadFormData = (file, userId) => {
  const formData = new FormData();
  
  // Generate unique filename to prevent caching issues
  const timestamp = Date.now();
  const extension = file.name.split('.').pop() || 'jpg';
  const uniqueName = `profile_${userId}_${timestamp}.${extension}`;
  
  // Append file with metadata
  formData.append('profilePicture', file, uniqueName);
  formData.append('userId', userId);
  formData.append('uploadTimestamp', timestamp.toString());
  
  return formData;
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Upload with retry logic
 */
const uploadWithRetry = async (formData, options = {}) => {
  const { maxRetries = CONFIG.RETRY_ATTEMPTS, retryDelay = CONFIG.RETRY_DELAY } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Upload attempt ${attempt}/${maxRetries}`);
      
      const response = await api.post('/user/profile-picture/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: CONFIG.UPLOAD_TIMEOUT,
        // Add progress tracking if supported
        onUploadProgress: options.onProgress
      });

      console.log(`Upload successful on attempt ${attempt}`);
      return response;
      
    } catch (error) {
      console.error(`Upload attempt ${attempt} failed:`, error.message);
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      await sleep(retryDelay * attempt); // Exponential backoff
    }
  }
};

/**
 * Process upload response and extract profile picture data
 */
const processUploadResponse = (response, userId) => {
  console.log('Processing upload response:', response.data);

  // Validate response structure
  if (!response.data) {
    throw new Error('Empty response from server');
  }

  const { user, message } = response.data;

  if (!user) {
    throw new Error('User data missing from response');
  }

  // Extract profile picture URL
  let profilePictureUrl = null;
  
  if (user.profilePicture) {
    // Check if it's already a data URI
    if (user.profilePicture.startsWith('data:image/')) {
      profilePictureUrl = user.profilePicture;
    } else {
      // Fallback to endpoint URL
      profilePictureUrl = `/api/v0/user/profile-picture/${userId}?t=${Date.now()}`;
    }
  }

  return {
    success: true,
    user: user,
    profilePictureUrl: profilePictureUrl,
    message: message || 'Profile picture updated successfully',
    uploadTimestamp: Date.now()
  };
};

/**
 * Main upload function with comprehensive error handling
 */
export const uploadProfilePicture = async (file, userId, options = {}) => {
  const startTime = Date.now();
  
  try {
    console.log('=== Profile Picture Upload Started ===');
    console.log('User ID:', userId);
    console.log('File:', file?.name, `(${(file?.size / 1024 / 1024).toFixed(2)}MB)`);

    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.errors.join('. '));
    }

    console.log('File validation passed:', validation.fileInfo);

    // Create FormData
    const formData = createUploadFormData(file, userId);

    // Upload with retry logic
    const response = await uploadWithRetry(formData, {
      maxRetries: options.maxRetries || CONFIG.RETRY_ATTEMPTS,
      retryDelay: options.retryDelay || CONFIG.RETRY_DELAY,
      onProgress: options.onProgress
    });

    // Process response
    const result = processUploadResponse(response, userId);

    const duration = Date.now() - startTime;
    console.log(`=== Upload Completed Successfully in ${duration}ms ===`);

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`=== Upload Failed after ${duration}ms ===`);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });

    // Create user-friendly error message
    let userMessage = 'Failed to upload profile picture';
    
    if (error.response?.status === 413) {
      userMessage = 'File is too large. Please choose a smaller image.';
    } else if (error.response?.status === 415) {
      userMessage = 'Unsupported file type. Please use JPG, PNG, GIF, or WebP.';
    } else if (error.response?.status >= 500) {
      userMessage = 'Server error. Please try again later.';
    } else if (error.message.includes('timeout')) {
      userMessage = 'Upload timed out. Please check your connection and try again.';
    } else if (error.response?.data?.error) {
      userMessage = error.response.data.error;
    } else if (error.message) {
      userMessage = error.message;
    }

    throw new Error(userMessage);
  }
};

/**
 * Get profile picture URL with cache busting
 */
export const getProfilePictureUrl = (userId, bustCache = false) => {
  if (!userId) return null;
  
  const baseUrl = `/api/v0/user/profile-picture/${userId}`;
  return bustCache ? `${baseUrl}?t=${Date.now()}` : baseUrl;
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (userId) => {
  try {
    console.log('Deleting profile picture for user:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    const response = await api.delete(`/user/profile-picture/${userId}`);
    
    console.log('Profile picture deleted successfully');
    return {
      success: true,
      message: 'Profile picture deleted successfully'
    };
    
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Failed to delete profile picture';
    
    throw new Error(errorMessage);
  }
};

/**
 * Utility function to convert file to base64 (for preview)
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Utility function to compress image (optional enhancement)
 */
export const compressImage = async (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, file.type, quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};
