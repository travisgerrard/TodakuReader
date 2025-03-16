import axios from 'axios';

// Define the base API URL with fallback to local development server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  config => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`[API] ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  error => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    // Any status code within the range of 2xx causes this function to trigger
    return response;
  },
  error => {
    // Any status codes outside the range of 2xx cause this function to trigger
    console.error('[API] Response error:', error);
    
    // Handle network errors
    if (!error.response) {
      console.error('[API] Network error - no response received');
    }
    
    // Handle different error status codes
    if (error.response) {
      const { status } = error.response;
      
      // Authentication errors (401, 403)
      if (status === 401 || status === 403) {
        console.error('[API] Authentication error - token may be invalid or expired');
      }
      
      // Server errors (500+)
      if (status >= 500) {
        console.error('[API] Server error:', error.response.data);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 