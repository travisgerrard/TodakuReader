-- Users table (for authentication and progress tracking)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL, -- Google SSO ID
  email VARCHAR(255) UNIQUE NOT NULL,
  wanikani_level INT DEFAULT 1, -- Current WaniKani level
  genki_chapter INT DEFAULT 1, -- Current Genki chapter
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories table (core content)
CREATE TABLE stories (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id), -- Creator of the story (optional for shared stories)
  content_jp TEXT NOT NULL, -- Japanese story text
  content_en TEXT NOT NULL, -- English translation
  tadoku_level INT CHECK (tadoku_level BETWEEN 0 AND 5), -- Tadoku difficulty (0-5)
  wanikani_max_level INT, -- Max WaniKani level used
  genki_max_chapter INT, -- Max Genki chapter used
  length_category VARCHAR(10) CHECK (length_category IN ('short', 'medium', 'long')),
  topic VARCHAR(50), -- e.g., 'daily life', 'fantasy'
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vocabulary table
CREATE TABLE vocabulary (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL, -- Japanese word (hiragana/kanji)
  reading TEXT, -- Furigana (hiragana)
  meaning TEXT NOT NULL, -- English definition
  example_sentence_jp TEXT, -- Example from story
  example_sentence_en TEXT -- English translation
);

-- Grammar table
CREATE TABLE grammar (
  id SERIAL PRIMARY KEY,
  grammar_point TEXT NOT NULL, -- e.g., 'て-form', 'ます'
  explanation TEXT NOT NULL, -- Detailed explanation
  genki_reference VARCHAR(50) -- e.g., 'Chapter 6'
);

-- Story-Vocabulary junction table (many-to-many)
CREATE TABLE story_vocabulary (
  story_id INT REFERENCES stories(id),
  vocab_id INT REFERENCES vocabulary(id),
  PRIMARY KEY (story_id, vocab_id)
);

-- Story-Grammar junction table (many-to-many)
CREATE TABLE story_grammar (
  story_id INT REFERENCES stories(id),
  grammar_id INT REFERENCES grammar(id),
  PRIMARY KEY (story_id, grammar_id)
);

-- User-Story interaction (tracking read stories)
CREATE TABLE user_stories (
  user_id INT REFERENCES users(id),
  story_id INT REFERENCES stories(id),
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, story_id)
);

-- Add indexes for better performance
CREATE INDEX idx_stories_levels ON stories (tadoku_level, wanikani_max_level, genki_max_chapter);
CREATE INDEX idx_vocabulary_word ON vocabulary (word);
CREATE INDEX idx_grammar_point ON grammar (grammar_point); 