// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import React from 'react';

// Mock the window.matchMedia function
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn().mockReturnValue(null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock environment variables
process.env.REACT_APP_API_URL = 'http://localhost:5001/api';
process.env.REACT_APP_GOOGLE_CLIENT_ID = 'test-client-id';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    defaults: {
      baseURL: 'http://localhost:5001/api',
      headers: {}
    },
    interceptors: {
      request: {
        use: jest.fn()
      },
      response: {
        use: jest.fn()
      }
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }),
  defaults: {
    baseURL: '',
    headers: {}
  },
  interceptors: {
    request: {
      use: jest.fn()
    },
    response: {
      use: jest.fn()
    }
  },
  get: jest.fn(),
  post: jest.fn()
}));

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn().mockReturnValue({ exp: Date.now() / 1000 + 3600 })
}));
