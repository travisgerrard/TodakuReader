import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  z-index: 1000;
  
  &:hover {
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    right: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
    width: 70%;
    max-width: 300px;
    height: 100vh;
    flex-direction: column;
    justify-content: center;
    background-color: ${({ theme }) => theme.surface};
    box-shadow: -2px 0 5px ${({ theme }) => theme.shadow};
    transition: right 0.3s ease-in-out;
    z-index: 999;
    padding: 2rem;
    gap: 2rem;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme, active }) => active ? theme.primary : theme.textSecondary};
  text-decoration: none;
  padding: 0.5rem;
  
  &:hover, &.active {
    color: ${({ theme }) => theme.primary};
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.75rem;
    width: 100%;
    text-align: center;
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
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    padding: 0.75rem;
    width: 100%;
    justify-content: center;
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
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
    padding: 0.75rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.25rem;
  }
`;

const UserName = styled.span`
  color: ${({ theme }) => theme.textSecondary};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${({ theme }) => theme.textSecondary};
  cursor: pointer;
  z-index: 1000;
  
  &:hover {
    color: ${({ theme }) => theme.primary};
  }
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const Overlay = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 998;
  }
`;

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <NavContainer>
        <Logo to="/" onClick={closeMenu}>泊書 Todaku</Logo>
        
        <HamburgerButton onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? '✕' : '☰'}
        </HamburgerButton>
        
        <NavLinks isOpen={isMenuOpen}>
          <NavLink to="/" active={isActive('/')} onClick={closeMenu}>Home</NavLink>
          <NavLink to="/stories" active={isActive('/stories')} onClick={closeMenu}>Stories</NavLink>
          <NavLink to="/grammar" active={isActive('/grammar')} onClick={closeMenu}>Grammar</NavLink>
          <NavLink to="/vocabulary" active={isActive('/vocabulary')} onClick={closeMenu}>Vocabulary</NavLink>
          
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
              <NavLink to="/profile" active={isActive('/profile')} onClick={closeMenu}>Profile</NavLink>
              <Button onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <NavLink to="/login" active={isActive('/login')} onClick={closeMenu}>Login</NavLink>
          )}
        </NavLinks>
      </NavContainer>
      <Overlay isOpen={isMenuOpen} onClick={closeMenu} />
    </>
  );
};

export default Navbar; 