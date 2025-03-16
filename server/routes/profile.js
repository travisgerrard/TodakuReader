const express = require('express');
const router = express.Router();
const db = require('../db/db');
const auth = require('../middleware/auth');

// @route   GET api/profile
// @desc    Get current user's profile
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // Get user profile
    const userResult = await db.query(
      'SELECT id, email, wanikani_level, genki_chapter, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's read stories
    const storiesResult = await db.query(
      `SELECT s.id, s.content_jp, s.content_en, s.tadoku_level, s.topic, us.read_at
       FROM stories s
       JOIN user_stories us ON s.id = us.story_id
       WHERE us.user_id = $1
       ORDER BY us.read_at DESC
       LIMIT 10`,
      [req.user.id]
    );
    
    // Get count of stories created by user
    const createdStoriesResult = await db.query(
      'SELECT COUNT(*) FROM stories WHERE user_id = $1',
      [req.user.id]
    );
    
    // Get total number of unique vocabulary encountered
    const vocabResult = await db.query(
      `SELECT COUNT(DISTINCT sv.vocab_id) 
       FROM stories s
       JOIN user_stories us ON s.id = us.story_id
       JOIN story_vocabulary sv ON s.id = sv.story_id
       WHERE us.user_id = $1`,
      [req.user.id]
    );
    
    res.json({
      user: userResult.rows[0],
      recently_read_stories: storiesResult.rows,
      stats: {
        stories_created: parseInt(createdStoriesResult.rows[0].count),
        stories_read: storiesResult.rows.length,
        vocabulary_encountered: parseInt(vocabResult.rows[0].count || 0)
      }
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const { wanikani_level, genki_chapter } = req.body;
    
    // Validate input
    if (!wanikani_level && !genki_chapter) {
      return res.status(400).json({ message: 'No update data provided' });
    }
    
    let updateFields = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (wanikani_level !== undefined) {
      updateFields.push(`wanikani_level = $${paramIndex++}`);
      queryParams.push(wanikani_level);
    }
    
    if (genki_chapter !== undefined) {
      updateFields.push(`genki_chapter = $${paramIndex++}`);
      queryParams.push(genki_chapter);
    }
    
    // Add user ID as the last parameter
    queryParams.push(req.user.id);
    
    // Update user
    const result = await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, wanikani_level, genki_chapter`,
      queryParams
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/profile/read/:story_id
// @desc    Mark a story as read
// @access  Private
router.post('/read/:story_id', auth, async (req, res) => {
  try {
    const { story_id } = req.params;
    
    // Check if story exists
    const storyResult = await db.query(
      'SELECT id FROM stories WHERE id = $1',
      [story_id]
    );
    
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Check if already read
    const readResult = await db.query(
      'SELECT * FROM user_stories WHERE user_id = $1 AND story_id = $2',
      [req.user.id, story_id]
    );
    
    if (readResult.rows.length > 0) {
      // Update read timestamp
      await db.query(
        'UPDATE user_stories SET read_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND story_id = $2',
        [req.user.id, story_id]
      );
    } else {
      // Insert new read record
      await db.query(
        'INSERT INTO user_stories (user_id, story_id) VALUES ($1, $2)',
        [req.user.id, story_id]
      );
    }
    
    res.json({ message: 'Story marked as read' });
  } catch (err) {
    console.error('Mark read error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/profile/stories
// @desc    Get stories created by the user
// @access  Private
router.get('/stories', auth, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    // Get stories created by the user
    const storiesResult = await db.query(
      `SELECT id, content_jp, content_en, tadoku_level, wanikani_max_level, 
              genki_max_chapter, length_category, topic, upvotes, created_at
       FROM stories
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );
    
    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM stories WHERE user_id = $1',
      [req.user.id]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      stories: storiesResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (err) {
    console.error('User stories fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 