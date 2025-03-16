import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  padding: 0 20px;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const AuthCallback = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const error = params.get('error');

      if (error) {
        console.error('Authentication error:', error);
        navigate('/login?error=auth_failed');
        return;
      }

      if (token) {
        // Store the token in localStorage
        localStorage.setItem('token', token);
        
        // Redirect to profile page
        navigate('/profile');
      } else {
        // No token found in URL
        navigate('/login?error=no_token');
      }
    };

    // If already authenticated, redirect to profile
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      handleCallback();
    }
  }, [navigate, location, isAuthenticated]);

  return (
    <LoadingContainer>
      <Spinner />
      <h2>Completing login...</h2>
      <p>Please wait while we authenticate you.</p>
    </LoadingContainer>
  );
};

export default AuthCallback; 