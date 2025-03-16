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

module.exports = router; 