const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('Database Configuration:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

async function testConnection() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('Connected to database');
    
    // Test query
    console.log('Testing query: SELECT * FROM users LIMIT 1');
    const result = await client.query('SELECT * FROM users LIMIT 1');
    console.log('Query result:', result.rows);
    
    console.log('Database connection and query successful');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (client) client.release();
  }
}

testConnection(); 