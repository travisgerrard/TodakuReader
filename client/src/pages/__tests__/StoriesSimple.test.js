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
  secondary: '#6FCF97',
  background: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#333333',
  textSecondary: '#666666',
  error: '#EB5757',
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  success: '#27AE60',
  warning: '#F2C94C',
  furigana: '#888888',
  primaryLight: '#E6F0FF',
  secondaryLight: '#E6F7EF'
};

describe('Stories Component Simple Tests', () => {
  // Setup auth context mock
  const mockAuthContext = {
    isAuthenticated: false,
    isLoading: false,
    user: null
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock API response
    api.get.mockResolvedValue({
      data: {
        stories: [
          {
            id: 1,
            title_jp: 'テスト',
            title_en: 'Test',
            content_jp: 'これはテストです。',
            content_en: 'This is a test.',
            tadoku_level: 1
          }
        ],
        pagination: {
          total: 1,
          limit: 10,
          offset: 0
        }
      }
    });
    
    // Mock getMockStoriesData
    getMockStoriesData.mockResolvedValue({
      stories: [
        {
          id: 'mock-1',
          title_jp: 'モックデータ',
          title_en: 'Mock Data',
          content_jp: 'これはモックデータです。',
          content_en: 'This is mock data.',
          tadoku_level: 1
        }
      ],
      pagination: {
        total: 1,
        limit: 10,
        offset: 0
      }
    });
  });
  
  test('renders without crashing', async () => {
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
      expect(screen.getByText('Welcome to Todaku Reader!')).toBeInTheDocument();
    });
    
    // Check for the filter section
    await waitFor(() => {
      expect(screen.getByText('Filter Stories')).toBeInTheDocument();
    });
  });
}); 