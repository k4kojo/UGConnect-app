import api from './api.js';

export const testBackendConnection = async () => {
  try {
    const response = await api.get('/');
    return {
      success: true,
      message: 'Backend connection successful',
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      message: 'Backend connection failed',
      error: error.message,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      }
    };
  }
};

export const testAuthEndpoint = async () => {
  try {
    // Test the health check endpoint
    const response = await api.get('/user');
    return {
      success: true,
      message: 'Auth endpoint accessible',
      data: response.data
    };
  } catch (error) {
    if (error.response?.status === 401) {
      return {
        success: true,
        message: 'Auth endpoint accessible (authentication required)',
        data: { requiresAuth: true }
      };
    }
    return {
      success: false,
      message: 'Auth endpoint test failed',
      error: error.message,
      details: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url
      }
    };
  }
};

export const runConnectionTests = async () => {
  console.log('🔍 Testing backend connection...');
  
  const connectionTest = await testBackendConnection();
  console.log('Connection test:', connectionTest);
  
  const authTest = await testAuthEndpoint();
  console.log('Auth endpoint test:', authTest);
  
  return {
    connection: connectionTest,
    auth: authTest,
    allPassed: connectionTest.success && authTest.success
  };
};
