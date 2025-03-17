import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import api, { generateStoryApi } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';

const FormCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
`;

const FormTitle = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.border};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.error};
  margin-top: 0.5rem;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const PreviewCard = styled.div`
  background-color: ${({ theme }) => theme.primaryLight};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoText = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
  margin-bottom: 1rem;
`;

const StoryGenerator = () => {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    wanikani_level: '',
    genki_chapter: '',
    tadoku_level: '',
    length: 'medium',
    topic: '',
  });
  
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // Set default values from user profile when available
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        wanikani_level: user.wanikani_level || '',
        genki_chapter: user.genki_chapter || '',
      }));
    }
  }, [user]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setGenerating(true);
    
    try {
      const res = await generateStoryApi.post('/stories/generate', formData);
      navigate(`/stories/${res.data.id}`);
    } catch (err) {
      console.error('Story generation error:', err);
      // Extract the most useful error message
      let errorMessage = 'Failed to generate story. Please try again.';
      
      if (err.response) {
        // Server responded with an error
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid input. Please check your entries and try again.';
        } else if (err.response.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        }
      } else if (err.request) {
        // No response received
        errorMessage = 'No response from server. Please check your internet connection.';
      }
      
      setError(errorMessage);
      setGenerating(false);
    }
  };
  
  if (isLoading) {
    return (
      <Container>
        <LoadingIndicator>Loading...</LoadingIndicator>
      </Container>
    );
  }
  
  return (
    <Container>
      <FormCard>
        <FormTitle>Generate a Custom Story</FormTitle>
        
        <InfoText>
          Create a personalized Japanese story tailored to your language level.
          Adjust the parameters below to generate content that matches your abilities.
        </InfoText>
        
        <PreviewCard>
          <h3>Your Current Settings</h3>
          <p>WaniKani Level: {formData.wanikani_level || 'Not set'}</p>
          <p>Genki Chapter: {formData.genki_chapter || 'Not set'}</p>
        </PreviewCard>
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="wanikani_level">WaniKani Level (1-60)</Label>
            <Input
              type="number"
              id="wanikani_level"
              name="wanikani_level"
              min="1"
              max="60"
              value={formData.wanikani_level}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="genki_chapter">Genki Chapter (1-23)</Label>
            <Input
              type="number"
              id="genki_chapter"
              name="genki_chapter"
              min="1"
              max="23"
              value={formData.genki_chapter}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="tadoku_level">Tadoku Level (0-5)</Label>
            <Select
              id="tadoku_level"
              name="tadoku_level"
              value={formData.tadoku_level}
              onChange={handleChange}
              required
            >
              <option value="">Select a level</option>
              <option value="0">Level 0 (Complete Beginner)</option>
              <option value="1">Level 1 (Basic Hiragana/Katakana)</option>
              <option value="2">Level 2 (Basic Kanji/Grammar)</option>
              <option value="3">Level 3 (Intermediate)</option>
              <option value="4">Level 4 (Advanced Intermediate)</option>
              <option value="5">Level 5 (Advanced)</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="length">Story Length</Label>
            <Select
              id="length"
              name="length"
              value={formData.length}
              onChange={handleChange}
              required
            >
              <option value="short">Short (100-200 characters)</option>
              <option value="medium">Medium (300-500 characters)</option>
              <option value="long">Long (700-1000 characters)</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="topic">Topic</Label>
            <Input
              type="text"
              id="topic"
              name="topic"
              placeholder="e.g., daily life, school, travel, food"
              value={formData.topic}
              onChange={handleChange}
              maxLength={50}
              required
            />
            <small style={{ 
              color: formData.topic.length >= 45 ? 'red' : 
                     formData.topic.length >= 35 ? 'orange' : 
                     'inherit' 
            }}>
              {formData.topic.length}/50 characters
              {formData.topic.length >= 45 ? ' - Topic is too long!' :
               formData.topic.length >= 35 ? ' - Topic is getting long' : ''}
            </small>
          </FormGroup>
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={generating}>
            {generating ? 'Generating...' : 'Generate Story'}
          </Button>
        </form>
      </FormCard>
    </Container>
  );
};

export default StoryGenerator; 