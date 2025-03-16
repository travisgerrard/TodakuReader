const express = require('express');
const router = express.Router();
const db = require('../db/db');

// @route   GET api/vocab
// @desc    Get vocabulary with search and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    
    let queryParams = [];
    let whereClause = '';
    let paramIndex = 1;
    
    if (search) {
      whereClause = `WHERE word ILIKE $${paramIndex} OR reading ILIKE $${paramIndex} OR meaning ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    // Add pagination
    queryParams.push(parseInt(limit));
    queryParams.push(parseInt(offset));
    
    const vocabResult = await db.query(
      `SELECT id, word, reading, meaning, example_sentence_jp, example_sentence_en
       FROM vocabulary
       ${whereClause}
       ORDER BY word
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      queryParams
    );
    
    // Get total count for pagination
    const countResult = await db.query(
      `SELECT COUNT(*) FROM vocabulary ${whereClause}`,
      search ? [queryParams[0]] : []
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      vocabulary: vocabResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Vocabulary fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/vocab/:id
// @desc    Get vocabulary by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get vocabulary details
    const vocabResult = await db.query(
      'SELECT * FROM vocabulary WHERE id = $1',
      [id]
    );
    
    if (vocabResult.rows.length === 0) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    
    // Get stories that use this vocabulary
    const storiesResult = await db.query(
      `SELECT s.id, s.content_jp, s.content_en, s.tadoku_level, s.topic
       FROM stories s
       JOIN story_vocabulary sv ON s.id = sv.story_id
       WHERE sv.vocab_id = $1
       ORDER BY s.created_at DESC
       LIMIT 5`,
      [id]
    );
    
    res.json({
      ...vocabResult.rows[0],
      related_stories: storiesResult.rows
    });
  } catch (err) {
    console.error('Vocabulary detail fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/vocab/:word/stories
// @desc    Get stories containing a specific word
// @access  Public
router.get('/:word/stories', async (req, res) => {
  try {
    const { word } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    // Find vocabulary ID first
    const vocabResult = await db.query(
      'SELECT id FROM vocabulary WHERE word = $1',
      [word]
    );
    
    if (vocabResult.rows.length === 0) {
      return res.status(404).json({ message: 'Vocabulary not found' });
    }
    
    const vocabId = vocabResult.rows[0].id;
    
    // Get stories with this vocabulary
    const storiesResult = await db.query(
      `SELECT s.id, s.content_jp, s.content_en, s.tadoku_level, 
              s.wanikani_max_level, s.genki_max_chapter, s.topic, s.created_at
       FROM stories s
       JOIN story_vocabulary sv ON s.id = sv.story_id
       WHERE sv.vocab_id = $1
       ORDER BY s.created_at DESC
       LIMIT $2 OFFSET $3`,
      [vocabId, parseInt(limit), parseInt(offset)]
    );
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM stories s
       JOIN story_vocabulary sv ON s.id = sv.story_id
       WHERE sv.vocab_id = $1`,
      [vocabId]
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    res.json({
      vocabulary: word,
      stories: storiesResult.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Vocabulary stories fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 