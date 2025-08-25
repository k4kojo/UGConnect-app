import api from './api.js';

export const uploadProfilePicture = async (file, userId) => {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('profilePicture', file);

    // Upload to backend
    const response = await api.post('/user/profile-picture/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data) {
      // Return the URL to fetch the image from backend
      return `/api/v0/user/profile-picture/${userId}`;
    } else {
      throw new Error('Failed to upload profile picture');
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
};

export const getProfilePictureUrl = (userId) => {
  return `/api/v0/user/profile-picture/${userId}`;
};

export const deleteProfilePicture = async (userId) => {
  try {
    // For database storage, we'll update the profile picture to null
    const response = await api.put(`/user/${userId}`, {
      profilePicture: null,
      profilePictureType: null,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw new Error('Failed to delete profile picture');
  }
};
