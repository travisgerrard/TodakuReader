import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';
import api from '../utils/api';
import { mockVocabulary, getMockData } from '../utils/mockData';

const PageHeader = styled.div`
  margin: 2rem 0;
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
  max-width: 800px;
`;

const SearchContainer = styled.div`
  background-color: ${({ theme }) => theme.surface};
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
`;

const SearchForm = styled.form`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Input = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
`;

const Select = styled.select`
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
`;

const ClearButton = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0.75rem 1.5rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${({ theme }) => theme.background};
  }
`;

const FiltersTitle = styled.h3`
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
  font-size: 1.1rem;
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const VocabCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px ${({ theme }) => theme.shadow};
  }
`;

const VocabWord = styled.h3`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 0.5rem;
`;

const VocabReading = styled.div`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const VocabMeaning = styled.div`
  margin-bottom: 1rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.text};
`;

const VocabMeta = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const VocabLevel = styled.span`
  background-color: ${({ theme }) => theme.primaryLight};
  color: ${({ theme }) => theme.primary};
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
`;

const ExampleText = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.background};
  border-radius: 4px;
  font-size: 0.9rem;
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
  background-color: ${({ theme }) => theme.background};
  border-radius: 8px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  background-color: ${({ active, theme }) => active ? theme.primary : theme.background};
  color: ${({ active, theme }) => active ? 'white' : theme.text};
  border: 1px solid ${({ active, theme }) => active ? theme.primary : theme.border};
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ active, theme }) => active ? theme.primary : theme.surface};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.primaryDark || theme.primary + 'DD'};
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const OfflineModeToggle = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  
  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    color: ${({ theme }) => theme.textSecondary};
    font-size: 0.9rem;
  }
  
  input {
    margin-right: 0.5rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const OfflineButton = styled(RetryButton)`
  background-color: ${({ theme }) => theme.secondary || '#666'};
  
  &:hover {
    background-color: ${({ theme }) => theme.secondaryDark || '#555'};
  }
`;

const VocabularyBrowser = () => {
  const { isAuthenticated } = useContext(AuthContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [jlptLevel, setJlptLevel] = useState('');
  const [wanikaniLevel, setWanikaniLevel] = useState('');
  const [tadokuLevel, setTadokuLevel] = useState('');
  
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Use offline mode settings from localStorage
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem('vocab_offline_mode') === 'true';
    setOfflineMode(savedOfflineMode);
  }, []);

  // Try to load cached data on initial load
  useEffect(() => {
    const cachedData = localStorage.getItem('vocabulary_cache');
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        if (parsedData && parsedData.timestamp && (Date.now() - parsedData.timestamp < 86400000)) { // Cache valid for 24 hours
          console.log('[VocabularyBrowser] Using cached vocabulary data');
          setVocabulary(parsedData.vocabulary);
          setTotalPages(parsedData.totalPages);
          setLoading(false);
        } else {
          // Cache is old, fetch fresh data
          fetchVocabulary();
        }
      } catch (err) {
        console.error('Error parsing cached vocabulary data:', err);
        fetchVocabulary();
      }
    } else {
      fetchVocabulary();
    }
  }, []);
  
  // When current page changes, fetch data if not in offline mode
  useEffect(() => {
    if (!offlineMode && currentPage > 1) {
      fetchVocabulary(currentPage);
    }
  }, [currentPage, offlineMode]);
  
  const fetchVocabulary = useCallback(async (page = currentPage) => {
    if (!loading) setLoading(true);
    setError('');
    
    // If offline mode is enabled, use mock data
    if (offlineMode) {
      console.log('[VocabularyBrowser] Using offline mode with mock data');
      try {
        const data = await getMockData('vocabulary', 500); // Simulate API delay
        setVocabulary(data.vocabulary);
        setTotalPages(Math.ceil(data.vocabulary.length / 12)); // Assuming 12 items per page
        setCurrentPage(page);
        setLoading(false);
        return;
      } catch (err) {
        console.error('Error loading mock data:', err);
        setError('Failed to load mock data in offline mode.');
        setLoading(false);
        return;
      }
    }
    
    // Online mode - fetch from API
    try {
      const params = {
        page,
        limit: 12,
        search: searchTerm,
        search_type: searchType
      };
      
      if (jlptLevel) params.jlpt_level = jlptLevel;
      if (wanikaniLevel) params.wanikani_level = wanikaniLevel;
      if (tadokuLevel) params.tadoku_level = tadokuLevel;
      
      console.log('[VocabularyBrowser] Fetching vocabulary with params:', params);
      const res = await api.get('/vocab', { params });
      
      // Check if response has the expected structure
      if (!res.data || (!res.data.vocabulary && !Array.isArray(res.data))) {
        console.error('Invalid API response structure:', res.data);
        throw new Error('Invalid API response format');
      }
      
      // Handle different response formats (array or object with vocabulary property)
      const vocabData = Array.isArray(res.data) ? res.data : res.data.vocabulary;
      const totalPagesData = res.data.total_pages || 
                           (res.data.pagination && res.data.pagination.total_pages) || 1;
      
      setVocabulary(vocabData);
      setTotalPages(totalPagesData);
      setCurrentPage(page);
      setRetryCount(0); // Reset retry count on success
      
      // Cache the data in localStorage
      try {
        localStorage.setItem('vocabulary_cache', JSON.stringify({
          vocabulary: vocabData,
          totalPages: totalPagesData,
          timestamp: Date.now()
        }));
      } catch (cacheErr) {
        console.error('Error caching vocabulary data:', cacheErr);
      }
    } catch (err) {
      console.error('[VocabularyBrowser] Vocabulary fetch error:', err);
      
      // After max retries, try to use cached data
      if (retryCount >= 2) {
        const cachedData = localStorage.getItem('vocabulary_cache');
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            console.log('[VocabularyBrowser] API failed, using cached data');
            setVocabulary(parsedData.vocabulary);
            setTotalPages(parsedData.totalPages);
            setError('Using cached data - some information may be outdated');
            setLoading(false);
            return;
          } catch (cacheErr) {
            console.error('Error parsing cached vocabulary data:', cacheErr);
          }
        }
        
        // If no cache, fallback to mock data
        console.log('[VocabularyBrowser] API failed, using mock data as fallback');
        setVocabulary(mockVocabulary.vocabulary);
        setTotalPages(Math.ceil(mockVocabulary.vocabulary.length / 12));
        setError('Unable to connect to server. Showing sample data instead.');
      } else {
        // If we haven't exceeded retry attempts, try again after a delay
        setError('Failed to load vocabulary. Please try again later.');
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchVocabulary(page);
        }, 2000); // Retry after 2 seconds
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, searchType, jlptLevel, wanikaniLevel, tadokuLevel, retryCount, offlineMode]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVocabulary(1);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    setSearchType('all');
    setJlptLevel('');
    setWanikaniLevel('');
    setTadokuLevel('');
    setCurrentPage(1);
    fetchVocabulary(1);
  };
  
  const handleRetry = () => {
    setRetryCount(0);
    fetchVocabulary(currentPage);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (!offlineMode) {
      fetchVocabulary(page);
    }
  };
  
  const toggleOfflineMode = () => {
    const newMode = !offlineMode;
    setOfflineMode(newMode);
    localStorage.setItem('vocab_offline_mode', newMode.toString());
    
    if (newMode) {
      // Switching to offline mode - load mock data
      getMockData('vocabulary')
        .then(data => {
          if (data && data.vocabulary) {
            setVocabulary(data.vocabulary);
            setTotalPages(Math.ceil(data.vocabulary.length / 12));
            setCurrentPage(1);
          } else {
            // Fallback for tests or if getMockData fails
            console.log('[VocabularyBrowser] Using fallback mock data');
            setVocabulary(mockVocabulary.vocabulary);
            setTotalPages(Math.ceil(mockVocabulary.vocabulary.length / 12));
            setCurrentPage(1);
          }
        })
        .catch(err => {
          console.error('[VocabularyBrowser] Error loading mock data:', err);
          // Fallback to direct mock data
          setVocabulary(mockVocabulary.vocabulary);
          setTotalPages(Math.ceil(mockVocabulary.vocabulary.length / 12));
          setCurrentPage(1);
        });
    } else {
      // Switching to online mode - fetch real data
      fetchVocabulary(1);
    }
  };
  
  return (
    <Container>
      <PageHeader>
        <Title>Vocabulary Browser</Title>
        <Description>
          Search and explore Japanese vocabulary words. Filter by level to find words matching your
          current study progress, or search for specific terms.
        </Description>
        <OfflineModeToggle>
          <label>
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={toggleOfflineMode}
            />
            Offline Mode (Use sample data)
          </label>
        </OfflineModeToggle>
      </PageHeader>
      
      <SearchContainer>
        <SearchForm onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="Search for vocabulary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={offlineMode}
          />
          
          <Select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            disabled={offlineMode}
          >
            <option value="all">All Fields</option>
            <option value="word">Japanese Word</option>
            <option value="reading">Reading</option>
            <option value="meaning">English Meaning</option>
          </Select>
          
          <Button type="submit" disabled={offlineMode}>Search</Button>
          <ClearButton type="button" onClick={handleClear} disabled={offlineMode}>Clear</ClearButton>
        </SearchForm>
        
        <FiltersTitle>Filters</FiltersTitle>
        <FiltersRow>
          <FilterGroup>
            <FilterLabel htmlFor="jlpt_level">JLPT Level:</FilterLabel>
            <Select
              id="jlpt_level"
              value={jlptLevel}
              onChange={(e) => setJlptLevel(e.target.value)}
              disabled={offlineMode}
            >
              <option value="">Any</option>
              <option value="N5">N5 (Beginner)</option>
              <option value="N4">N4</option>
              <option value="N3">N3</option>
              <option value="N2">N2</option>
              <option value="N1">N1 (Advanced)</option>
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="wanikani_level">WaniKani Level:</FilterLabel>
            <Select
              id="wanikani_level"
              value={wanikaniLevel}
              onChange={(e) => setWanikaniLevel(e.target.value)}
              disabled={offlineMode}
            >
              <option value="">Any</option>
              {[...Array(60)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </Select>
          </FilterGroup>
          
          <FilterGroup>
            <FilterLabel htmlFor="tadoku_level">Tadoku Level:</FilterLabel>
            <Select
              id="tadoku_level"
              value={tadokuLevel}
              onChange={(e) => setTadokuLevel(e.target.value)}
              disabled={offlineMode}
            >
              <option value="">Any</option>
              {[...Array(5)].map((_, i) => (
                <option key={i+1} value={i+1}>{i+1}</option>
              ))}
            </Select>
          </FilterGroup>
        </FiltersRow>
      </SearchContainer>
      
      {loading ? (
        <LoadingIndicator>Loading vocabulary...</LoadingIndicator>
      ) : error ? (
        <div>
          <NoResults>{error}</NoResults>
          {!error.includes('sample data') && (
            <ButtonGroup>
              <RetryButton onClick={handleRetry}>Retry</RetryButton>
              {!offlineMode && (
                <OfflineButton onClick={toggleOfflineMode}>Use Offline Mode</OfflineButton>
              )}
            </ButtonGroup>
          )}
        </div>
      ) : vocabulary.length === 0 ? (
        <NoResults>No vocabulary words found matching your criteria.</NoResults>
      ) : (
        <>
          <ResultsGrid>
            {vocabulary.map((word, index) => (
              <VocabCard key={word.id || index}>
                <VocabWord>{word.word}</VocabWord>
                <VocabReading>{word.reading}</VocabReading>
                <VocabMeaning>{word.meaning}</VocabMeaning>
                <VocabMeta>
                  {word.jlpt_level && <span>JLPT: {word.jlpt_level}</span>}
                  {word.wanikani_level && <span>WK: Level {word.wanikani_level}</span>}
                </VocabMeta>
                <VocabLevel>Tadoku Level {word.tadoku_level || 1}</VocabLevel>
                
                {word.example_sentence && (
                  <ExampleText>
                    <div>{word.example_sentence}</div>
                    <div>{word.example_meaning}</div>
                  </ExampleText>
                )}
                {word.examples && word.examples.length > 0 && (
                  <ExampleText>
                    <div>{word.examples[0].japanese}</div>
                    <div>{word.examples[0].english}</div>
                  </ExampleText>
                )}
              </VocabCard>
            ))}
          </ResultsGrid>
          
          <Pagination>
            <PageButton
              disabled={currentPage === 1}
              onClick={() => handlePageChange(1)}
            >
              First
            </PageButton>
            <PageButton
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </PageButton>
            
            {[...Array(totalPages)].map((_, i) => {
              // Show only 5 page buttons centered around current page
              if (
                i === 0 ||
                i === totalPages - 1 ||
                (i >= currentPage - 2 && i <= currentPage + 2)
              ) {
                return (
                  <PageButton
                    key={i+1}
                    active={currentPage === i+1 ? 'true' : 'false'}
                    onClick={() => handlePageChange(i+1)}
                  >
                    {i+1}
                  </PageButton>
                );
              }
              // Show ellipsis for skipped pages
              if (i === currentPage - 3 || i === currentPage + 3) {
                return <span key={i}>...</span>;
              }
              return null;
            })}
            
            <PageButton
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </PageButton>
            <PageButton
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(totalPages)}
            >
              Last
            </PageButton>
          </Pagination>
        </>
      )}
    </Container>
  );
};

export default VocabularyBrowser; 