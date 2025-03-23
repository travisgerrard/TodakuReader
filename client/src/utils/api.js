import axios from 'axios';

// Define the base API URL based on environment
const isDevelopment = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDevelopment ? process.env.REACT_APP_API_URL : 'https://todakureader.com/api';

console.log('[API] Configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- Base URL:', API_BASE_URL);

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for general requests
  headers: {
    'Content-Type': 'application/json'
  }
});

// Define reusable request interceptor function
const requestInterceptor = config => {
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
};

const requestErrorHandler = error => {
  console.error('[API] Request error:', error);
  return Promise.reject(error);
};

const responseSuccessHandler = response => {
  return response;
};

const responseErrorHandler = error => {
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
};

// Apply interceptors to main api instance
api.interceptors.request.use(requestInterceptor, requestErrorHandler);
api.interceptors.response.use(responseSuccessHandler, responseErrorHandler);

// Create a special instance with longer timeout for story generation
export const generateStoryApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for story generation
  headers: {
    'Content-Type': 'application/json'
  }
});

// Apply the same interceptors to the story generation API
generateStoryApi.interceptors.request.use(requestInterceptor, requestErrorHandler);
generateStoryApi.interceptors.response.use(responseSuccessHandler, responseErrorHandler);

export default api; 