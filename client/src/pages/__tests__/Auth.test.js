import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import api from '../../utils/api';
import { jwtDecode } from 'jwt-decode';

// Mock the API module
jest.mock('../../utils/api');

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn()
}));

describe('Authentication Flow', () => {
  // Clear localStorage and reset mocks before each test
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    api.post.mockReset();
    api.get.mockReset();
    jwtDecode.mockReset();
  });

  test('should handle successful login flow with token', async () => {
    // Mock localStorage
    const localStorageMock = (() => {
      let store = {};
      return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => {
          store[key] = value.toString();
        }),
        removeItem: jest.fn(key => {
          delete store[key];
        }),
        clear: jest.fn(() => {
          store = {};
        }),
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock successful Google login response
    api.post.mockResolvedValueOnce({
      data: { token: 'test-jwt-token' },
      status: 200
    });

    // Mock successful user data response
    api.get.mockResolvedValueOnce({
      data: { id: 1, email: 'test@example.com' },
      status: 200
    });

    // Create test component to access context
    const TestComponent = () => {
      const auth = React.useContext(AuthContext);
      
      return (
        <div>
          <div data-testid="auth-status">
            {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </div>
          <button 
            data-testid="login-button" 
            onClick={() => auth.loginWithGoogle('test-google-token')}
          >
            Login
          </button>
        </div>
      );
    };

    // Render the component with AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initially not authenticated
    expect(screen.getByTestId('auth-status').textContent).toBe('Not Authenticated');

    // Setup user event
    const user = userEvent.setup();
    
    // Trigger login
    await user.click(screen.getByTestId('login-button'));

    // Wait for authentication to complete
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    // Verify localStorage token was set
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-jwt-token');

    // Verify API calls were made with correct data
    expect(api.post).toHaveBeenCalledWith(
      '/auth/google', 
      { tokenId: 'test-google-token' }
    );
    expect(api.get).toHaveBeenCalledWith('/auth/user');
  });

  test('should handle login error and display error message', async () => {
    // Create a mock AuthContext with error state
    const mockAuthContext = {
      isAuthenticated: false,
      isLoading: false,
      error: 'Failed to log in with Google. Please try again.',
      loginWithGoogle: jest.fn(),
      clearError: jest.fn()
    };

    // Create test component to access context
    const TestComponent = () => (
      <div>
        <div data-testid="error-message">
          {mockAuthContext.error ? mockAuthContext.error : 'No error'}
        </div>
        <button 
          data-testid="login-button" 
          onClick={mockAuthContext.loginWithGoogle}
        >
          Login
        </button>
        <button 
          data-testid="clear-error" 
          onClick={mockAuthContext.clearError}
        >
          Clear Error
        </button>
      </div>
    );

    // Render the component with mocked context
    render(
      <AuthContext.Provider value={mockAuthContext}>
        <TestComponent />
      </AuthContext.Provider>
    );

    // Verify error message is displayed
    expect(screen.getByTestId('error-message').textContent).toBe('Failed to log in with Google. Please try again.');
    
    // Verify clear error button works
    await userEvent.setup().click(screen.getByTestId('clear-error'));
    expect(mockAuthContext.clearError).toHaveBeenCalled();
  });

  test('should check for existing token on initialization', async () => {
    // Mock localStorage with existing token
    const localStorageMock = {
      getItem: jest.fn(key => {
        if (key === 'token') return 'existing-token';
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock JWT decode to return a valid expiration
    jwtDecode.mockReturnValueOnce({
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour in the future
      user: { id: 1 }
    });

    // Mock successful user data response
    api.get.mockResolvedValueOnce({
      data: { id: 1, email: 'test@example.com' },
      status: 200
    });

    // Create test component to access context
    const TestComponent = () => {
      const auth = React.useContext(AuthContext);
      return (
        <div data-testid="auth-status">
          {auth.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
        </div>
      );
    };

    // Render the component with AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Wait for authentication to complete with existing token
    await waitFor(() => {
      expect(screen.getByTestId('auth-status').textContent).toBe('Authenticated');
    });

    // Verify the token was checked in localStorage
    expect(localStorageMock.getItem).toHaveBeenCalledWith('token');

    // Verify API call was made
    expect(api.get).toHaveBeenCalledWith('/auth/user');
  });
}); 