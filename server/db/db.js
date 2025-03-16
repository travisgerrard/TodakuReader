const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../..', '.env') });

// Log database configuration (without sensitive data)
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
  // Add connection timeout and retry logic
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20, // Maximum number of clients in the pool
});

// Test the connection
pool.on('connect', () => {
  console.log(`Connected to PostgreSQL database: ${process.env.DB_NAME}`);
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
  console.error('Database connection error. Check your credentials and database availability.');
});

// Function to test the database connection
const testConnection = async () => {
  let client;
  try {
    console.log('Testing database connection...');
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (err) {
    console.error('Error testing database connection:', err.message);
    console.error('Please ensure your database exists and is running.');
    
    // Check for common errors and provide helpful messages
    if (err.message.includes('does not exist')) {
      console.error(`Database "${process.env.DB_NAME}" does not exist. You may need to create it first.`);
      console.error(`Try running: createdb ${process.env.DB_NAME}`);
    } else if (err.message.includes('password authentication')) {
      console.error('Password authentication failed. Check your DB_USER and DB_PASSWORD in .env file.');
    } else if (err.message.includes('connect ECONNREFUSED')) {
      console.error('Connection refused. Make sure PostgreSQL is running.');
    }
    
    return false;
  } finally {
    if (client) client.release();
  }
};

// Export the pool and test function
module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  testConnection,
};

// Test the connection when this module is first loaded
testConnection().catch(err => console.error('Initial connection test failed:', err.message)); 