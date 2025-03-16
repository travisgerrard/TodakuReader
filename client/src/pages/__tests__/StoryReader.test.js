import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import StoryReader from '../StoryReader';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Mock navigate
const mockNavigate = jest.fn();
// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Routes: ({ children }) => <div data-testid="mock-routes">{children}</div>,
  Route: ({ children }) => <div data-testid="mock-route">{children}</div>,
  Link: ({ children, to, ...props }) => <a href={to} {...props} data-testid="mock-link">{children}</a>,
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: '1' })
}));

describe('StoryReader Component', () => {
  // Setup auth context mock
  const mockAuthContext = {
    isAuthenticated: true,
    isLoading: false
  };

  // Test data with separate title and content fields
  const mockStoryWithSeparateFields = {
    id: 1,
    title_jp: 'タイトル',
    title_en: 'Title',
    storyJP: '日本語のストーリー',
    storyEN: 'English story content',
    content_jp: 'タイトル\n\n日本語のストーリー',
    content_en: 'Title\n\nEnglish story content',
    tadoku_level: 2,
    wanikani_max_level: 15,
    genki_max_chapter: 8,
    topic: 'Test Topic',
    upvotes: 5,
    vocabulary: [],
    grammar: []
  };

  // Test data without separate fields (old format)
  const mockStoryOldFormat = {
    id: 1,
    content_jp: 'タイトル\n\n日本語のストーリー',
    content_en: 'Title\n\nEnglish story content',
    tadoku_level: 2,
    wanikani_max_level: 15,
    genki_max_chapter: 8,
    topic: 'Test Topic',
    upvotes: 5,
    vocabulary: [],
    grammar: []
  };

  // Test for story without newlines (broken format)
  const mockStoryBrokenFormat = {
    id: 1,
    content_jp: '朝(あさ)、犬(いぬ)と公園(こうえん)へ行(い)きます。天気(てんき)はよくて、気持(きも)ちがいいです。犬(いぬ)は元気(げんき)で、早(はや)く走(はし)ります。私は犬(いぬ)と遊(あそ)んで、楽(たの)しいです。',
    content_en: 'In the morning, I go to the park with my dog. The weather is nice and I feel good. The dog is energetic and runs quickly. I play with the dog and enjoy it.',
    tadoku_level: 1,
    wanikani_max_level: 13,
    genki_max_chapter: 6,
    topic: 'Dog Walk',
    upvotes: 0,
    vocabulary: [],
    grammar: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders story with separate title and content fields correctly', async () => {
    api.get.mockResolvedValue({ data: mockStoryWithSeparateFields });
    api.post.mockResolvedValue({});
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <StoryReader />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      // Check if API was called
      expect(api.get).toHaveBeenCalledWith('/stories/1');
    });
    
    // Check for title
    await waitFor(() => {
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toHaveTextContent('タイトル');
    });
    
    // Check for Japanese content
    await waitFor(() => {
      expect(screen.getByText('日本語のストーリー')).toBeInTheDocument();
    });
    
    // Check for English content
    await waitFor(() => {
      expect(screen.getByText('English story content')).toBeInTheDocument();
    });
  });

  test('renders story with old format correctly', async () => {
    api.get.mockResolvedValue({ data: mockStoryOldFormat });
    api.post.mockResolvedValue({});
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <StoryReader />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      // Check if API was called
      expect(api.get).toHaveBeenCalledWith('/stories/1');
    });
    
    // Check for title
    await waitFor(() => {
      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toHaveTextContent('タイトル');
    });
    
    // Check for Japanese content
    await waitFor(() => {
      expect(screen.getByText('日本語のストーリー')).toBeInTheDocument();
    });
    
    // Check for English content
    await waitFor(() => {
      expect(screen.getByText('English story content')).toBeInTheDocument();
    });
  });

  test('handles story with broken format (no newlines)', async () => {
    api.get.mockResolvedValue({ data: mockStoryBrokenFormat });
    api.post.mockResolvedValue({});
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <StoryReader />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    await waitFor(() => {
      // Check if API was called
      expect(api.get).toHaveBeenCalledWith('/stories/1');
    });
    
    // Check for Japanese content
    await waitFor(() => {
      const japaneseElements = screen.queryAllByText(/朝.*公園/);
      expect(japaneseElements.length).toBeGreaterThan(0);
    });
    
    // Check for English content
    await waitFor(() => {
      const englishElements = screen.queryAllByText(/In the morning, I go to the park/);
      expect(englishElements.length).toBeGreaterThan(0);
    });
  });
}); 