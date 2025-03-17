import axios from 'axios';

// Define the base API URL with fallback to local development server
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://todakureader.com/api';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for general requests
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
      // Send token in both formats to ensure compatibility
      config.headers['x-auth-token'] = token;
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

// Create a special instance with longer timeout for story generation
export const generateStoryApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for story generation
  headers: {
    'Content-Type': 'application/json'
  }
});

// Apply the same interceptors to the story generation API
generateStoryApi.interceptors.request.use(
  api.interceptors.request.handlers[0].fulfilled,
  api.interceptors.request.handlers[0].rejected
);

generateStoryApi.interceptors.response.use(
  api.interceptors.response.handlers[0].fulfilled,
  api.interceptors.response.handlers[0].rejected
);

export default api; 