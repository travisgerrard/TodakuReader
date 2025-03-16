const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-api-key';

// Mock variables for controlling axios behavior
let mockMalformedResponse = false;
let mockApiError = false;

// Mocks
jest.mock('../middleware/auth', () => (req, res, next) => {
  req.user = { id: 1 };
  next();
});

jest.mock('../db/db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  getClient: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [{ id: 1 }] }),
    release: jest.fn(),
  })
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation((url, data) => {
    // Default successful response
    if (!mockMalformedResponse && !mockApiError) {
      return Promise.resolve({
        data: {
          choices: [
            {
              message: {
                content: `===TITLE-JP===
タイトル
===TITLE-EN===
Title
===STORY-JP===
ストーリー
===STORY-EN===
Story
===VOCABULARY===
単語 (たんご) - word - 例文
===GRAMMAR===
文法 - grammar - Genki 1`
              }
            }
          ]
        }
      });
    } 
    // Malformed response for testing error handling
    else if (mockMalformedResponse) {
      return Promise.resolve({
        data: {
          choices: [
            {
              message: {
                content: `This is a malformed response without proper sections`
              }
            }
          ]
        }
      });
    }
    // API error like authentication or network issues
    else if (mockApiError) {
      return Promise.reject(new Error('API authentication error'));
    }
  })
}));

// Setup
app.use(bodyParser.json());
app.use('/api/stories', require('../routes/stories'));

describe('Stories API Routes', () => {
  describe('POST /api/stories/generate', () => {
    // Reset mock implementation before each test
    beforeEach(() => {
      const axios = require('axios');
      axios.post.mockClear();
      mockMalformedResponse = false;
      mockApiError = false;
    });

    it('should validate topic length to be 50 characters or less', async () => {
      // Create a topic that exceeds 50 characters
      const longTopic = 'This is a very long topic that exceeds the 50 character limit in the database schema for the topic field';
      
      const res = await request(app)
        .post('/api/stories/generate')
        .send({
          wanikani_level: 10,
          genki_chapter: 5,
          tadoku_level: 2,
          length: 'medium',
          topic: longTopic
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('50 characters or less');
    });

    it('should accept valid topic lengths', async () => {
      const validTopic = 'This is a valid topic';
      
      const res = await request(app)
        .post('/api/stories/generate')
        .send({
          wanikani_level: 10,
          genki_chapter: 5,
          tadoku_level: 2,
          length: 'medium',
          topic: validTopic
        });
      
      // The request should proceed beyond the validation step
      // Note: We're not testing the full story generation, just that validation passes
      expect(res.statusCode).not.toEqual(400);
    });

    it('should handle malformed responses from OpenAI', async () => {
      // Set the mock to return a malformed response
      mockMalformedResponse = true;
      
      const res = await request(app)
        .post('/api/stories/generate')
        .send({
          wanikani_level: 10,
          genki_chapter: 5,
          tadoku_level: 2,
          length: 'medium',
          topic: 'Valid topic'
        });
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual('Server error');
      expect(res.body.error).toContain('OpenAI response format is incomplete');
    });
    
    it('should handle API errors like authentication or network issues', async () => {
      // Set the mock to simulate an API error
      mockApiError = true;
      
      const res = await request(app)
        .post('/api/stories/generate')
        .send({
          wanikani_level: 10,
          genki_chapter: 5,
          tadoku_level: 2,
          length: 'medium',
          topic: 'Valid topic'
        });
      
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual('Server error');
      expect(res.body.error).toContain('API authentication error');
    });

    it('should correctly separate title and content in the response', async () => {
      const res = await request(app)
        .post('/api/stories/generate')
        .send({
          wanikani_level: 10,
          genki_chapter: 5,
          tadoku_level: 2,
          length: 'medium',
          topic: 'Valid topic'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('title_jp');
      expect(res.body).toHaveProperty('title_en');
      expect(res.body).toHaveProperty('content_jp');
      expect(res.body).toHaveProperty('content_en');
      expect(res.body).toHaveProperty('storyJP');
      expect(res.body).toHaveProperty('storyEN');
      
      // Verify the title and content are separate
      expect(res.body.title_jp).toEqual('タイトル');
      expect(res.body.content_jp).toEqual('タイトル\n\nストーリー');
      expect(res.body.storyJP).toEqual('ストーリー');
    });
  });

  describe('GET /api/stories/:id', () => {
    it('should extract title and content correctly when fetching a story', async () => {
      // Setup mock DB response with content that has title and story
      const db = require('../db/db');
      db.query.mockImplementation((query, params) => {
        if (query.includes('SELECT s.id')) {
          return Promise.resolve({
            rows: [{
              id: 1,
              content_jp: 'タイトル\n\n日本語のストーリー',
              content_en: 'Title\n\nEnglish story content',
              tadoku_level: 2,
              wanikani_max_level: 10,
              genki_max_chapter: 5,
              length_category: 'medium',
              topic: 'Test',
              upvotes: 0,
              created_at: new Date(),
              creator_email: 'test@example.com'
            }]
          });
        } else {
          return Promise.resolve({ rows: [] });
        }
      });
      
      const res = await request(app)
        .get('/api/stories/1');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('title_jp');
      expect(res.body).toHaveProperty('title_en');
      expect(res.body).toHaveProperty('storyJP');
      expect(res.body).toHaveProperty('storyEN');
      
      // Verify title and content were extracted correctly
      expect(res.body.title_jp).toEqual('タイトル');
      expect(res.body.storyJP).toEqual('日本語のストーリー');
      expect(res.body.title_en).toEqual('Title');
      expect(res.body.storyEN).toEqual('English story content');
    });
  });
}); 