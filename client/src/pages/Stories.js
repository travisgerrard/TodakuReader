import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from '../components/layout/Container';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const FiltersContainer = styled.div`
  background-color: ${({ theme }) => theme.surface};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
`;

const FiltersTitle = styled.h3`
  margin-bottom: 1rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.textSecondary};
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
  }
`;

const ClearButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.border};
    color: ${({ theme }) => theme.text};
  }
`;

const CreateButton = styled(Link)`
  display: inline-block;
  background-color: ${({ theme }) => theme.secondary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  margin-bottom: 1rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.secondary}DD;
    text-decoration: none;
  }
`;

const StoriesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StoryCard = styled(Link)`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  transition: transform 0.3s;
  text-decoration: none;
  color: ${({ theme }) => theme.text};
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    text-decoration: none;
  }
`;

const StoryTitle = styled.h3`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
`;

const StoryPreview = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 1rem;
  flex-grow: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const StoryMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  border-top: 1px solid ${({ theme }) => theme.border};
  padding-top: 0.75rem;
`;

const StoryMetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid ${({ theme, active }) => active ? theme.primary : theme.border};
  background-color: ${({ theme, active }) => active ? theme.primary : 'transparent'};
  color: ${({ theme, active }) => active ? 'white' : theme.textSecondary};
  border-radius: 4px;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${({ theme, active }) => active ? theme.primary : theme.primaryLight};
    color: ${({ theme, active }) => active ? 'white' : theme.primary};
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const NoResults = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${({ theme }) => theme.textSecondary};
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
`;

const Stories = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  // State for stories and pagination
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStories, setTotalStories] = useState(0);
  const [pagination, setPagination] = useState({
    limit: 10,
    offset: 0
  });
  
  // State for filters
  const [filters, setFilters] = useState({
    tadoku_level: '',
    wanikani_level: '',
    genki_chapter: '',
    length: '',
    topic: '',
    level: '',
    search: ''
  });
  
  // Load stories with current filters and pagination
  const fetchStories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('limit', pagination.limit);
    params.append('offset', pagination.offset);
    
    // Add filters if they are set
    if (filters.tadoku_level) params.append('tadoku_level', filters.tadoku_level);
    if (filters.wanikani_level) params.append('wanikani_level', filters.wanikani_level);
    if (filters.genki_chapter) params.append('genki_chapter', filters.genki_chapter);
    if (filters.length) params.append('length', filters.length);
    if (filters.topic) params.append('topic', filters.topic);
    
    try {
      const res = await api.get(`/stories?${params.toString()}`);
      setStories(res.data.stories);
      setTotalStories(res.data.pagination.total);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, pagination.offset]);
  
  // Fetch stories when component mounts or when filters/pagination change
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  
  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, offset: 0 }));
  };
  
  // Reset all filters
  const handleResetFilters = () => {
    setFilters({
      tadoku_level: '',
      wanikani_level: '',
      genki_chapter: '',
      length: '',
      topic: '',
      level: '',
      search: ''
    });
    
    setPagination(prev => ({ ...prev, offset: 0 }));
  };
  
  // Handle pagination
  const handlePageChange = (offset) => {
    setPagination(prev => ({ ...prev, offset }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalStories / pagination.limit);
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  
  // Generate page numbers
  const pageNumbers = [];
  const maxVisiblePages = 5;
  
  if (totalPages <= maxVisiblePages) {
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate start and end of visible pages
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(start + 2, totalPages - 1);
    
    // Adjust start if end is maxed out
    if (end === totalPages - 1) {
      start = Math.max(2, end - 2);
    }
    
    // Add ellipsis if needed
    if (start > 2) {
      pageNumbers.push('...');
    }
    
    // Add page numbers
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed
    if (end < totalPages - 1) {
      pageNumbers.push('...');
    }
    
    // Always show last page
    pageNumbers.push(totalPages);
  }
  
  return (
    <Container>
      <PageHeader>
        <Title>Browse Japanese Stories</Title>
        
        {isAuthenticated && (
          <CreateButton to="/stories/new">
            Create a New Story
          </CreateButton>
        )}
      </PageHeader>
      
      <FiltersContainer>
        <FiltersTitle>Filter Stories</FiltersTitle>
        
        <FiltersGrid>
          <FilterGroup>
            <Label htmlFor="tadoku_level">Tadoku Level</Label>
            <Select
              id="tadoku_level"
              name="tadoku_level"
              value={filters.tadoku_level}
              onChange={handleFilterChange}
            >
              <option value="">Any Level</option>
              <option value="0">Level 0 (Complete Beginner)</option>
              <option value="1">Level 1 (Basic Hiragana/Katakana)</option>
              <option value="2">Level 2 (Basic Kanji/Grammar)</option>
              <option value="3">Level 3 (Intermediate)</option>
              <option value="4">Level 4 (Advanced Intermediate)</option>
              <option value="5">Level 5 (Advanced)</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="wanikani_level">Max WaniKani Level</Label>
            <Input
              type="number"
              id="wanikani_level"
              name="wanikani_level"
              min="1"
              max="60"
              placeholder="Any"
              value={filters.wanikani_level}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="genki_chapter">Max Genki Chapter</Label>
            <Input
              type="number"
              id="genki_chapter"
              name="genki_chapter"
              min="1"
              max="23"
              placeholder="Any"
              value={filters.genki_chapter}
              onChange={handleFilterChange}
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="length">Story Length</Label>
            <Select
              id="length"
              name="length"
              value={filters.length}
              onChange={handleFilterChange}
            >
              <option value="">Any Length</option>
              <option value="short">Short</option>
              <option value="medium">Medium</option>
              <option value="long">Long</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="topic">Topic</Label>
            <Input
              type="text"
              id="topic"
              name="topic"
              placeholder="Any topic"
              value={filters.topic}
              onChange={handleFilterChange}
            />
          </FilterGroup>
        </FiltersGrid>
        
        <ButtonGroup>
          <ClearButton onClick={handleResetFilters}>
            Reset Filters
          </ClearButton>
          
          {isAuthenticated && (
            <Button onClick={() => {
              if (user) {
                setFilters(prev => ({
                  ...prev,
                  wanikani_level: user.wanikani_level || '',
                  genki_chapter: user.genki_chapter || ''
                }));
              }
            }}>
              Match My Level
            </Button>
          )}
        </ButtonGroup>
      </FiltersContainer>
      
      {loading ? (
        <LoadingIndicator>Loading stories...</LoadingIndicator>
      ) : stories.length === 0 ? (
        <NoResults>
          <h3>No stories found</h3>
          <p>Try changing your filters or create a new story.</p>
        </NoResults>
      ) : (
        <>
          <StoriesList>
            {stories.map(story => (
              <StoryCard key={story.id} to={`/stories/${story.id}`}>
                <StoryTitle>
                  {story.title_jp || story.content_jp.split('\n')[0]}
                </StoryTitle>
                <StoryPreview>
                  {story.title_en || story.content_en.split('\n')[0]}
                </StoryPreview>
                <StoryMeta>
                  <StoryMetaItem>Tadoku: {story.tadoku_level}</StoryMetaItem>
                  <StoryMetaItem>WK: ≤{story.wanikani_max_level}</StoryMetaItem>
                  <StoryMetaItem>GK: ≤{story.genki_max_chapter}</StoryMetaItem>
                  <StoryMetaItem>↑ {story.upvotes}</StoryMetaItem>
                </StoryMeta>
              </StoryCard>
            ))}
          </StoriesList>
          
          {totalPages > 1 && (
            <Pagination>
              <PageButton
                disabled={currentPage === 1}
                onClick={() => handlePageChange(0)}
              >
                First
              </PageButton>
              
              <PageButton
                disabled={currentPage === 1}
                onClick={() => handlePageChange(Math.max(0, pagination.offset - pagination.limit))}
              >
                Prev
              </PageButton>
              
              {pageNumbers.map((number, index) => (
                number === '...' ? (
                  <PageButton key={`ellipsis-${index}`} disabled>...</PageButton>
                ) : (
                  <PageButton
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange((number - 1) * pagination.limit)}
                  >
                    {number}
                  </PageButton>
                )
              ))}
              
              <PageButton
                disabled={!pagination.hasMore}
                onClick={() => handlePageChange(pagination.offset + pagination.limit)}
              >
                Next
              </PageButton>
              
              <PageButton
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange((totalPages - 1) * pagination.limit)}
              >
                Last
              </PageButton>
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default Stories; 