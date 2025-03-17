const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Now require the db module after environment variables are loaded
const db = require('./db/db');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Log environment variables (excluding sensitive data)
console.log('Starting server with:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 
  `${process.env.GOOGLE_CLIENT_ID.substring(0, 10)}...` : 'Not set');

// Add server health check endpoint
app.get('/api/healthcheck', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5001', 'https://todakureader.com', 'https://www.todakureader.com'],
  credentials: true
}));

// Add error handling middleware for database errors
app.use(async (req, res, next) => {
  try {
    // Test database connection on each request
    const connectionResult = await db.testConnection();
    if (!connectionResult) {
      console.error('Database connection is not available for request:', req.path);
      if (req.path.startsWith('/api/')) {
        return res.status(503).json({
          message: 'Database connection unavailable',
          status: 'error',
          code: 'DB_UNAVAILABLE'
        });
      }
    }
    next();
  } catch (err) {
    console.error('Error checking database connection:', err);
    if (req.path.startsWith('/api/')) {
      return res.status(503).json({
        message: 'Database service unavailable',
        status: 'error',
        code: 'DB_ERROR'
      });
    }
    next();
  }
});

// Root API route for testing connection
app.get('/api', (req, res) => {
  res.json({
    message: 'API is working',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/vocab', require('./routes/vocab'));
app.use('/api/grammar', require('./routes/grammar'));
app.use('/api/profile', require('./routes/profile'));

// Handle production environment
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Any route not matching API routes will serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'build', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err.stack);
  res.status(500).json({
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Health check available at http://localhost:${PORT}/api/healthcheck`);
  
  // Test database connection and tables
  try {
    const result = await db.query('SELECT * FROM users LIMIT 1');
    console.log('Database connection successful, users table exists');
  } catch (err) {
    console.error('Error testing users table:', err.message);
  }
}); 