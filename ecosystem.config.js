// Load the .env file to get GOOGLE_CLIENT_SECRET
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'todakureader',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5001,
        CLIENT_URL: 'https://todakureader.com',
        API_URL: 'https://todakureader.com',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        // Database configuration
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
        DB_NAME: process.env.DB_NAME,
        // JWT Secret
        JWT_SECRET: process.env.JWT_SECRET,
        // OpenAI API Key
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
