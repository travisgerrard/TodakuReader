// Simple utility to check running processes
const { execSync } = require('child_process');

console.log('Checking running processes...');

// Check for processes running on port 3000
try {
  console.log('\nProcesses on port 3000:');
  const port3000Output = execSync('lsof -i :3000 | grep LISTEN').toString();
  console.log(port3000Output || 'No processes found on port 3000');
} catch (error) {
  console.log('No processes found on port 3000');
}

// Check for processes running on port 5001
try {
  console.log('\nProcesses on port 5001:');
  const port5001Output = execSync('lsof -i :5001 | grep LISTEN').toString();
  console.log(port5001Output || 'No processes found on port 5001');
} catch (error) {
  console.log('No processes found on port 5001');
}

// Check for running Node.js processes
try {
  console.log('\nRunning Node.js processes:');
  const nodeOutput = execSync('ps aux | grep node | grep -v grep').toString();
  console.log(nodeOutput || 'No Node.js processes found');
} catch (error) {
  console.log('No Node.js processes found');
}

console.log('\nTo kill a process, use: kill -9 [PID]');
console.log('Example: kill -9 1234'); 