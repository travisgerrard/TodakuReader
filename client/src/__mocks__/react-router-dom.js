// Mock for react-router-dom
import React from 'react';

// Create simple mock implementations
const Link = ({ children, to, ...props }) => (
  <a href={to} {...props} data-testid="mock-link">
    {children}
  </a>
);

const useNavigate = () => jest.fn();
const useParams = () => ({});
const useLocation = () => ({ pathname: '/', search: '', hash: '', state: null });
const MemoryRouter = ({ children }) => <div data-testid="mock-router">{children}</div>;

export {
  Link,
  useNavigate,
  useParams,
  useLocation,
  MemoryRouter
}; 