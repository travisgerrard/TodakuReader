const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db/db');
const auth = require('../middleware/auth');

// @route   POST api/stories/generate
// @desc    Generate a new story using OpenAI API
// @access  Private
router.post('/generate', auth, async (req, res) => {
  const { wanikani_level, genki_chapter, tadoku_level, length, topic } = req.body;

  // Validate inputs
  if (!wanikani_level || !genki_chapter || !tadoku_level || !length || !topic) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (tadoku_level < 0 || tadoku_level > 5) {
    return res.status(400).json({ message: 'Tadoku level must be between 0 and 5' });
  }

  if (!['short', 'medium', 'long'].includes(length)) {
    return res.status(400).json({ message: 'Length must be short, medium, or long' });
  }
  
  // Validate topic length to match database constraint
  if (topic.length > 50) {
    return res.status(400).json({ message: 'Topic must be 50 characters or less' });
  }

  try {
    // Create prompt for OpenAI
    const lengthMap = {
      short: '100-200',
      medium: '300-500',
      long: '700-1000'
    };

    const prompt = `Generate a Tadoku-style Japanese story at Tadoku Level ${tadoku_level}, using kanji up to WaniKani Level ${wanikani_level} and grammar up to Genki Chapter ${genki_chapter}. The story should be ${length}-length (${lengthMap[length]} characters), about ${topic}. Include furigana for the first occurrence of each kanji. Provide an English translation, a vocabulary list with definitions and example sentences, and a grammar breakdown referencing Genki chapters.

The output format should be as follows (make sure to include ALL sections and complete each section fully):
===TITLE-JP===
[Japanese title]
===TITLE-EN===
[English title]
===STORY-JP===
[Full Japanese story with furigana]
===STORY-EN===
[Full English translation]
===VOCABULARY===
[List of key vocabulary with format: word (reading) - meaning - example]
===GRAMMAR===
[List of grammar points with format: grammar point - explanation - Genki reference (keep reference brief, max 50 chars)]

Important: Make sure to complete all sections and maintain proper formatting throughout the response. Keep Genki references concise (e.g., "Chapter 3", "Ch. 3 - Particles", etc.).`;

    // Verify OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        message: 'Server error',
        error: 'OpenAI API key is missing'
      });
    }

    // Call OpenAI API
    try {
      console.log('Calling OpenAI API for story generation...');
      const startTime = Date.now();
      
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are a Japanese language teacher specializing in creating graded readers. Always provide complete responses with all required sections. Never truncate or omit any sections.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 8000,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
          top_p: 0.95,
          stop: null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          timeout: 120000 // 120 seconds
        }
      );

      const apiDuration = Date.now() - startTime;
      console.log(`OpenAI API responded in ${apiDuration}ms`);
      
      if (!openaiResponse.data || !openaiResponse.data.choices || !openaiResponse.data.choices[0]) {
        console.error('Invalid OpenAI API response structure:', openaiResponse.data);
        throw new Error('Invalid response from OpenAI API');
      }

      // Parse response
      const responseText = openaiResponse.data.choices[0].message.content;
      console.log('OpenAI raw response:', responseText);
      
      // Extract sections with proper error handling
      const sections = {
        titleJP: responseText.match(/===TITLE-JP===\n([\s\S]*?)(?=\n===TITLE-EN===)/),
        titleEN: responseText.match(/===TITLE-EN===\n([\s\S]*?)(?=\n===STORY-JP===)/),
        storyJP: responseText.match(/===STORY-JP===\n([\s\S]*?)(?=\n===STORY-EN===)/),
        storyEN: responseText.match(/===STORY-EN===\n([\s\S]*?)(?=\n===VOCABULARY===)/),
        vocabulary: responseText.match(/===VOCABULARY===\n([\s\S]*?)(?=\n===GRAMMAR===)/),
        grammar: responseText.match(/===GRAMMAR===\n([\s\S]*?)(?=$)/)
      };
      
      // Check for missing sections
      const missingSections = Object.entries(sections)
        .filter(([_, match]) => !match)
        .map(([name]) => name.toUpperCase());
      
      if (missingSections.length > 0) {
        console.error('Missing sections in OpenAI response:', missingSections);
        console.error('Full response:', responseText);
        return res.status(500).json({
          message: 'Server error',
          error: 'OpenAI response format is incomplete'
        });
      }
      
      // Extract content from matches
      titleJP = sections.titleJP[1].trim();
      titleEN = sections.titleEN[1].trim();
      storyJP = sections.storyJP[1].trim();
      storyEN = sections.storyEN[1].trim();
      vocabularySection = sections.vocabulary[1].trim();
      grammarSection = sections.grammar[1].trim();
      
      // Validate content
      const emptyFields = [];
      if (!titleJP) emptyFields.push('Japanese title');
      if (!titleEN) emptyFields.push('English title');
      if (!storyJP) emptyFields.push('Japanese story');
      if (!storyEN) emptyFields.push('English story');
      if (!vocabularySection) emptyFields.push('Vocabulary section');
      if (!grammarSection) emptyFields.push('Grammar section');
      
      if (emptyFields.length > 0) {
        console.error('Empty fields in OpenAI response:', emptyFields);
        throw new Error(`OpenAI response contains empty sections: ${emptyFields.join(', ')}`);
      }

      // Prepare content with title for storage
      const contentJP = `${titleJP}\n\n${storyJP}`;
      const contentEN = `${titleEN}\n\n${storyEN}`;

      // Start a transaction
      const client = await db.getClient();
      try {
        await client.query('BEGIN');

        // Save story
        const storyResult = await client.query(
          `INSERT INTO stories 
           (user_id, content_jp, content_en, tadoku_level, wanikani_max_level, genki_max_chapter, length_category, topic) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
           RETURNING id`,
          [req.user.id, contentJP, contentEN, tadoku_level, wanikani_level, genki_chapter, length, topic]
        );
        
        const storyId = storyResult.rows[0].id;

        // Process vocabulary
        const vocabLines = vocabularySection.split('\n');
        for (const line of vocabLines) {
          // Parse vocabulary line, expected format: word (reading) - meaning - example
          const match = line.match(/(.+?) \((.+?)\) - (.+?) - (.+)/);
          if (match) {
            const [, word, reading, meaning, example] = match;
            
            // Check if vocabulary exists
            const vocabResult = await client.query(
              'SELECT id FROM vocabulary WHERE word = $1 AND reading = $2',
              [word, reading]
            );
            
            let vocabId;
            if (vocabResult.rows.length === 0) {
              // Add new vocabulary
              const newVocabResult = await client.query(
                `INSERT INTO vocabulary 
                 (word, reading, meaning, example_sentence_jp, example_sentence_en) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING id`,
                [word, reading, meaning, example, ''] // Example English left blank for now
              );
              vocabId = newVocabResult.rows[0].id;
            } else {
              vocabId = vocabResult.rows[0].id;
            }
            
            // Link vocabulary to story
            await client.query(
              'INSERT INTO story_vocabulary (story_id, vocab_id) VALUES ($1, $2)',
              [storyId, vocabId]
            );
          }
        }

        // Process grammar
        const grammarLines = grammarSection.split('\n');
        for (const line of grammarLines) {
          // Parse grammar line, expected format: grammar point - explanation - Genki reference
          const match = line.match(/(.+?) - (.+?) - (.+)/);
          if (match) {
            const [, grammarPoint, explanation, genkiRef] = match;
            
            // Truncate genki_reference if it's too long (max 50 chars)
            const truncatedGenkiRef = genkiRef.length > 50 ? genkiRef.substring(0, 47) + '...' : genkiRef;
            
            // Check if grammar point exists
            const grammarResult = await client.query(
              'SELECT id FROM grammar WHERE grammar_point = $1',
              [grammarPoint]
            );
            
            let grammarId;
            if (grammarResult.rows.length === 0) {
              // Add new grammar point
              const newGrammarResult = await client.query(
                `INSERT INTO grammar 
                 (grammar_point, explanation, genki_reference) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [grammarPoint, explanation, truncatedGenkiRef]
              );
              grammarId = newGrammarResult.rows[0].id;
            } else {
              grammarId = grammarResult.rows[0].id;
            }
            
            // Link grammar to story
            await client.query(
              'INSERT INTO story_grammar (story_id, grammar_id) VALUES ($1, $2)',
              [storyId, grammarId]
            );
          }
        }

        await client.query('COMMIT');
        
        // Send response with story and metadata
        res.json({
          id: storyId,
          title_jp: titleJP,
          title_en: titleEN,
          content_jp: contentJP,
          content_en: contentEN,
          storyJP: storyJP,
          storyEN: storyEN,
          tadoku_level,
          wanikani_level,
          genki_chapter,
          length,
          topic
        });
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err) {
      console.error('Story generation error:', err.message);
      
      // Handle OpenAI API specific errors
      if (err.response && err.response.data) {
        console.error('OpenAI API error details:', err.response.data);
        
        if (err.response.status === 401) {
          return res.status(500).json({ 
            message: 'Server error', 
            error: 'API authentication error' 
          });
        }
        
        if (err.response.status === 429) {
          return res.status(500).json({ 
            message: 'Server error', 
            error: 'OpenAI API rate limit exceeded. Please try again later.' 
          });
        }
        
        if (err.response.data.error) {
          return res.status(500).json({ 
            message: 'Server error', 
            error: `OpenAI API error: ${err.response.data.error.message || err.response.data.error}` 
          });
        }
      }
      
      // Handle timeout errors
      if (err.code === 'ECONNABORTED') {
        return res.status(500).json({ 
          message: 'Server error', 
          error: 'Request timed out. Story generation is taking longer than expected.' 
        });
      }
      
      return res.status(500).json({ 
        message: 'Server error', 
        error: err.message 
      });
    }
  } catch (err) {
    console.error('Story generation error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/stories
// @desc    Get all stories with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Extract filter parameters from query
    const { tadoku_level, wanikani_level, genki_chapter, length, topic, limit = 10, offset = 0 } = req.query;
    
    // Build WHERE clause dynamically
    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;
    
    if (tadoku_level) {
      whereConditions.push(`tadoku_level = $${paramIndex++}`);
      queryParams.push(tadoku_level);
    }
    
    if (wanikani_level) {
      whereConditions.push(`wanikani_max_level <= $${paramIndex++}`);
      queryParams.push(wanikani_level);
    }
    
    if (genki_chapter) {
      whereConditions.push(`genki_max_chapter <= $${paramIndex++}`);
      queryParams.push(genki_chapter);
    }
    
    if (length) {
      whereConditions.push(`length_category = $${paramIndex++}`);
      queryParams.push(length);
    }
    
    if (topic) {
      whereConditions.push(`topic ILIKE $${paramIndex++}`);
      queryParams.push(`%${topic}%`);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Add limit and offset for pagination
    queryParams.push(parseInt(limit));
    queryParams.push(parseInt(offset));
    
    // Get stories
    const storiesResult = await db.query(
      `SELECT s.id, s.content_jp, s.content_en, s.tadoku_level, s.wanikani_max_level, 
              s.genki_max_chapter, s.length_category, s.topic, s.upvotes, s.created_at, 
              u.email as creator_email
       FROM stories s
       LEFT JOIN users u ON s.user_id = u.id
       ${whereClause}
       ORDER BY s.upvotes DESC, s.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      queryParams
    );
    
    // Get total count for pagination
    const countResult = await db.query(
      `SELECT COUNT(*) FROM stories ${whereClause}`,
      whereConditions.length > 0 ? queryParams.slice(0, -2) : []
    );
    
    const total = parseInt(countResult.rows[0].count);
    
    // Extract titles from content for each story
    const storiesWithTitles = storiesResult.rows.map(story => {
      let title_jp = '';
      let title_en = '';
      let storyJP = story.content_jp;
      let storyEN = story.content_en;
      
      if (story.content_jp && story.content_jp.includes('\n\n')) {
        const parts = story.content_jp.split('\n\n');
        title_jp = parts[0];
        storyJP = parts.slice(1).join('\n\n');
      }
      
      if (story.content_en && story.content_en.includes('\n\n')) {
        const parts = story.content_en.split('\n\n');
        title_en = parts[0];
        storyEN = parts.slice(1).join('\n\n');
      }
      
      return {
        ...story,
        title_jp,
        title_en,
        storyJP,
        storyEN
      };
    });
    
    res.json({
      stories: storiesWithTitles,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Story fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/stories/:id
// @desc    Get story by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get story with vocabulary and grammar
    const storyResult = await db.query(
      `SELECT s.id, s.content_jp, s.content_en, s.tadoku_level, s.wanikani_max_level, 
              s.genki_max_chapter, s.length_category, s.topic, s.upvotes, s.created_at, 
              u.email as creator_email
       FROM stories s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );
    
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    const story = storyResult.rows[0];
    
    // Extract title from content if possible
    let title_jp = '';
    let title_en = '';
    let storyJP = story.content_jp;
    let storyEN = story.content_en;
    
    if (story.content_jp && story.content_jp.includes('\n\n')) {
      const parts = story.content_jp.split('\n\n');
      title_jp = parts[0];
      storyJP = parts.slice(1).join('\n\n');
    }
    
    if (story.content_en && story.content_en.includes('\n\n')) {
      const parts = story.content_en.split('\n\n');
      title_en = parts[0];
      storyEN = parts.slice(1).join('\n\n');
    }
    
    // Get vocabulary for this story
    const vocabResult = await db.query(
      `SELECT v.id, v.word, v.reading, v.meaning, v.example_sentence_jp, v.example_sentence_en
       FROM vocabulary v
       JOIN story_vocabulary sv ON v.id = sv.vocab_id
       WHERE sv.story_id = $1`,
      [id]
    );
    
    // Get grammar for this story
    const grammarResult = await db.query(
      `SELECT g.id, g.grammar_point, g.explanation, g.genki_reference
       FROM grammar g
       JOIN story_grammar sg ON g.id = sg.grammar_id
       WHERE sg.story_id = $1`,
      [id]
    );
    
    res.json({
      ...story,
      title_jp,
      title_en,
      storyJP,
      storyEN,
      vocabulary: vocabResult.rows,
      grammar: grammarResult.rows
    });
  } catch (err) {
    console.error('Story detail fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/stories/:id/upvote
// @desc    Upvote a story
// @access  Public
router.put('/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Update story upvotes
    await db.query(
      'UPDATE stories SET upvotes = upvotes + 1 WHERE id = $1',
      [id]
    );
    
    // Get updated upvote count
    const result = await db.query(
      'SELECT upvotes FROM stories WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    res.json({ upvotes: result.rows[0].upvotes });
  } catch (err) {
    console.error('Story upvote error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/stories/:id/review
// @desc    Get review data for a story (vocabulary and grammar)
// @access  Public
router.get('/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get vocabulary for this story
    const vocabResult = await db.query(
      `SELECT v.id, v.word, v.reading, v.meaning, v.example_sentence_jp, v.example_sentence_en
       FROM vocabulary v
       JOIN story_vocabulary sv ON v.id = sv.vocab_id
       WHERE sv.story_id = $1
       ORDER BY v.word`,
      [id]
    );
    
    // Get grammar for this story
    const grammarResult = await db.query(
      `SELECT g.id, g.grammar_point, g.explanation, g.genki_reference
       FROM grammar g
       JOIN story_grammar sg ON g.id = sg.grammar_id
       WHERE sg.story_id = $1
       ORDER BY g.grammar_point`,
      [id]
    );
    
    res.json({
      vocabulary: vocabResult.rows,
      grammar: grammarResult.rows
    });
  } catch (err) {
    console.error('Story review fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 