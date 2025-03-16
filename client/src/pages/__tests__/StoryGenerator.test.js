import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import StoryGenerator from '../StoryGenerator';
import api from '../../utils/api';

// Mock the API module
jest.mock('../../utils/api');

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }) => <a href={to} {...props} data-testid="mock-link">{children}</a>,
  useNavigate: () => mockNavigate
}));

describe('StoryGenerator Component', () => {
  // Setup auth context mock
  const mockAuthContext = {
    isAuthenticated: true,
    user: { id: 1, email: 'test@example.com', wanikani_level: 10, genki_chapter: 5 },
    isLoading: false
  };

  // Wrapper component for consistent rendering
  const TestWrapper = ({ children }) => (
    <ThemeProvider>
      <AuthContext.Provider value={mockAuthContext}>
        {children}
      </AuthContext.Provider>
    </ThemeProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    api.post.mockResolvedValue({ data: { id: 1 } });
    mockNavigate.mockClear();
  });

  test('renders story generator form', () => {
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );

    expect(screen.getByText('Generate a Custom Story')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tadoku Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/WaniKani Level/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Genki Chapter/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Topic/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate Story/i })).toBeInTheDocument();
  });

  test('enforces topic length validation with maxLength attribute', () => {
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );

    const topicInput = screen.getByLabelText(/Topic/i);
    expect(topicInput).toHaveAttribute('maxLength', '50');
  });

  test('displays character count for topic field', () => {
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );

    const topicInput = screen.getByLabelText(/Topic/i);
    
    // Type a short topic
    fireEvent.change(topicInput, { target: { value: 'Short topic' } });
    expect(screen.getByText(/1[0-2]\/50 characters/)).toBeInTheDocument();
    
    // Type a longer topic approaching the limit
    fireEvent.change(topicInput, { target: { value: 'A longer topic that is approaching the character limit' } });
    expect(screen.getByText(/\d+\/50 characters/)).toBeInTheDocument();
  });

  test('allows submission with valid topic length', async () => {
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );

    // Set valid values for required fields
    fireEvent.change(screen.getByLabelText(/WaniKani Level/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Genki Chapter/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Tadoku Level/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Topic/i), { target: { value: 'Valid topic' } });

    // Submit the form
    fireEvent.click(screen.getByText('Generate Story'));

    // Check if API was called with correct data
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/stories/generate', expect.objectContaining({
        wanikani_level: 10,
        genki_chapter: 5,
        tadoku_level: '2',
        topic: 'Valid topic',
        length: 'medium'
      }));
    });
    
    // Check if navigation happened
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/stories/1');
    });
  });
  
  test('handles server validation error (400)', async () => {
    // Mock a 400 response for validation error
    api.post.mockRejectedValueOnce({
      response: { 
        status: 400,
        data: { message: 'Topic must be 50 characters or less' }
      }
    });
    
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/WaniKani Level/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Genki Chapter/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Tadoku Level/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Topic/i), { target: { value: 'Too long topic' } });
    fireEvent.click(screen.getByText('Generate Story'));
    
    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText('Topic must be 50 characters or less')).toBeInTheDocument();
    });
  });
  
  test('handles server error (500)', async () => {
    // Mock a 500 server error
    api.post.mockRejectedValueOnce({
      response: { 
        status: 500,
        data: { error: 'OpenAI response format is incomplete' }
      }
    });
    
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/WaniKani Level/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Genki Chapter/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Tadoku Level/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Topic/i), { target: { value: 'Valid topic' } });
    fireEvent.click(screen.getByText('Generate Story'));
    
    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText('OpenAI response format is incomplete')).toBeInTheDocument();
    });
  });
  
  test('handles network error', async () => {
    // Mock a network error (no response)
    api.post.mockRejectedValueOnce({
      request: {}
    });
    
    render(
      <TestWrapper>
        <StoryGenerator />
      </TestWrapper>
    );
    
    // Fill and submit form
    fireEvent.change(screen.getByLabelText(/WaniKani Level/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Genki Chapter/i), { target: { value: '5' } });
    fireEvent.change(screen.getByLabelText(/Tadoku Level/i), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/Topic/i), { target: { value: 'Valid topic' } });
    fireEvent.click(screen.getByText('Generate Story'));
    
    // Check error message is displayed
    await waitFor(() => {
      expect(screen.getByText('No response from server. Please check your internet connection.')).toBeInTheDocument();
    });
  });
}); 