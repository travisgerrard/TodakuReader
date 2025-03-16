import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import Stories from '../Stories';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Tell Jest to use the manual mock for react-router-dom
jest.mock('react-router-dom');

describe('Stories Component', () => {
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

  // Create a wrapper component to avoid router issues
  const TestWrapper = ({ children }) => (
    <ThemeProvider>
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  );

  test('calls fetchStories on component mount', async () => {
    // Mock successful API response
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
      <TestWrapper>
        <Stories />
      </TestWrapper>
    );

    // Check if API was called
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/stories'));
    });
  });

  test('handles API errors', async () => {
    // Mock failed API response
    const apiError = new Error('API Error');
    api.get.mockRejectedValueOnce(apiError);

    render(
      <TestWrapper>
        <Stories />
      </TestWrapper>
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

  test('handles empty stories array', async () => {
    // Mock empty API response
    api.get.mockResolvedValueOnce({
      data: {
        stories: [],
        pagination: {
          total: 0,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }
    });

    render(
      <TestWrapper>
        <Stories />
      </TestWrapper>
    );

    // Check if API was called
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('/stories'));
    });
  });
}); 