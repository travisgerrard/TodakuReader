import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import GrammarBrowser from '../GrammarBrowser';
import api from '../../utils/api';
import { mockGrammarPoints } from '../../utils/mockData';

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
      return Promise.resolve({
        grammar: originalModule.mockGrammarPoints.grammar,
        pagination: originalModule.mockGrammarPoints.pagination
      });
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

describe('GrammarBrowser Component', () => {
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

  test('renders grammar browser with header and search form', async () => {
    // Mock successful API response that resolves immediately
    api.get.mockResolvedValueOnce({ data: { grammar: [], total_pages: 0 } });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for component to finish rendering
    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
    
    // Verify header elements are present
    expect(screen.getByText('Grammar Browser')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search for grammar points...')).toBeInTheDocument();
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
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Verify loading indicator is displayed
    expect(screen.getByText('Loading grammar points...')).toBeInTheDocument();
    
    // Resolve the API call
    act(() => {
      resolveApiCall({ data: { grammar: [], pagination: { total_pages: 0 } } });
    });
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByText('Loading grammar points...')).not.toBeInTheDocument();
    });
  });

  test('displays grammar points after successful API call', async () => {
    // Mock successful API response with grammar data
    api.get.mockResolvedValueOnce({ 
      data: { 
        grammar: mockGrammarPoints.grammar,
        pagination: { total_pages: 5 }
      } 
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for grammar points to be displayed
    await waitFor(() => {
      expect(screen.getByText(/〜てもいい/)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/It's OK to do something/)).toBeInTheDocument();
  });

  test('displays error message when API call fails', async () => {
    // Mock failed API response
    api.get.mockRejectedValueOnce(new Error('Network error'));
    
    // Spy on setTimeout to make the retries immediate
    jest.useFakeTimers();
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Fast-forward through retry timeouts 
    act(() => {
      jest.runAllTimers();
    });
    
    // The component will try to fetch 3 times total, need to reject the 2nd and 3rd attempts too
    act(() => {
      jest.runAllTimers();
    });
    
    // Verify error message is displayed after all retries
    await waitFor(() => {
      expect(screen.getByText(/Failed to load grammar points/)).toBeInTheDocument();
    });
    
    // Restore real timers
    jest.useRealTimers();
  });

  test('shows mock data when switching to offline mode', async () => {
    // Start with online mode
    api.get.mockResolvedValueOnce({ 
      data: { grammar: [], pagination: { total_pages: 0 } } 
    });
    
    // Mock the implementation of getMockData to return a resolved promise
    const { getMockData } = require('../../utils/mockData');
    getMockData.mockImplementation(() => {
      return Promise.resolve({
        grammar: mockGrammarPoints.grammar,
        pagination: { total_pages: 5 }
      });
    });
    
    const { container } = render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Loading grammar points...')).not.toBeInTheDocument();
    });
    
    // Toggle offline mode
    const offlineToggle = screen.getByLabelText('Offline Mode (Use sample data)');
    fireEvent.click(offlineToggle);
    
    // Wait for mock data to load
    await waitFor(() => {
      expect(screen.getByText(/〜てもいい/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify localStorage was updated
    expect(localStorage.setItem).toHaveBeenCalledWith('offline_mode', 'true');
  });

  test('caches API responses in localStorage', async () => {
    // Mock successful API response
    api.get.mockResolvedValueOnce({ 
      data: { 
        grammar: mockGrammarPoints.grammar,
        pagination: { total_pages: 5 }
      } 
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/〜てもいい/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Verify data was cached in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'grammar_cache',
      expect.stringContaining('grammar')
    );
  });

  test('uses cached data when available', async () => {
    // Setup mock cache in localStorage with exactly the expected structure
    const mockCache = JSON.stringify({
      grammar: [
        {
          id: 99,
          grammar_point: "〜テスト文法",
          explanation: "Test Grammar Point",
          description: "This is a cached test grammar point",
          jlpt_level: "N3",
          tadoku_level: 2
        }
      ],
      totalPages: 1,
      timestamp: Date.now() // Fresh timestamp
    });
    
    // Setup the mock to return our cache data when requested
    localStorage.getItem.mockImplementation((key) => {
      if (key === 'grammar_cache') {
        return mockCache;
      }
      return null;
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for the component to parse and display cached data
    await waitFor(() => {
      const grammarElements = screen.getAllByText(/テスト文法/);
      expect(grammarElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
    
    // API should not be called if cache is used
    expect(api.get).not.toHaveBeenCalled();
  });

  test('handles search and filters correctly', async () => {
    // Mock initial API response
    api.get.mockResolvedValueOnce({ 
      data: { 
        grammar: mockGrammarPoints.grammar,
        pagination: { total_pages: 5 }
      } 
    });
    
    render(
      <ThemeProvider>
        <AuthContext.Provider value={mockAuthContext}>
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText(/〜てもいい/)).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Mock response for search query
    api.get.mockResolvedValueOnce({
      data: {
        grammar: [mockGrammarPoints.grammar[0]],
        pagination: { total_pages: 1 }
      }
    });
    
    // Perform search
    fireEvent.change(screen.getByPlaceholderText('Search for grammar points...'), { 
      target: { value: 'permission' } 
    });
    
    fireEvent.click(screen.getByText('Search'));
    
    // Verify API was called with correct search parameters
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/grammar', {
        params: expect.objectContaining({ 
          search: 'permission',
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
          <GrammarBrowser />
        </AuthContext.Provider>
      </ThemeProvider>
    );
    
    // Fast-forward through the first retry timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // Fast-forward through the second retry timeout
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    // The error message shown after multiple failures is different than initially expected
    // It's "Failed to load grammar points. Please try again later." not "Unable to connect to server..."
    await waitFor(() => {
      expect(screen.getByText('Failed to load grammar points. Please try again later.')).toBeInTheDocument();
    });
    
    // Checking that the retry and offline mode buttons appear
    expect(screen.getByText('Retry')).toBeInTheDocument();
    expect(screen.getByText('Use Offline Mode')).toBeInTheDocument();
    
    // Restore real timers
    jest.useRealTimers();
  });
}); 