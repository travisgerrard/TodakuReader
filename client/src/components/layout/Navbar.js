import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

const NavContainer = styled.nav`
  background-color: ${({ theme }) => theme.surface};
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px ${({ theme }) => theme.shadow};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  
  &:hover {
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  padding: 0.5rem;
  
  &:hover, &.active {
    color: ${({ theme }) => theme.primary};
  }
`;

const Button = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.textSecondary};
  padding: 0.5rem;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
    background-color: transparent;
  }
`;

const ThemeToggle = styled.button`
  background-color: transparent;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.2rem;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
    background-color: transparent;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.textSecondary};
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <NavContainer>
      <Logo to="/">泊書 Todaku</Logo>
      
      <NavLinks>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/stories">Stories</NavLink>
        <NavLink to="/grammar">Grammar</NavLink>
        <NavLink to="/vocabulary">Vocabulary</NavLink>
        
        <ThemeToggle onClick={toggleTheme}>
          {isDarkMode ? '☀️' : '🌙'}
        </ThemeToggle>
        
        {isAuthenticated ? (
          <>
            <UserInfo>
              <UserName>
                WK: {user?.wanikani_level || 1} | Genki: {user?.genki_chapter || 1}
              </UserName>
            </UserInfo>
            <NavLink to="/profile">Profile</NavLink>
            <Button onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <NavLink to="/login">Login</NavLink>
        )}
      </NavLinks>
    </NavContainer>
  );
};

export default Navbar; 