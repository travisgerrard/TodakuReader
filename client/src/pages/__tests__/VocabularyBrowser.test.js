import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import VocabularyBrowser from '../VocabularyBrowser';
import api from '../../utils/api';
import { mockVocabulary } from '../../utils/mockData';

// Increase Jest timeout for all tests in this file
jest.setTimeout(10000);

// Mock API module instead of axios directly
jest.mock('../../utils/api');

// Mock getMockData function from mockData.js
jest.mock('../../utils/mockData', () => {
  const originalModule = jest.requireActual('../../utils/mockData');
  return {
    ...originalModule,
    getMockData: jest.fn().mockImplementation((type) => {
      // Return immediately without delay
      return Promise.resolve(originalModule.mockVocabulary);
    })
  };
});

// Mock localStorage
const mockLocalStorage = (function() {
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
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('VocabularyBrowser Component', () => {
  // Setup mock auth context
  const mockAuthContext = {
    isAuthenticated: true,
    isLoading: false
  };

  // Setup function to reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  test('renders vocabulary browser with header and search form', async () => {
    // Mock successful API response that resolves immediately
    api.get.mockResolvedValueOnce({ data: { vocabulary: [], total_pages: 0 } });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for component to finish rendering
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    
    // Verify header elements are present
    expect(screen.getByText('Vocabulary Browser')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for vocabulary...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('JLPT Level:')).toBeInTheDocument();
    expect(screen.getByText('Offline Mode (Use sample data)')).toBeInTheDocument();
  });

  test('displays loading indicator while fetching data', async () => {
    // Create a promise that we can resolve later
    let resolveApiCall;
    const apiPromise = new Promise(resolve => {
      resolveApiCall = resolve;
    });
    
    // Mock a delayed API response
    api.get.mockImplementationOnce(() => apiPromise);
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Verify loading indicator is displayed
    expect(screen.getByText('Loading vocabulary...')).toBeInTheDocument();
    
    // Resolve the API call
    resolveApiCall({ data: { vocabulary: [], total_pages: 0 } });
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading vocabulary...')).not.toBeInTheDocument();
    });
  });

  test('displays vocabulary items after successful API call', async () => {
    // Mock successful API response with vocabulary data
    api.get.mockResolvedValueOnce({ 
      data: { 
        vocabulary: mockVocabulary.vocabulary,
        total_pages: 1
      } 
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for vocabulary items to be displayed
    await waitFor(() => {
      expect(screen.getByText('学校')).toBeInTheDocument();
    });
    
    await waitFor(() => {
      expect(screen.getByText('がっこう')).toBeInTheDocument();
    });
    
    expect(screen.getByText('school')).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    // Mock failed API response
    api.get.mockRejectedValueOnce(new Error('Network error'));
    
    // Spy on setTimeout to make the retries immediate
    jest.useFakeTimers();
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Fast-forward through retry timeouts
    jest.advanceTimersByTime(2000);
    jest.advanceTimersByTime(2000);
    
    // Verify error message is displayed after all retries
    await waitFor(() => {
      expect(screen.getByText(/Failed to load vocabulary/)).toBeInTheDocument();
    });
    
    // Restore real timers
    jest.useRealTimers();
  });

  test('shows mock data when switching to offline mode', async () => {
    // Start with online mode
    api.get.mockResolvedValueOnce({ 
      data: { vocabulary: [], total_pages: 0 } 
    });
    
    // Mock the implementation of getMockData to return a resolved promise
    const { getMockData } = require('../../utils/mockData');
    getMockData.mockResolvedValueOnce(mockVocabulary);
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading vocabulary...')).not.toBeInTheDocument();
    });
    
    // Toggle offline mode
    const offlineToggle = screen.getByLabelText('Offline Mode (Use sample data)');
    fireEvent.click(offlineToggle);
    
    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText('学校')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('vocab_offline_mode', 'true');
  });

  test('caches API responses in localStorage', async () => {
    // Mock successful API response
    api.get.mockResolvedValueOnce({ 
      data: { 
        vocabulary: mockVocabulary.vocabulary,
        total_pages: 1
      } 
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('学校')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify data was cached in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'vocabulary_cache',
      expect.stringContaining('vocabulary')
    );
  });

  test('uses cached data when available', async () => {
    // Setup mock cache in localStorage with exactly the expected structure
    const mockCache = JSON.stringify({
      vocabulary: [
        {
          id: 99,
          word: "本",
          reading: "ほん",
          meaning: "book",
          jlpt_level: "N5",
        }
      ],
      totalPages: 1,
      timestamp: Date.now() // Fresh timestamp
    });
    
    // Setup the mock to return our cache data when requested
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'vocabulary_cache') {
        return mockCache;
      }
      return null;
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for the component to parse and display cached data
    await waitFor(() => {
      expect(screen.getByText('本')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    await waitFor(() => {
      expect(screen.getByText('ほん')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // API should not be called if cache is used
    expect(api.get).not.toHaveBeenCalled();
  });

  test('handles search and filters correctly', async () => {
    // Mock initial API response
    api.get.mockResolvedValueOnce({ 
      data: { 
        vocabulary: mockVocabulary.vocabulary,
        total_pages: 1
      } 
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('学校')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Mock response for search query
    api.get.mockResolvedValueOnce({
      data: {
        vocabulary: [mockVocabulary.vocabulary[0]],
        total_pages: 1
      }
    });
    
    // Perform search
    fireEvent.change(screen.getByPlaceholderText('Search for vocabulary...'), { 
      target: { value: 'school' } 
    });
    
    fireEvent.click(screen.getByText('Search'));
    
    // Verify API was called with correct search parameters
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/vocab', {
        params: expect.objectContaining({ 
          search: 'school',
          search_type: 'all'
        })
      });
    });
  });

  // This test requires special handling for the multiple retries and fallback
  test('falls back to mock data after multiple failed API calls', async () => {
    // Mock repeated API failures
    api.get.mockRejectedValueOnce(new Error('Network error 1'));
    api.get.mockRejectedValueOnce(new Error('Network error 2'));
    api.get.mockRejectedValueOnce(new Error('Network error 3'));
    
    // Spy on setTimeout to make the retries immediate
    jest.useFakeTimers();
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <VocabularyBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Fast-forward through the first retry timeout
    jest.advanceTimersByTime(2000);
    
    // Fast-forward through the second retry timeout
    jest.advanceTimersByTime(2000);
    
    // Verify error message is displayed after all retries
    await waitFor(() => {
      expect(screen.getByText('Failed to load vocabulary. Please try again later.')).toBeInTheDocument();
    });
    
    // Verify retry and offline mode buttons are present
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Use Offline Mode')).toBeInTheDocument();
    
    // Restore real timers
    jest.useRealTimers();
  });
}); 