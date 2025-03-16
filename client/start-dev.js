#!/usr/bin/env node

// Set the port for the React development server
process.env.PORT = 3001;
process.env.HOST = '0.0.0.0';
process.env.NODE_ENV = 'development';

const spawn = require('child_process').spawn;

// Run the React development server
const reactProcess = spawn('npm', ['run', 'react-start'], {
  stdio: 'inherit',
  env: process.env
});

reactProcess.on('error', (err) => {
  console.error('Failed to start React app:', err);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Stopping React development server...');
  reactProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('Stopping React development server...');
  reactProcess.kill('SIGTERM');
}); 