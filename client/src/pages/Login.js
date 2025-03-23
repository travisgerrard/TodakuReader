import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';

const LoginContainer = styled.div`
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    margin: 1.5rem auto;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem;
    margin: 1rem auto;
    width: 100%;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const Description = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }
`;

const LoginOptions = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 1rem 0;
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  margin-top: 0.5rem;
  
  &:hover {
    background-color: ${({ theme }) => theme.primary}DD;
  }
  
  @media (max-width: 480px) {
    min-height: 44px; /* Better touch target */
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.error};
  background-color: ${({ theme }) => theme.errorLight || '#ffebee'};
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  text-align: left;
`;

const DebugSection = styled.div`
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
  text-align: left;
  border: 1px solid #ddd;
`;

const DebugItem = styled.div`
  margin-bottom: 0.5rem;
  font-family: monospace;
  font-size: 0.8rem;
`;

const DebugTitle = styled.h3`
  margin-bottom: 1rem;
  color: #333;
`;

const LoginPage = () => {
  const { isAuthenticated, error, isLoading, debug, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);
  
  // Inside the LoginPage component, after the useEffect for isAuthenticated
  // Add this useEffect to handle error parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    
    if (errorParam === 'auth_failed') {
      console.error('Google authentication failed');
      // You can set your own error message here if needed
    } else if (errorParam === 'no_token') {
      console.error('No authentication token received');
      // You can set your own error message here if needed
    }
  }, []);
  
  // Function to handle server-side Google login
  const handleServerSideGoogleLogin = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.error('API URL not configured');
      return;
    }
    window.location.href = `${apiUrl}/auth/google/redirect`;
  };
  
  return (
    <Container>
      <LoginContainer>
        <Title>Welcome to Todaku</Title>
        <Description>
          Log in with Google to access personalized Japanese learning content and track your progress.
        </Description>
        
        {error && (
          <ErrorMessage>
            <strong>Error:</strong> {error}
            <div>
              <Button onClick={clearError}>Dismiss</Button>
            </div>
          </ErrorMessage>
        )}
        
        <LoginOptions>
          <div style={{ marginTop: '1rem', width: '100%', maxWidth: '240px' }}>
            <Button 
              onClick={handleServerSideGoogleLogin}
              style={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#fff',
                color: '#757575',
                border: '1px solid #757575',
                padding: '10px 15px',
                borderRadius: '4px'
              }}
            >
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google logo" 
                style={{ width: '18px', height: '18px' }} 
              />
              Sign in with Google
            </Button>
          </div>
        </LoginOptions>
        
        {isLoading && <p>Logging in...</p>}
        
        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          By logging in, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
        </p>
        
        <Button onClick={() => setShowDebug(!showDebug)}>
          {showDebug ? 'Hide' : 'Show'} Debug Info
        </Button>
        
        {showDebug && (
          <DebugSection>
            <DebugTitle>Debug Information</DebugTitle>
            
            <DebugItem>
              <strong>Current URL:</strong> {window.location.href}
            </DebugItem>
            
            <DebugItem>
              <strong>Google Client ID:</strong> {debug.googleClientId || 'Not set'}
            </DebugItem>
            
            <DebugItem>
              <strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'Not set'}
            </DebugItem>
            
            <DebugTitle>Recent Logs</DebugTitle>
            {debug.logs.slice(-5).map((log, index) => (
              <DebugItem key={index}>
                <div><strong>[{log.timestamp}]</strong> {log.message}</div>
                {log.data && <pre>{JSON.stringify(log.data, null, 2)}</pre>}
              </DebugItem>
            ))}
          </DebugSection>
        )}
      </LoginContainer>
    </Container>
  );
};

export default LoginPage; 