# Testing Documentation

This document describes the testing setup for the Todaku Reader application.

## Overview

The application uses the following testing tools:

- **Jest**: The testing framework
- **React Testing Library**: For testing React components
- **axios-mock-adapter**: For mocking API requests

## Test Structure

Tests are organized by component type:

- `client/src/utils/__tests__/`: Tests for utility functions and helpers
- `client/src/context/__tests__/`: Tests for context providers
- `client/src/pages/__tests__/`: Tests for page components

## Running Tests

To run all tests, use the provided script:

```bash
./run-tests.sh
```

Or run tests directly with npm:

```bash
# Run all tests
cd client && npm test

# Run tests in watch mode
cd client && npm test

# Run a specific test file
cd client && npm test -- src/context/__tests__/AuthContext.test.js
```

## Test Mocks

The testing setup includes the following mocks:

1. **LocalStorage**: Mocked to allow testing authentication functions
2. **API Calls**: Using axios-mock-adapter to prevent actual API calls
3. **Environment Variables**: Mocked in the setupTests.js file
4. **React Router**: Navigation functions are mocked

## Writing Tests

### Component Tests

When testing components, follow these patterns:

1. **Render in Context**: Most components need to be wrapped in the appropriate providers
   ```jsx
   render(
     <MemoryRouter>
       <ThemeProvider>
         <AuthContext.Provider value={mockAuthContext}>
           <YourComponent />
         </AuthContext.Provider>
       </ThemeProvider>
     </MemoryRouter>
   );
   ```

2. **Wait for Async Operations**: Use `waitFor` for asynchronous operations
   ```jsx
   await waitFor(() => {
     expect(screen.getByText('Expected Text')).toBeInTheDocument();
   });
   ```

3. **Test Error States**: Always include tests for error handling
   ```jsx
   api.get.mockRejectedValueOnce(new Error('Test error'));
   // Render component and verify error handling
   ```

### API Tests

For testing API calls, use the axios-mock-adapter:

```jsx
const mockAxios = new MockAdapter(axios);

// Mock a successful response
mockAxios.onGet('/api/some-endpoint').reply(200, { data: 'response' });

// Mock an error response
mockAxios.onPost('/api/login').reply(401, { message: 'Unauthorized' });
```

## Test Coverage

To run tests with coverage report:

```bash
cd client && npm test -- --coverage
```

## Continuous Integration

Tests will run automatically on pull requests through GitHub Actions to ensure code quality. 