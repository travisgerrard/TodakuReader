// Start both the React frontend and Express backend
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Todaku Reader application...');

// Check if the server directory exists
const serverDir = path.join(__dirname, 'server');
if (!fs.existsSync(serverDir)) {
  console.error('Error: server directory not found at', serverDir);
  console.error('Please run this script from the root of your project');
  process.exit(1);
}

// Check if the client directory exists
const clientDir = path.join(__dirname, 'client');
if (!fs.existsSync(clientDir)) {
  console.error('Error: client directory not found at', clientDir);
  console.error('Please run this script from the root of your project');
  process.exit(1);
}

// Function to start a process
const startProcess = (command, args, options, name) => {
  console.log(`Starting ${name}...`);
  const process = spawn(command, args, options);
  
  process.on('error', (err) => {
    console.error(`Failed to start ${name}:`, err);
  });
  
  process.on('close', (code) => {
    if (code !== 0) {
      console.log(`${name} process exited with code ${code}`);
    }
  });
  
  return process;
};

// Start the backend server
const serverProcess = startProcess('node', ['server/index.js'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    PORT: 5001,
    NODE_ENV: 'development'
  }
}, 'Backend server');

// Wait a moment before starting the client
setTimeout(() => {
  // Start the React client
  const clientProcess = startProcess('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'client'),
    env: {
      ...process.env,
      BROWSER: 'none', // Prevent browser from opening automatically
      PORT: 3000
    }
  }, 'React client');
  
  // Handle cleanup when the script is terminated
  const cleanup = () => {
    console.log('\nShutting down all processes...');
    serverProcess.kill();
    clientProcess.kill();
    process.exit(0);
  };
  
  // Handle various termination signals
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);
}, 2000); // Wait 2 seconds before starting the client

console.log('Both servers should be starting now. Press Ctrl+C to stop both services.');
console.log('The application will be available at:');
console.log('- Frontend: http://localhost:3000');
console.log('- Backend API: http://localhost:5001/api'); 