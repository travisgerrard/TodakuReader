// Script to initialize the database by running the schema.sql file
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration from environment variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL database');
    
    // Read the schema.sql file
    const schemaPath = path.join(__dirname, 'server', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing SQL schema...');
    
    // Execute the SQL commands
    await client.query(schema);
    
    console.log('Database tables created successfully!');
    
    // Add some example data for testing
    console.log('Adding sample data...');
    
    // Add sample stories
    const storyResult = await client.query(`
      INSERT INTO stories (
        content_jp, 
        content_en, 
        tadoku_level, 
        wanikani_max_level, 
        genki_max_chapter, 
        length_category, 
        topic
      ) VALUES (
        '私の名前は田中です。日本語を勉強しています。よろしくお願いします。', 
        'My name is Tanaka. I am studying Japanese. Nice to meet you.', 
        1, 
        5, 
        3, 
        'short', 
        'introduction'
      ), (
        '昨日、友達と公園に行きました。桜の木がとてもきれいでした。天気もよくて、楽しい一日でした。', 
        'Yesterday, I went to the park with my friend. The cherry blossom trees were very beautiful. The weather was good too, and it was a fun day.', 
        2, 
        10, 
        5, 
        'short', 
        'daily life'
      ) RETURNING id;
    `);
    
    const storyIds = storyResult.rows.map(row => row.id);
    
    // Add sample vocabulary
    const vocabResult = await client.query(`
      INSERT INTO vocabulary (
        word, 
        reading, 
        meaning, 
        example_sentence_jp, 
        example_sentence_en
      ) VALUES (
        '名前', 
        'なまえ', 
        'name', 
        '私の名前は田中です。', 
        'My name is Tanaka.'
      ), (
        '勉強', 
        'べんきょう', 
        'study', 
        '日本語を勉強しています。', 
        'I am studying Japanese.'
      ), (
        '公園', 
        'こうえん', 
        'park', 
        '友達と公園に行きました。', 
        'I went to the park with my friend.'
      ), (
        '桜', 
        'さくら', 
        'cherry blossom', 
        '桜の木がとてもきれいでした。', 
        'The cherry blossom trees were very beautiful.'
      ) RETURNING id;
    `);
    
    const vocabIds = vocabResult.rows.map(row => row.id);
    
    // Add sample grammar
    const grammarResult = await client.query(`
      INSERT INTO grammar (
        grammar_point, 
        explanation, 
        genki_reference
      ) VALUES (
        'です', 
        'Copula used at the end of sentences to indicate politeness. Equivalent to "to be" in English.', 
        'Chapter 1'
      ), (
        'ます形', 
        'Polite form of verbs ending in -masu. Used in formal situations.', 
        'Chapter 3'
      ), (
        '〜ました', 
        'Past tense of ます form, indicating a polite past action.', 
        'Chapter 3'
      ) RETURNING id;
    `);
    
    const grammarIds = grammarResult.rows.map(row => row.id);
    
    // Link stories to vocabulary
    for (let i = 0; i < storyIds.length; i++) {
      const storyId = storyIds[i];
      // Link each story to 2 vocabulary items
      const vocabsToLink = vocabIds.slice(i * 2, i * 2 + 2);
      
      for (const vocabId of vocabsToLink) {
        await client.query(`
          INSERT INTO story_vocabulary (story_id, vocab_id)
          VALUES ($1, $2)
        `, [storyId, vocabId]);
      }
      
      // Link story to grammar points
      await client.query(`
        INSERT INTO story_grammar (story_id, grammar_id)
        VALUES ($1, $2), ($1, $3)
      `, [storyId, grammarIds[0], grammarIds[i % grammarIds.length + 1]]);
    }
    
    console.log('Sample data added successfully!');
    
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase()
  .then(() => {
    console.log('Database initialization completed!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }); 