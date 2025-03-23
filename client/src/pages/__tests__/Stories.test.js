import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ThemeProvider } from 'styled-components';
import Stories from '../../pages/Stories';
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

describe('Stories Component', () => {
  // Setup auth context mock
  const mockAuthContext = {
    isAuthenticated: false,
    isLoading: false,
    user: null
  };
  
  const authenticatedAuthContext = {
    isAuthenticated: true,
    isLoading: false,
    user: { wanikani_level: 10, genki_chapter: 5 }
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
  const renderComponent = (authContext = mockAuthContext) => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <AuthContext.Provider value={authContext}>
            <Stories />
          </AuthContext.Provider>
        </MemoryRouter>
      </ThemeProvider>
    );
  };

  // Default sample stories
  const sampleStories = [
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
  ];

  // Test for non-authenticated users seeing stories
  test('should display stories for non-authenticated users', async () => {
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

    renderComponent();

    // Check for welcome message for non-authenticated users
    expect(await screen.findByText('Welcome to Stories!')).toBeInTheDocument();
    expect(screen.getByText('Sign in to create and manage your own stories.')).toBeInTheDocument();

    // Verify stories are loaded - split assertions
    await waitFor(() => {
      expect(screen.getByText('タイトル1')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Title 1')).toBeInTheDocument();
    });

    // Ensure Create Story button is not present
    expect(screen.queryByText('Create a New Story')).not.toBeInTheDocument();
  });

  // Test fallback for non-authenticated users when API fails
  test('should display fallback stories when API fails for non-authenticated users', async () => {
    // Mock API failure
    api.get.mockRejectedValueOnce(new Error('Network error'));

    // Mock successful fallback response
    getMockStoriesData.mockResolvedValueOnce({
      stories: [
        {
          id: 'mock-1',
          title_jp: '私の猫',
          title_en: 'My Cat',
          content_jp: '私の猫\n\n猫の内容',
          content_en: 'My Cat\n\nCat content',
          level: 'N1',
          wanikani_max_level: 10,
          genki_max_chapter: 5,
          topic: 'Daily Life',
          upvotes: 42
        }
      ],
      pagination: {
        total: 1,
        limit: 10,
        offset: 0,
        hasMore: false
      }
    });

    renderComponent();

    // Check for fallback message
    expect(await screen.findByText('Using Sample Stories')).toBeInTheDocument();

    // Verify fallback stories are loaded - split assertions
    await waitFor(() => {
      expect(screen.getByText('私の猫')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('My Cat')).toBeInTheDocument();
    });

    // Try Again button should be present
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  // Test authenticated users can see stories and create new ones
  test('should allow authenticated users to create new stories', async () => {
    // Mock successful API response
    api.get.mockResolvedValueOnce({
      data: {
        stories: sampleStories,
        pagination: {
          total: sampleStories.length,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }
    });

    renderComponent(authenticatedAuthContext);

    // Check for Create Story button
    expect(await screen.findByText('Create a New Story')).toBeInTheDocument();

    // Verify stories are loaded - split assertions
    await waitFor(() => {
      expect(screen.getByText('タイトル1')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('Title 1')).toBeInTheDocument();
    });
  });

  // Test filter functionality
  test('should filter stories correctly', async () => {
    // Mock initial API response
    api.get.mockResolvedValueOnce({
      data: {
        stories: sampleStories,
        pagination: {
          total: sampleStories.length,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }
    });

    // Mock filtered API response
    api.get.mockResolvedValueOnce({
      data: {
        stories: [sampleStories[0]], // Only first story matches filter
        pagination: {
          total: 1,
          limit: 10,
          offset: 0,
          hasMore: false
        }
      }
    });

    renderComponent();

    // Wait for initial stories to load - split assertions
    await waitFor(() => {
      expect(screen.getByText('タイトル1')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('タイトル2')).toBeInTheDocument();
    });

    // Change Level filter
    const levelSelect = screen.getByLabelText('Level');
    fireEvent.change(levelSelect, { target: { value: 'N5' } });

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

    renderComponent();

    // Check for no results message
    expect(await screen.findByText('No stories found matching your criteria.')).toBeInTheDocument();
    
    // Non-authenticated message should show login option
    expect(screen.getByText('Sign in to create and manage your own stories')).toBeInTheDocument();
  });
}); 