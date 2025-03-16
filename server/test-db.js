const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

console.log('Testing database connection with these settings:');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '******' : '<empty>');
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

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Successfully connected to PostgreSQL!');
    console.log('Current timestamp from database:', res.rows[0].now);
    
    // Test querying the users table
    pool.query('SELECT COUNT(*) FROM users', (err, res) => {
      if (err) {
        console.error('Error querying users table:', err);
      } else {
        console.log('Users table exists with', res.rows[0].count, 'rows');
      }
      pool.end();
    });
  }
}); 