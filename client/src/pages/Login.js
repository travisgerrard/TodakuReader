import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { GoogleLogin } from '@react-oauth/google';
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
  gap: 1.5rem;
  align-items: center;
  
  @media (max-width: 480px) {
    gap: 1.25rem;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  width: 100%;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.border};
  }
  
  span {
    padding: 0 1rem;
    color: ${({ theme }) => theme.textSecondary};
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    margin: 1.25rem 0;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: ${({ theme }) => theme.text};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  
  @media (max-width: 480px) {
    padding: 0.7rem;
  }
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

const GoogleLoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  
  /* Custom styling for Google button to ensure it's responsive */
  div {
    width: 100% !important;
  }
  
  button {
    width: 100% !important;
    border-radius: 4px !important;
    min-height: 44px !important; /* Better touch target */
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // This is just a placeholder for email/password login
    console.log('Form submitted');
  };
  
  return (
    <Container>
      <LoginContainer>
        <Title>Welcome to Todaku</Title>
        <Description>
          Log in to access personalized Japanese learning content and track your progress.
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
          <GoogleLoginWrapper>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              text="continue_with"
              shape="pill"
              locale="en"
              width="100%"
            />
          </GoogleLoginWrapper>
        </LoginOptions>
        
        <Divider>
          <span>OR</span>
        </Divider>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" name="email" placeholder="Enter your email" required />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input type="password" id="password" name="password" placeholder="Enter your password" required />
          </FormGroup>
          
          <Button type="submit">Log in with Email</Button>
        </Form>
        
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
      </LoginContainer>
    </Container>
  );
};

export default LoginPage; 