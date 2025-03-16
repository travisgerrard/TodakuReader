import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
`;

const StoryTitle = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
  text-align: center;
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
`;

const EnglishText = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  border-left: 4px solid ${({ theme }) => theme.secondary};
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

const VocabList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const VocabCard = styled.div`
  padding: 1rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
  border-left: 3px solid ${({ theme }) => theme.primary};
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
  margin-right: 1rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
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

const ButtonGroup = styled.div`
  display: flex;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    
    & > button {
      width: 100%;
      margin-right: 0;
    }
  }
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
      </StoryCard>
    </Container>
  );
};

export default StoryReader; 