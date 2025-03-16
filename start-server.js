// Simple script to start the server with proper environment variables
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if the server directory exists
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('Error: server directory not found at', serverDir);
  console.error('Please run this script from the root of your project');
  process.exit(1);
}

console.log('Starting Todaku Reader server...');

// Start the server process
const serverProcess = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: 5001,
    NODE_ENV: 'development'
  }
});

serverProcess.on('error', (err) => {
  console.error('Failed to start server:', err);
});

// Handle server exit
serverProcess.on('close', (code) => {
  if (code !== 0) {
    console.log(`Server process exited with code ${code}`);
  }
});

console.log('Server should be starting now. Press Ctrl+C to stop.'); 