// Set up test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.API_BASE = 'http://localhost:5001';
process.env.CLIENT_BASE = 'http://localhost:3001';
process.env.OPENAI_API_KEY = 'test-openai-api-key'; 