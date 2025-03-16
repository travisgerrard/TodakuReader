import React, { createContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';

// Define light and dark themes
const lightTheme = {
  primary: '#4A90E2',
  secondary: '#6FCF97',
  background: '#FFFFFF',
  surface: '#F5F7FA',
  text: '#333333',
  textSecondary: '#666666',
  error: '#EB5757',
  border: '#E0E0E0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  success: '#27AE60',
  warning: '#F2C94C',
  furigana: '#888888',
  primaryLight: '#E6F0FF',
  secondaryLight: '#E6F7EF'
};

const darkTheme = {
  primary: '#5B9FEF',
  secondary: '#6FCF97',
  background: '#1A1A1A',
  surface: '#2C2C2C',
  text: '#F0F0F0',
  textSecondary: '#B0B0B0',
  error: '#EB5757',
  border: '#444444',
  shadow: 'rgba(0, 0, 0, 0.3)',
  success: '#27AE60',
  warning: '#F2C94C',
  furigana: '#A0A0A0',
  primaryLight: '#2A3A4F',
  secondaryLight: '#2A3F36'
};

// Create theme context
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check if user has previous theme preference in localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('darkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  const theme = isDarkMode ? darkTheme : lightTheme;

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}; 