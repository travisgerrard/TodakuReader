import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    --font-size-base: 16px;
    --font-size-small: 0.875rem;
    --font-size-medium: 1rem;
    --font-size-large: 1.25rem;
    --font-size-xlarge: 1.5rem;
    --font-size-xxlarge: 2rem;
    
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    @media (max-width: 768px) {
      --font-size-base: 14px;
      --spacing-xl: 1.5rem;
      --spacing-lg: 1rem;
    }
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: var(--font-size-base);
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: all 0.3s ease;
    overflow-x: hidden; /* Prevent horizontal scrolling */
    line-height: 1.6;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: var(--spacing-md);
    color: ${({ theme }) => theme.text};
    line-height: 1.3;
  }
  
  h1 {
    font-size: var(--font-size-xxlarge);
    
    @media (max-width: 768px) {
      font-size: 1.75rem;
    }
  }
  
  h2 {
    font-size: var(--font-size-xlarge);
    
    @media (max-width: 768px) {
      font-size: 1.35rem;
    }
  }
  
  h3 {
    font-size: var(--font-size-large);
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
  
  p {
    margin-bottom: var(--spacing-md);
    line-height: 1.6;
  }
  
  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  /* Make all touch targets at least 44x44px for better mobile usability */
  button, 
  input[type="button"], 
  input[type="submit"],
  input[type="reset"],
  a.button {
    min-height: 44px;
    min-width: 44px;
  }
  
  button {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-medium);
    background-color: ${({ theme }) => theme.primary};
    color: white;
    transition: background-color 0.3s ease;
    touch-action: manipulation;
  }
  
  button:hover {
    background-color: ${({ theme }) => theme.primary}DD;
  }
  
  button:disabled {
    background-color: ${({ theme }) => theme.border};
    cursor: not-allowed;
  }
  
  input, select, textarea {
    padding: var(--spacing-sm);
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    font-size: var(--font-size-medium);
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    
    @media (max-width: 768px) {
      font-size: 16px; /* Prevent auto-zoom on mobile */
      width: 100%;
    }
  }
  
  /* Focus styles for better accessibility */
  input:focus, select:focus, textarea:focus, button:focus, a:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }
  
  /* Japanese text specific styles */
  .japanese-text {
    line-height: 2;
    font-size: 1.2rem;
    
    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }
  
  /* Furigana styles */
  ruby {
    ruby-align: center;
  }
  
  rt {
    font-size: 0.6em;
    color: ${({ theme }) => theme.furigana};
  }
  
  /* Utility classes */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
  
  /* Ensure touch areas have proper spacing */
  .touch-friendly {
    padding: var(--spacing-md);
  }
  
  /* Fix scrollbar jumping issue */
  html {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.border} transparent;
  }
  
  /* Support for smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  @media (prefers-reduced-motion) {
    html {
      scroll-behavior: auto;
    }
  }
`;

export default GlobalStyles; 