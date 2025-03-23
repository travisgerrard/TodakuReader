import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

// Create auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({
    logs: [],
    googleClientId: process.env.REACT_APP_GOOGLE_CLIENT_ID
  });

  // Helper function for debugging
  const logDebug = (message, data) => {
    console.log(`[AuthContext Debug] ${message}`, data || '');
    setDebug(prev => ({
      ...prev,
      logs: [...prev.logs, { timestamp: new Date().toISOString(), message, data }]
    }));
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Check for token in localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        logDebug('No token found in localStorage');
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if token is expired
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token expired
          logDebug('Token expired, removing from localStorage');
          localStorage.removeItem('token');
          setIsLoading(false);
          return;
        }
        
        // Load user data
        await loadUser();
        logDebug('User authenticated from stored token');
      } catch (err) {
        // Clear token on error
        logDebug('Error in initial auth check', err.message);
        localStorage.removeItem('token');
        setError('Authentication error. Please log in again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Login with Google
  const loginWithGoogle = async (googleToken) => {
    setIsLoading(true);
    setError(null);
    logDebug('Logging in with Google token', { tokenLength: googleToken.length });
    
    try {
      const res = await api.post('/auth/google', { tokenId: googleToken });
      logDebug('Login response received', { status: res.status });
      
      localStorage.setItem('token', res.data.token);
      await loadUser();
      return res.data;
    } catch (err) {
      logDebug('Login error', err.response?.data || err.message);
      const errorMessage = err.response?.data?.msg || 'Failed to log in with Google. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['x-auth-token'];
    setUser(null);
    setIsAuthenticated(false);
    logDebug('User logged out');
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    setError(null);
    logDebug('Updating profile', profileData);
    
    try {
      const res = await api.put('/profile', profileData);
      logDebug('Profile updated', res.data);
      
      setUser({
        ...user,
        ...res.data
      });
      
      return res.data;
    } catch (err) {
      logDebug('Profile update error', err.response?.data || err.message);
      const errorMessage = err.response?.data?.msg || 'Failed to update profile. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Load user data
  const loadUser = async () => {
    logDebug('Loading user data');
    const token = localStorage.getItem('token');
    
    if (!token) {
      logDebug('No token found');
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await api.get('/auth/user');
      logDebug('User data loaded', res.data);
      
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      logDebug('Error loading user', err.response?.data || err.message);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      if (err.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        debug,
        loginWithGoogle,
        logout,
        updateProfile,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 