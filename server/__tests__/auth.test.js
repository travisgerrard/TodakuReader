const request = require('supertest');
const express = require('express');

describe('Auth Configuration', () => {
  test('Required environment variables are present', () => {
    expect(process.env.GOOGLE_CLIENT_ID).toBeDefined();
    expect(process.env.GOOGLE_CLIENT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('OAuth configuration is correct', () => {
    const API_BASE = process.env.API_BASE;
    const CLIENT_BASE = process.env.CLIENT_BASE;
    const redirectUri = `${API_BASE}/api/auth/google/callback`;

    expect(API_BASE).toBe('http://localhost:5001');
    expect(CLIENT_BASE).toBe('http://localhost:3001');
    expect(redirectUri).toBe('http://localhost:5001/api/auth/google/callback');
  });
});

describe('Auth Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', require('../routes/auth'));
  });

  test('GET /api/auth/test returns success', async () => {
    const response = await request(app).get('/api/auth/test');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Auth route is working');
  });

  test('GET /api/auth/google/redirect sets up correct OAuth URL', async () => {
    const response = await request(app)
      .get('/api/auth/google/redirect')
      .expect(302); // Expect redirect

    const location = response.headers.location;
    expect(location).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(location).toContain(encodeURIComponent('http://localhost:5001/api/auth/google/callback'));
    expect(location).toContain(encodeURIComponent(process.env.GOOGLE_CLIENT_ID));
  });
}); 