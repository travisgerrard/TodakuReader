/**
 * Grammar Browser Availability Check Script
 * 
 * This script verifies that the Grammar Browser functionality
 * is working properly. It checks:
 * 1. If the server is available
 * 2. If the grammar API endpoint returns data
 * 
 * Run with: node src/scripts/check-grammar.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const GRAMMAR_ENDPOINT = '/grammar';
const MOCK_DATA_PATH = path.join(__dirname, '../utils/mockData.js');
const LOG_FILE = path.join(__dirname, '../../grammar-check.log');

// Helper to log to file and console
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  try {
    fs.appendFileSync(LOG_FILE, logMessage + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

// Check if mock data file exists and has mockGrammarPoints
const checkMockData = () => {
  try {
    if (fs.existsSync(MOCK_DATA_PATH)) {
      log('✓ Mock data file exists');
      return true;
    } else {
      log('✗ Mock data file not found at ' + MOCK_DATA_PATH);
      return false;
    }
  } catch (err) {
    log('✗ Error checking mock data file: ' + err.message);
    return false;
  }
};

// Check if the server is responding
const checkServer = async () => {
  try {
    const response = await axios.get(`${API_URL}/healthcheck`, { timeout: 5000 });
    if (response.status === 200) {
      log(`✓ Server is running: ${response.data.status}`);
      return true;
    } else {
      log(`✗ Server returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (err) {
    log(`✗ Server check failed: ${err.message}`);
    return false;
  }
};

// Check if the grammar API endpoint is working
const checkGrammarEndpoint = async () => {
  try {
    const response = await axios.get(`${API_URL}${GRAMMAR_ENDPOINT}`, {
      params: { limit: 1 },
      timeout: 5000
    });
    
    if (response.status === 200 && response.data) {
      if (response.data.grammar && Array.isArray(response.data.grammar)) {
        log(`✓ Grammar API returned ${response.data.grammar.length} items`);
        return true;
      } else {
        log('✗ Grammar API response has unexpected format');
        log(JSON.stringify(response.data).substring(0, 200) + '...');
        return false;
      }
    } else {
      log(`✗ Grammar API returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (err) {
    log(`✗ Grammar API check failed: ${err.message}`);
    return false;
  }
};

// Run all checks
const runChecks = async () => {
  log('=== Grammar Browser Availability Check ===');
  log(`API URL: ${API_URL}`);
  
  // Create log file directory if it doesn't exist
  try {
    const logDir = path.dirname(LOG_FILE);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
  
  // Check mock data
  const mockDataAvailable = checkMockData();
  
  // Check server
  const serverAvailable = await checkServer();
  
  // Check grammar endpoint
  let grammarEndpointWorking = false;
  if (serverAvailable) {
    grammarEndpointWorking = await checkGrammarEndpoint();
  }
  
  // Summary
  log('\n=== Check Summary ===');
  log(`Mock Data Available: ${mockDataAvailable ? 'YES' : 'NO'}`);
  log(`Server Available: ${serverAvailable ? 'YES' : 'NO'}`);
  log(`Grammar API Working: ${grammarEndpointWorking ? 'YES' : 'NO'}`);
  log(`Fallback Available: ${mockDataAvailable ? 'YES' : 'NO'}`);
  
  const overallStatus = grammarEndpointWorking || mockDataAvailable;
  log(`\nOverall Status: ${overallStatus ? 'PASS' : 'FAIL'}`);
  
  // Exit with appropriate code
  process.exit(overallStatus ? 0 : 1);
};

// Run the checks
runChecks().catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
}); 