import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import Container from '../components/layout/Container';

const LoginCard = styled.div`
  background-color: ${({ theme }) => theme.surface};
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  margin: 4rem auto;
  box-shadow: 0 4px 6px ${({ theme }) => theme.shadow};
  text-align: center;
`;

const LoginHeader = styled.h1`
  color: ${({ theme }) => theme.primary};
  margin-bottom: 2rem;
`;

const LoginDescription = styled.p`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const GoogleButton = styled.div`
  display: flex;
  justify-content: center;
  margin: 2rem 0;
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

const Button = styled.button`
  background-color: ${({ theme }) => theme.primary};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.9;
  }
`;

const LoginPage = () => {
  const { isAuthenticated, loginWithGoogle, error, isLoading, debug, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showDebug, setShowDebug] = useState(false);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile');
    }
  }, [isAuthenticated, navigate]);
  
  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google login success:', credentialResponse);
    loginWithGoogle(credentialResponse.credential);
  };
  
  const handleGoogleError = (error) => {
    console.error('Google login failed:', error);
  };
  
  return (
    <Container>
      <LoginCard>
        <LoginHeader>Welcome to Todaku Reader</LoginHeader>
        <LoginDescription>
          Log in to create personalized Japanese reading content,
          track your progress, and build your vocabulary.
        </LoginDescription>
        
        {error && (
          <ErrorMessage>
            <strong>Error:</strong> {error}
            <div>
              <Button onClick={clearError}>Dismiss</Button>
            </div>
          </ErrorMessage>
        )}
        
        <GoogleButton>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            useOneTap
          />
        </GoogleButton>
        
        {isLoading && <p>Logging in...</p>}
        
        <p>
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
      </LoginCard>
    </Container>
  );
};

export default LoginPage; 