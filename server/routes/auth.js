const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/db');
const auth = require('../middleware/auth');

// Initialize URLs based on environment
const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
const API_BASE = isDevelopment ? 'http://localhost:5001' : 'https://todakureader.com';
const CLIENT_BASE = isDevelopment ? 'http://localhost:3001' : 'https://todakureader.com';
const redirectUri = `${API_BASE}/api/auth/google/callback`;

// Debug logging
console.log('[Auth Route] Configuration:');
console.log('- Environment:', process.env.NODE_ENV);
console.log('- API Base:', API_BASE);
console.log('- Client Base:', CLIENT_BASE);
console.log('- Redirect URI:', redirectUri);
console.log('- Google Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Present' : '✗ Missing');
console.log('- Google Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Present' : '✗ Missing');
console.log('- JWT Secret:', process.env.JWT_SECRET ? '✓ Present' : '✗ Missing');

// Initialize OAuth client
const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: redirectUri
});

// @route   GET api/auth/test
// @desc    Test route
// @access  Public
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working', timestamp: new Date().toISOString() });
});

// @route   POST api/auth/google
// @desc    Authenticate user with Google token
// @access  Public
router.post('/google', async (req, res) => {
  const { tokenId } = req.body;

  if (!tokenId) {
    console.error('No tokenId provided in request');
    return res.status(400).json({ message: 'Token ID is required' });
  }

  try {
    console.log('Google auth attempt with token ID:', tokenId.substring(0, 20) + '...');
    
    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;
    console.log('Google token verified for:', email);

    try {
      console.log('Attempting to query users table with googleId:', googleId);
      
      // Check if user exists in database
      const userResult = await db.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );
      
      console.log('User query result:', userResult.rows);
      
      let userId;
      
      if (userResult.rows.length === 0) {
        console.log('User not found, creating new user with email:', email);
        // Create new user
        const newUserResult = await db.query(
          'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
          [googleId, email]
        );
        userId = newUserResult.rows[0].id;
        console.log('New user created with ID:', userId);
      } else {
        // User exists
        userId = userResult.rows[0].id;
      }

      // Create JWT payload
      const jwtPayload = {
        user: {
          id: userId
        }
      };

      // Sign JWT token
      jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error('User query error:', err.message);
      res.status(500).json({ message: 'Server error' });
    }
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const userResult = await db.query(
      'SELECT id, email, wanikani_level, genki_chapter, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error('User fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/auth/google/redirect
// @desc    Redirect to Google OAuth login page
// @access  Public
router.get('/google/redirect', (req, res) => {
  console.log('[Auth Route] Redirecting to Google OAuth page');
  console.log('- Redirect URI:', redirectUri);
  console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Present' : '✗ Missing');
  
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: redirectUri,
    client_id: process.env.GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' ')
  };
  
  const qs = new URLSearchParams(options);
  const authUrl = `${googleAuthUrl}?${qs.toString()}`;
  console.log('- Auth URL:', authUrl);
  res.redirect(authUrl);
});

// @route   GET api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    console.log('[Auth Route] Processing OAuth callback');
    console.log('- Authorization code:', code ? '✓ Present' : '✗ Missing');
    console.log('- Client ID:', process.env.GOOGLE_CLIENT_ID ? '✓ Present' : '✗ Missing');
    console.log('- Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? '✓ Present' : '✗ Missing');
    console.log('- Redirect URI:', redirectUri);

    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    });
    
    console.log('- Token exchange successful');
    
    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;
    console.log('- ID token verified for:', email);
    
    try {
      // Check if user exists in database
      const userResult = await db.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );
      
      let userId;
      
      if (userResult.rows.length === 0) {
        console.log('- Creating new user:', email);
        const newUserResult = await db.query(
          'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
          [googleId, email]
        );
        userId = newUserResult.rows[0].id;
        console.log('- New user created with ID:', userId);
      } else {
        userId = userResult.rows[0].id;
        console.log('- Existing user found with ID:', userId);
      }
      
      // Create JWT payload
      const jwtPayload = {
        user: {
          id: userId
        }
      };
      
      // Sign JWT token
      const token = jwt.sign(
        jwtPayload,
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      
      console.log('- JWT token created successfully');
      console.log('- Redirecting to:', `${CLIENT_BASE}/auth/callback`);
      
      // Redirect to frontend with token
      res.redirect(`${CLIENT_BASE}/auth/callback?token=${token}`);
      
    } catch (err) {
      console.error('[Auth Route] Database error:', err.message);
      res.redirect(`${CLIENT_BASE}/login?error=database_error`);
    }
  } catch (err) {
    console.error('[Auth Route] OAuth error:', err.message);
    res.redirect(`${CLIENT_BASE}/login?error=auth_failed`);
  }
});

module.exports = router; 