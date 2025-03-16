import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.surface};
  padding: 1.5rem 2rem;
  box-shadow: 0 -2px 4px ${({ theme }) => theme.shadow};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  font-size: 0.9rem;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
  margin: 0;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {currentYear} Todaku Reader. All rights reserved.
        </Copyright>
        <FooterLinks>
          <FooterLink to="/about">About</FooterLink>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer; 