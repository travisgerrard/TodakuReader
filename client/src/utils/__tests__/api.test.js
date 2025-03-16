import api from '../api';

describe('API Utility', () => {
  // Test API base URL configuration
  test('should be configured with the correct base URL', () => {
    expect(api.defaults.baseURL).toBe('http://localhost:5001/api');
  });
}); 