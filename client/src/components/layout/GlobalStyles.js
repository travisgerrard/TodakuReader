import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Noto Sans JP', 'Noto Sans', sans-serif;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    transition: all 0.3s ease;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.text};
  }
  
  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }
  
  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  button {
    cursor: pointer;
    border: none;
    border-radius: 4px;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    background-color: ${({ theme }) => theme.primary};
    color: white;
    transition: background-color 0.3s ease;
  }
  
  button:hover {
    background-color: ${({ theme }) => theme.primary}DD;
  }
  
  button:disabled {
    background-color: ${({ theme }) => theme.border};
    cursor: not-allowed;
  }
  
  input, select, textarea {
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.border};
    border-radius: 4px;
    font-size: 1rem;
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
  }
  
  /* Focus styles for better accessibility */
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.primary}33;
  }
  
  /* Japanese text specific styles */
  .japanese-text {
    line-height: 2;
    font-size: 1.2rem;
  }
  
  /* Furigana styles */
  ruby {
    ruby-align: center;
  }
  
  rt {
    font-size: 0.6em;
    color: ${({ theme }) => theme.furigana};
  }
`;

export default GlobalStyles; 