import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import Stories from '../Stories';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Simple mock for react-router-dom Link component
jest.mock('react-router-dom', () => ({
  Link: ({ children, ...props }) => <a data-testid="mock-link" {...props}>{children}</a>
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
      <ThemeProvider theme={theme}>
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
      <ThemeProvider theme={theme}>
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

  test('filters stories by Tadoku level', async () => {
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
            level: 'N5',
            wanikani_max_level: 15,
            genki_max_chapter: 8,
            topic: 'Test Topic',
            upvotes: 5
          },
          {
            id: 2,
            title_jp: 'タイトル2',
            title_en: 'Title 2',
            content_jp: 'タイトル2\n\n日本語のストーリー2',
            content_en: 'Title 2\n\nEnglish story content 2',
            level: 'N4',
            wanikani_max_level: 15,
            genki_max_chapter: 8,
            topic: 'Test Topic',
            upvotes: 5
          }
        ],
        pagination: {
          total: 2,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }
    });

    render(
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={mockAuthContext}>
          <Stories />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    // Change Tadoku Level filter
    const levelSelect = screen.getByLabelText('Level');
    fireEvent.change(levelSelect, { target: { value: 'N5' } });

    // Mock the filtered API response
    api.get.mockResolvedValueOnce({
      data: {
        stories: [
          {
            id: 1,
            title_jp: 'タイトル1',
            title_en: 'Title 1',
            content_jp: 'タイトル1\n\n日本語のストーリー1',
            content_en: 'Title 1\n\nEnglish story content 1',
            level: 'N5',
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

    // Click the Apply Filters button
    const applyButton = screen.getByText('Apply Filters');
    fireEvent.click(applyButton);

    // Wait for filtered stories to check presence and absence
    await waitFor(() => {
      expect(screen.getByText('タイトル1')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.queryByText('タイトル2')).not.toBeInTheDocument();
    });
  });

  // Test for empty results
  test('should display no results message when no stories match filters', async () => {
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
      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={mockAuthContext}>
          <Stories />
        </AuthContext.Provider>
      </ThemeProvider>
    );

    // Check for no results message
    expect(await screen.findByText('No stories found matching your criteria.')).toBeInTheDocument();
  });
}); 