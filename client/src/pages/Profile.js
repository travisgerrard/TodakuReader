import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';
import { ThemeContext } from '../context/ThemeContext';
import api from '../utils/api';

const ProfileCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
`;

const ProfileHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const ProfileTitle = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
`;

const ProfileEmail = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.1rem;
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
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  margin: 2rem 0;
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.text};
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
  max-width: 300px;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.error};
  margin-top: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: ${({ theme }) => theme.primaryLight};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
`;

const StoriesList = styled.div`
  margin-top: 1.5rem;
`;

const StoryCard = styled(Link)`
  display: block;
  background-color: ${({ theme }) => theme.background};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
    text-decoration: none;
  }
`;

const StoryTitle = styled.h3`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const StoryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
`;

const CreateStoryLink = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }) => theme.secondary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  margin-top: 1rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.secondary}DD;
    text-decoration: none;
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const NoStoriesMessage = styled.div`
  padding: 2rem;
  text-align: center;
  color: ${({ theme }) => theme.textSecondary};
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
`;

const Profile = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Set form data from user when available
  useEffect(() => {
    if (user) {
      setFormData({
        wanikani_level: user.wanikani_level || '',
        genki_chapter: user.genki_chapter || ''
      });
    }
  }, [user]);
  
  // Load profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated) return;
      
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/profile');
        setProfileData(res.data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, [isAuthenticated]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUpdateError('');
    
    try {
      const res = await api.put('/profile', formData);
      setProfileData(res.data);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setUpdateError(err.response?.data?.msg || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (loading) {
    return (
      <Container>
        <LoadingIndicator>Loading profile...</LoadingIndicator>
      </Container>
    );
  }
  
  return (
    <Container>
      <ProfileCard>
        <ProfileHeader>
          <div>
            <ProfileTitle>Your Profile</ProfileTitle>
            {user && <ProfileEmail>{user.email}</ProfileEmail>}
          </div>
          <Button onClick={handleLogout}>Logout</Button>
        </ProfileHeader>
        
        <Divider />
        
        <SectionTitle>Learning Stats</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatValue>{formData?.wanikani_level || '0'}</StatValue>
            <StatLabel>WaniKani Level</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{formData?.genki_chapter || '0'}</StatValue>
            <StatLabel>Genki Chapter</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{profileData?.stats?.stories_read || '0'}</StatValue>
            <StatLabel>Stories Read</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{profileData?.stats?.vocabulary_encountered || '0'}</StatValue>
            <StatLabel>Vocabulary Encountered</StatLabel>
          </StatCard>
        </StatsGrid>
        
        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="wanikani_level">WaniKani Level (1-60)</Label>
              <Input
                type="number"
                id="wanikani_level"
                name="wanikani_level"
                min="1"
                max="60"
                value={formData?.wanikani_level}
                onChange={handleChange}
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
                value={formData?.genki_chapter}
                onChange={handleChange}
              />
            </FormGroup>
            
            {updateError && <ErrorMessage>{updateError}</ErrorMessage>}
            
            <Button type="submit">Save Changes</Button>
            <Button 
              type="button" 
              style={{ marginLeft: '1rem', background: 'transparent', color: 'inherit' }}
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </form>
        ) : (
          <Button onClick={() => setIsEditing(true)}>Update Learning Level</Button>
        )}
        
        <Divider />
        
        <SectionTitle>Recently Read Stories</SectionTitle>
        
        {profileData?.recently_read_stories?.length > 0 ? (
          <StoriesList>
            {profileData.recently_read_stories.map(story => (
              <StoryCard key={story.id} to={`/stories/${story.id}`}>
                <StoryTitle>
                  {story.title_jp || story.content_jp.split('\n')[0]}
                </StoryTitle>
                <StoryMeta>
                  <span>Topic: {story.topic}</span>
                  <span>Tadoku Level: {story.tadoku_level}</span>
                  <span>Read: {new Date(story.read_at).toLocaleDateString()}</span>
                </StoryMeta>
              </StoryCard>
            ))}
          </StoriesList>
        ) : (
          <NoStoriesMessage>
            <p>You haven't read any stories yet.</p>
            <CreateStoryLink to="/stories">Browse Stories</CreateStoryLink>
          </NoStoriesMessage>
        )}
        
        <Divider />
        
        <SectionTitle>Your Created Stories</SectionTitle>
        
        <CreateStoryLink to="/stories/new">Create a New Story</CreateStoryLink>
      </ProfileCard>
    </Container>
  );
};

export default Profile; 