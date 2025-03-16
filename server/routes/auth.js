const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db/db');
const auth = require('../middleware/auth');

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

    // Check if user exists in database
    const userResult = await db.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );

    let userId;

    if (userResult.rows.length === 0) {
      // Create new user
      const newUserResult = await db.query(
        'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
        [googleId, email]
      );
      userId = newUserResult.rows[0].id;
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
  const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  const redirectUri = `${process.env.API_URL || 'http://localhost:5001'}/api/auth/google/callback`;
  
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
  res.redirect(`${googleAuthUrl}?${qs.toString()}`);
});

// @route   GET api/auth/google/callback
// @desc    Handle Google OAuth callback
// @access  Public
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  
  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL || 'http://localhost:5001'}/api/auth/google/callback`
    });
    
    // Verify ID token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;
    
    // Check if user exists in database
    const userResult = await db.query(
      'SELECT * FROM users WHERE google_id = $1',
      [googleId]
    );
    
    let userId;
    
    if (userResult.rows.length === 0) {
      // Create new user
      const newUserResult = await db.query(
        'INSERT INTO users (google_id, email) VALUES ($1, $2) RETURNING id',
        [googleId, email]
      );
      userId = newUserResult.rows[0].id;
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
    const token = jwt.sign(
      jwtPayload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    // Redirect to frontend with token
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/auth/callback?token=${token}`);
    
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
});

module.exports = router; 