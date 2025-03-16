const express = require('express');
const router = express.Router();
const db = require('../db/db');

// @route   GET api/grammar
// @desc    Get grammar points with search and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    console.log('Grammar API request received with query:', req.query);
    const { 
      search, 
      search_type = 'all',
      jlpt_level, 
      genki_chapter, 
      tadoku_level,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let queryParams = [];
    let whereConditions = [];
    let paramIndex = 1;
    
    if (search) {
      if (search_type === 'pattern') {
        whereConditions.push(`grammar_point ILIKE $${paramIndex}`);
      } else if (search_type === 'meaning') {
        whereConditions.push(`explanation ILIKE $${paramIndex}`);
      } else if (search_type === 'description') {
        whereConditions.push(`description ILIKE $${paramIndex}`);
      } else {
        // Default: search all fields
        whereConditions.push(`(grammar_point ILIKE $${paramIndex} OR explanation ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      }
      queryParams.push(`%${search}%`);
      paramIndex++;
    }
    
    if (jlpt_level) {
      whereConditions.push(`jlpt_level = $${paramIndex}`);
      queryParams.push(jlpt_level);
      paramIndex++;
    }
    
    if (genki_chapter) {
      whereConditions.push(`genki_reference ILIKE $${paramIndex}`);
      queryParams.push(`%Chapter ${genki_chapter}%`);
      paramIndex++;
    }
    
    if (tadoku_level) {
      whereConditions.push(`tadoku_level = $${paramIndex}`);
      queryParams.push(parseInt(tadoku_level));
      paramIndex++;
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Add pagination
    queryParams.push(parseInt(limit));
    queryParams.push(offset);
    
    console.log('Executing grammar query with where clause:', whereClause);
    console.log('Query parameters:', queryParams);
    
    try {
      const grammarResult = await db.query(
        `SELECT id, grammar_point, explanation AS meaning, description, jlpt_level, tadoku_level, usage, examples, related_grammar
         FROM grammar
         ${whereClause}
         ORDER BY jlpt_level, grammar_point
         LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
        queryParams
      );
      
      // Get total count for pagination
      const countResult = await db.query(
        `SELECT COUNT(*) FROM grammar ${whereClause}`,
        whereConditions.length > 0 ? queryParams.slice(0, -2) : []
      );
      
      const total = parseInt(countResult.rows[0].count);
      const totalPages = Math.ceil(total / parseInt(limit));
      
      console.log(`Grammar query returned ${grammarResult.rows.length} results out of ${total} total`);
      
      res.json({
        grammar: grammarResult.rows,
        pagination: {
          total,
          total_pages: totalPages,
          current_page: parseInt(page),
          limit: parseInt(limit),
          offset
        }
      });
    } catch (dbError) {
      console.error('Database error in grammar route:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }
  } catch (err) {
    console.error('Grammar fetch error:', err.message);
    res.status(500).json({ 
      message: 'Server error loading grammar points', 
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET api/grammar/:id
// @desc    Get grammar point by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Fetching grammar detail for ID: ${id}`);
    
    // Get grammar details
    const grammarResult = await db.query(
      'SELECT * FROM grammar WHERE id = $1',
      [id]
    );
    
    if (grammarResult.rows.length === 0) {
      console.log(`Grammar point with ID ${id} not found`);
      return res.status(404).json({ message: 'Grammar point not found' });
    }
    
    // Get stories that use this grammar point
    const storiesResult = await db.query(
      `SELECT s.id, s.title_jp, s.title_en, s.content_jp, s.content_en, s.tadoku_level, s.topic
       FROM stories s
       JOIN story_grammar sg ON s.id = sg.story_id
       WHERE sg.grammar_id = $1
       ORDER BY s.created_at DESC
       LIMIT 5`,
      [id]
    );
    
    console.log(`Found grammar point with ID ${id} and ${storiesResult.rows.length} related stories`);
    
    // Format the response
    const grammarItem = grammarResult.rows[0];
    
    res.json({
      id: grammarItem.id,
      pattern: grammarItem.grammar_point,
      meaning: grammarItem.explanation,
      description: grammarItem.description,
      usage: grammarItem.usage,
      examples: grammarItem.examples,
      jlpt_level: grammarItem.jlpt_level,
      tadoku_level: grammarItem.tadoku_level,
      genki_reference: grammarItem.genki_reference,
      related_grammar: grammarItem.related_grammar,
      related_stories: storiesResult.rows
    });
  } catch (err) {
    console.error('Grammar detail fetch error:', err.message);
    res.status(500).json({ 
      message: 'Server error fetching grammar details',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET api/grammar/genki/:chapter
// @desc    Get grammar points for a specific Genki chapter
// @access  Public
router.get('/genki/:chapter', async (req, res) => {
  try {
    const { chapter } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    console.log(`Fetching grammar for Genki chapter ${chapter}`);
    
    // Get grammar points for this chapter
    const grammarResult = await db.query(
      `SELECT id, grammar_point, explanation AS meaning, description, jlpt_level, tadoku_level
       FROM grammar
       WHERE genki_reference ILIKE $1
       ORDER BY grammar_point
       LIMIT $2 OFFSET $3`,
      [`%Chapter ${chapter}%`, parseInt(limit), offset]
    );
    
    // Get total count
    const countResult = await db.query(
      `SELECT COUNT(*) FROM grammar WHERE genki_reference ILIKE $1`,
      [`%Chapter ${chapter}%`]
    );
    
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    console.log(`Found ${grammarResult.rows.length} grammar points for Genki chapter ${chapter}`);
    
    res.json({
      chapter,
      grammar: grammarResult.rows,
      pagination: {
        total,
        total_pages: totalPages,
        current_page: parseInt(page),
        limit: parseInt(limit),
        offset
      }
    });
  } catch (err) {
    console.error('Genki chapter grammar fetch error:', err.message);
    res.status(500).json({ 
      message: 'Server error fetching Genki grammar',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router; 