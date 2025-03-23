import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Container from '../components/layout/Container';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { getMockStoriesData } from '../utils/mockData';

// Styled components
const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const WelcomeMessage = styled.div`
  background-color: ${({ theme }) => theme.surface};
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const WelcomeText = styled.div`
  flex: 1;
  min-width: 250px;
  
  h3 {
    color: ${({ theme }) => theme.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${({ theme }) => theme.textSecondary};
    margin-bottom: 0;
  }
`;

const ActionButton = styled(Link)`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  display: inline-block;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
    text-decoration: none;
    color: white;
  }
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
    color: white;
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
    color: ${({ theme }) => theme.text};
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
  white-space: pre-wrap;
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

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.surface};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.error};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: flex-start;
`;

// Define the Stories component
function Stories() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStories, setTotalStories] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    chapter: '',
    type: 'all'
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 10,
    offset: 0,
    hasMore: false
  });
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        offset: pagination.offset,
        limit: pagination.limit,
        ...filters
      });
      const response = await api.get(`/stories?${params.toString()}`);
      setStories(response.data.stories);
      setTotalStories(response.data.total);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        hasMore: response.data.hasMore
      }));
      setError(null);
    } catch (err) {
      console.error('Error fetching stories:', err);
      
      // Try to use fallback data
      try {
        const mockData = await getMockStoriesData();
        setStories(mockData.stories);
        setTotalStories(mockData.total);
        setPagination(prev => ({
          ...prev,
          total: mockData.total,
          hasMore: mockData.hasMore
        }));
        setUsingSampleData(true);
      } catch (mockErr) {
        console.error('Error fetching mock data:', mockErr);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.offset, pagination.limit, filters]);
  
  useEffect(() => {
    fetchStories();
  }, [fetchStories]);
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      search: '',
      level: '',
      chapter: '',
      type: 'all'
    });
    setPagination(prev => ({
      ...prev,
      offset: 0
    }));
  };
  
  const handlePageChange = (newOffset) => {
    setPagination(prev => ({
      ...prev,
      offset: newOffset
    }));
  };
  
  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(totalStories / pagination.limit);
  
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(currentPage - halfVisible, 1);
    let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);
    
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
    
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchStories();
  };
  
  return (
    <Container>
      <PageHeader>
        <Title>Stories</Title>
        {isAuthenticated && (
          <CreateButton to="/stories/new">Create a New Story</CreateButton>
        )}
      </PageHeader>
      
      {!isAuthenticated && (
        <WelcomeMessage>
          <WelcomeText>
            <h3>Welcome to Stories!</h3>
            <p>Sign in to create and manage your own stories.</p>
          </WelcomeText>
          <ActionButton to="/auth">Sign In</ActionButton>
        </WelcomeMessage>
      )}
      
      <FiltersContainer>
        <FiltersTitle>Filter Stories</FiltersTitle>
        
        <FiltersGrid>
          <FilterGroup>
            <Label htmlFor="search">Search</Label>
            <Input
              type="text"
              id="search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search stories..."
            />
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="level">Level</Label>
            <Select
              id="level"
              name="level"
              value={filters.level}
              onChange={handleFilterChange}
            >
              <option value="">All Levels</option>
              <option value="N5">N5</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="chapter">Chapter</Label>
            <Select
              id="chapter"
              name="chapter"
              value={filters.chapter}
              onChange={handleFilterChange}
            >
              <option value="">All Chapters</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Chapter {i + 1}
                </option>
              ))}
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <Label htmlFor="type">Type</Label>
            <Select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="all">All Types</option>
              <option value="public">Public</option>
              {isAuthenticated && (
                <>
                  <option value="private">Private</option>
                  <option value="my">My Stories</option>
                </>
              )}
            </Select>
          </FilterGroup>
        </FiltersGrid>
        
        <ButtonGroup>
          <Button onClick={fetchStories}>Apply Filters</Button>
          <ClearButton onClick={clearFilters}>Clear Filters</ClearButton>
        </ButtonGroup>
      </FiltersContainer>
      
      {loading ? (
        <LoadingIndicator>Loading stories...</LoadingIndicator>
      ) : error ? (
        <ErrorMessage>
          <div>Using Sample Stories</div>
          <Button onClick={handleRetry}>Try Again</Button>
        </ErrorMessage>
      ) : stories.length === 0 ? (
        <NoResults>No stories found matching your criteria.</NoResults>
      ) : (
        <>
          <StoriesList>
            {stories.map(story => (
              <StoryCard key={story.id} to={`/stories/${story.id}`}>
                <StoryTitle>{story.title_jp}</StoryTitle>
                <StoryTitle>{story.title_en}</StoryTitle>
                <StoryPreview>
                  {story.content_jp}
                  {story.content_en && `\n\n${story.content_en}`}
                </StoryPreview>
                <StoryMeta>
                  <StoryMetaItem>Level: {story.level}</StoryMetaItem>
                  <StoryMetaItem>Chapter: {story.genki_max_chapter}</StoryMetaItem>
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
                onClick={() => handlePageChange(pagination.offset - pagination.limit)}
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
}

export default Stories;