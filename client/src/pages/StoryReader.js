import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';
import api from '../utils/api';

const StoryCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const StoryTitle = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const StoryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
`;

const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

const JapaneseText = styled.div`
  font-size: 1.25rem;
  line-height: 2;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.primary};
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    padding: 1rem;
    line-height: 1.9;
  }
`;

const EnglishText = styled.div`
  font-size: 1.1rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
    padding: 1rem;
  }
`;

const TabContainer = styled.div`
  margin-top: 2rem;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  margin-bottom: 1rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ props, theme }) => props.active ? theme.primary : 'transparent'};
  color: ${({ props, theme }) => props.active ? 'white' : theme.textSecondary};
  border: none;
  border-bottom: 3px solid ${({ props, theme }) => props.active ? theme.primary : 'transparent'};
  cursor: pointer;
  font-weight: ${({ props }) => props.active ? 'bold' : 'normal'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${({ props, theme }) => props.active ? theme.primary : theme.primaryLight};
    color: ${({ props, theme }) => props.active ? 'white' : theme.primary};
  }
`;

const TabContent = styled.div`
  padding: 1rem 0;
`;

const VocabSection = styled.div`
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    margin-top: 1.5rem;
  }
`;

const VocabTitle = styled.h3`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    margin-bottom: 0.75rem;
  }
`;

const VocabList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const VocabCard = styled.div`
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
`;

const VocabWord = styled.h4`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const VocabReading = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const VocabMeaning = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const VocabExample = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  background-color: ${({ theme }) => theme.primaryLight};
  padding: 0.5rem;
  border-radius: 4px;
  margin-top: 0.5rem;
`;

const GrammarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GrammarCard = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  border-left: 3px solid ${({ theme }) => theme.secondary};
`;

const GrammarPoint = styled.h4`
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.text};
`;

const GrammarExplanation = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const GrammarReference = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.primary};
  font-weight: bold;
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const AuthMessage = styled.div`
  background-color: ${({ theme }) => theme.primaryLight || '#e8f4ff'};
  border: 1px solid ${({ theme }) => theme.primary};
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const AuthMessageText = styled.div`
  flex: 1;
  color: ${({ theme }) => theme.text};
`;

const AuthButton = styled(Link)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
    text-decoration: none;
    color: white;
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: bold;
  border: none;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
  }
  
  @media (max-width: 480px) {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  text-align: center;
  padding: 2rem;
`;

const StoryReader = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [story, setStory] = useState(null);
  const [activeTab, setActiveTab] = useState('text');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await api.get(`/stories/${id}`);
        setStory(res.data);
        
        // Mark as read if authenticated
        if (isAuthenticated) {
          await api.post(`/profile/read/${id}`);
        }
      } catch (err) {
        setError('Failed to load story. It may have been removed or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStory();
  }, [id, isAuthenticated]);
  
  const handleMarkRead = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      await api.post(`/profile/read/${id}`);
      alert('Story marked as read');
    } catch (err) {
      console.error('Error marking story as read:', err);
    }
  };
  
  const handleUpvote = async () => {
    try {
      const res = await api.put(`/stories/${id}/upvote`);
      setStory({
        ...story,
        upvotes: res.data.upvotes
      });
    } catch (err) {
      console.error('Error upvoting story:', err);
    }
  };
  
  if (loading) {
    return (
      <Container>
        <LoadingIndicator>Loading story...</LoadingIndicator>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }
  
  if (!story) {
    return (
      <Container>
        <ErrorMessage>Story not found</ErrorMessage>
      </Container>
    );
  }
  
  return (
    <Container>
      <StoryCard>
        <StoryTitle dangerouslySetInnerHTML={{ __html: story.title_jp || story.content_jp.split('\n')[0] }} />
        
        <StoryMeta>
          <MetaItem>
            <span>Tadoku Level: {story.tadoku_level}</span>
          </MetaItem>
          <MetaItem>
            <span>WaniKani: ≤ {story.wanikani_max_level}</span>
          </MetaItem>
          <MetaItem>
            <span>Genki: ≤ {story.genki_max_chapter}</span>
          </MetaItem>
          <MetaItem>
            <span>Topic: {story.topic}</span>
          </MetaItem>
          <MetaItem>
            <span>Upvotes: {story.upvotes}</span>
          </MetaItem>
        </StoryMeta>
        
        <TabContainer>
          <TabList>
            <Tab 
              props={{ active: activeTab === 'text' }}
              onClick={() => setActiveTab('text')}
            >
              Story Text
            </Tab>
            <Tab 
              props={{ active: activeTab === 'vocabulary' }}
              onClick={() => setActiveTab('vocabulary')}
            >
              Vocabulary ({story.vocabulary?.length || 0})
            </Tab>
            <Tab 
              props={{ active: activeTab === 'grammar' }}
              onClick={() => setActiveTab('grammar')}
            >
              Grammar ({story.grammar?.length || 0})
            </Tab>
          </TabList>
          
          <TabContent>
            {activeTab === 'text' && (
              <>
                <JapaneseText 
                  className="japanese-text"
                  dangerouslySetInnerHTML={{ 
                    __html: story.storyJP || (story.content_jp.includes('\n\n') 
                      ? story.content_jp.split('\n\n').slice(1).join('\n\n') 
                      : story.content_jp)
                  }}
                />
                <EnglishText 
                  dangerouslySetInnerHTML={{ 
                    __html: story.storyEN || (story.content_en.includes('\n\n') 
                      ? story.content_en.split('\n\n').slice(1).join('\n\n') 
                      : story.content_en)
                  }}
                />
              </>
            )}
            
            {activeTab === 'vocabulary' && (
              <VocabSection>
                <VocabTitle>Vocabulary</VocabTitle>
                <VocabList>
                  {story.vocabulary?.map((vocab) => (
                    <VocabCard key={vocab.id}>
                      <VocabWord>{vocab.word}</VocabWord>
                      <VocabReading>Reading: {vocab.reading}</VocabReading>
                      <VocabMeaning>Meaning: {vocab.meaning}</VocabMeaning>
                      {vocab.example_sentence_jp && (
                        <VocabExample>
                          Example: {vocab.example_sentence_jp}
                        </VocabExample>
                      )}
                    </VocabCard>
                  ))}
                </VocabList>
              </VocabSection>
            )}
            
            {activeTab === 'grammar' && (
              <GrammarList>
                {story.grammar?.map((grammar) => (
                  <GrammarCard key={grammar.id}>
                    <GrammarPoint>{grammar.grammar_point}</GrammarPoint>
                    <GrammarExplanation>{grammar.explanation}</GrammarExplanation>
                    <GrammarReference>{grammar.genki_reference}</GrammarReference>
                  </GrammarCard>
                ))}
              </GrammarList>
            )}
          </TabContent>
        </TabContainer>
        
        <ControlsContainer>
          <ButtonGroup>
            <Button onClick={handleUpvote}>
              Upvote Story
            </Button>
            {isAuthenticated && (
              <Button onClick={handleMarkRead}>
                Mark as Read
              </Button>
            )}
          </ButtonGroup>
        </ControlsContainer>
        
        {!isAuthenticated && (
          <AuthMessage>
            <AuthMessageText>
              Sign in to track your reading progress, mark stories as read, and create your own stories.
            </AuthMessageText>
            <AuthButton to="/login">Sign in</AuthButton>
          </AuthMessage>
        )}
      </StoryCard>
    </Container>
  );
};

export default StoryReader; 