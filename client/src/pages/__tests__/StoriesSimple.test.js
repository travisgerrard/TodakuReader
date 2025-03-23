import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import Stories from '../Stories';
import api from '../../utils/api';
import { getMockStoriesData } from '../../utils/mockData';

// Mock the API module
jest.mock('../../utils/api');

// Mock the mockData module to avoid actual timeouts
jest.mock('../../utils/mockData', () => ({
  getMockStoriesData: jest.fn()
}));

// Define a simple theme for testing
const theme = {
  primary: '#4A90E2',
  secondary: '#4CAF50',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#DDDDDD',
  shadow: 'rgba(0, 0, 0, 0.1)',
  primaryLight: '#E3F2FD'
};

// Mock auth context
const mockAuthContext = {
  isAuthenticated: false,
  user: null,
  loading: false
};

describe('Stories Component Simple Tests', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock the API calls
    api.get.mockResolvedValue({
      data: {
        stories: [
          {
            id: 1,
            title_jp: 'Test Story',
            title_en: 'Test Story',
            content_jp: 'Test content',
            content_en: 'Test content',
            level: 'N5',
            type: 'public'
          }
        ],
        pagination: {
          total: 1,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }
    });

    // Mock the getMockStoriesData function
    getMockStoriesData.mockResolvedValue({
      stories: [
        {
          id: 1,
          title_jp: 'Test Story',
          title_en: 'Test Story',
          content_jp: 'Test content',
          content_en: 'Test content',
          level: 'N5',
          type: 'public'
        }
      ],
      pagination: {
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false
      }
    });
  });

  it('renders without crashing', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={mockAuthContext}>
            <Stories />
          </AuthContext.Provider>
        </ThemeProvider>
      </MemoryRouter>
    );
    
    // Wait for the welcome message which is specific to non-authenticated users
    await waitFor(() => {
      expect(screen.getByText('Welcome to Stories!')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Sign in to create and manage your own stories.')).toBeInTheDocument();
    });
    
    // Check for the filter section
    await waitFor(() => {
      expect(screen.getByText('Filter Stories')).toBeInTheDocument();
    });
  });
}); 