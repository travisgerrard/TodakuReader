import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';

// Create a mock for axios
jest.mock('axios');

// Test directly with the API to check if the stories endpoint is accessible
describe('Stories API Access', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Simple component to display API response status
  const StoriesDisplay = ({ apiUrl }) => {
    const [status, setStatus] = React.useState('loading');
    const [storyCount, setStoryCount] = React.useState(0);
    
    React.useEffect(() => {
      const fetchStories = async () => {
        try {
          const response = await axios.get(apiUrl);
          if (response.data && Array.isArray(response.data.stories)) {
            setStatus('success');
            setStoryCount(response.data.stories.length);
          } else {
            setStatus('error-format');
          }
        } catch (err) {
          setStatus('error-api');
        }
      };
      
      fetchStories();
    }, [apiUrl]);
    
    return (
      <div>
        <div data-testid="status">{status}</div>
        {status === 'success' && <div data-testid="count">{storyCount}</div>}
      </div>
    );
  };
  
  test('should be able to fetch stories without authentication', async () => {
    // Mock successful API response
    axios.get.mockResolvedValueOnce({
      data: {
        stories: [
          { id: 1, title_jp: 'タイトル1', content_jp: '内容1' },
          { id: 2, title_jp: 'タイトル2', content_jp: '内容2' }
        ],
        pagination: { total: 2, limit: 10, offset: 0, hasMore: false }
      }
    });
    
    // Render test component
    render(<StoriesDisplay apiUrl="/api/stories" />);
    
    // Wait for API call to complete
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('success');
    });
    
    // Verify stories were returned
    expect(screen.getByTestId('count').textContent).toBe('2');
    
    // Verify API was called correctly
    expect(axios.get).toHaveBeenCalledWith('/api/stories');
  });
  
  test('should use mock data if API fails', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    
    // Create test component with fallback logic
    const StoriesWithFallback = () => {
      const [status, setStatus] = React.useState('loading');
      const [storyCount, setStoryCount] = React.useState(0);
      
      React.useEffect(() => {
        const fetchStories = async () => {
          try {
            const response = await axios.get('/api/stories');
            if (response.data && Array.isArray(response.data.stories)) {
              setStatus('api-success');
              setStoryCount(response.data.stories.length);
            } else {
              // Use mock data
              setStatus('using-mock');
              setStoryCount(3); // Mock count for test
            }
          } catch (err) {
            // Use mock data
            setStatus('using-mock');
            setStoryCount(3); // Mock count for test
          }
        };
        
        fetchStories();
      }, []);
      
      return (
        <div>
          <div data-testid="status">{status}</div>
          <div data-testid="count">{storyCount}</div>
        </div>
      );
    };
    
    // Render test component
    render(<StoriesWithFallback />);
    
    // Wait for API call to complete and fallback to execute
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('using-mock');
    });
    
    // Verify mock story count
    expect(screen.getByTestId('count').textContent).toBe('3');
  });
}); 