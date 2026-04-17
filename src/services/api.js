import axios from 'axios';

// Configure base URL for API calls
const API_BASE_URL = process.env.REACT_APP_API_URL || (
  process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for file uploads
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API endpoints
export const healthCheck = () => {
  return api.get('/health');
};

export const getTemplates = () => {
  return api.get('/templates');
};

export const scanOMR = (formData) => {
  return api.post('/scan', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const exportResults = (scanId, format) => {
  return api.get(`/export/${scanId}/${format}`, {
    responseType: 'blob',
  });
};

export const getScanHistory = () => {
  return api.get('/history');
};

// Utility function to check API health
export const checkAPIHealth = async () => {
  try {
    const response = await healthCheck();
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api;