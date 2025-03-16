import React from 'react';
import styled from 'styled-components';

const StyledContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: calc(100vh - 180px); /* Account for navbar and footer */
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Container = ({ children }) => {
  return <StyledContainer>{children}</StyledContainer>;
};

export default Container; 