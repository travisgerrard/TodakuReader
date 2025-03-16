import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import Stories from '../Stories';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Simple mock for react-router-dom Link component
jest.mock('react-router-dom', () => ({
  Link: ({ children, ...props }) => <a data-testid="mock-link" {...props}>{children}</a>
}));

describe('Stories Component Core Functionality', () => {
  // Setup auth context mock
  const mockAuthContext = {
    isAuthenticated: false,
    isLoading: false,
    user: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.error
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.error
    console.error.mockRestore();
  });

  test('calls API when component mounts', async () => {
    // Set up successful response
    api.get.mockResolvedValueOnce({
      data: {
        stories: [
          {
            id: 1,
            title_jp: 'タイトル1',
            title_en: 'Title 1',
            content_jp: 'タイトル1\n\n日本語のストーリー1',
            content_en: 'Title 1\n\nEnglish story content 1',
            tadoku_level: 2,
            wanikani_max_level: 15,
            genki_max_chapter: 8,
            topic: 'Test Topic',
            upvotes: 5
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

    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <Stories />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    // Check if API was called - this confirms useEffect is working
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/stories'));
    });
  });

  // Test API error handling
  test('handles API errors', async () => {
    // Mock failed API response
    const apiError = new Error('API Error');
    api.get.mockRejectedValueOnce(apiError);

    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <Stories />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    // Check if API was called
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/stories'));
    });

    // Check if error was logged to console
    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });
  });
}); 