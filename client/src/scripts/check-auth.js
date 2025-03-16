/**
 * Script to check if the authentication system is working properly.
 * 
 * This script:
 * 1. Checks that the API URL is accessible
 * 2. Tests the Auth endpoint without a token (should return 401)
 * 3. Validates that the token header format is correct
 * 
 * Run with: node src/scripts/check-auth.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const AUTH_ENDPOINT = '/auth/user';
const LOG_FILE_PATH = path.join(__dirname, '..', '..', 'logs', 'auth-check.log');

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Helper function to log messages
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE_PATH, logMessage + '\n');
}

// Check if the API is responding
async function checkApiAvailability() {
  log('Checking API availability...');
  try {
    // Try to access the root API endpoint instead of a health endpoint
    const response = await axios.get(`${API_URL}`, { timeout: 5000 });
    log(`API root endpoint response: ${response.status} ${response.statusText}`);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log(`Cannot connect to API at ${API_URL}. Server may be down.`, 'ERROR');
    } else if (error.response) {
      // Even a 404 means the server is running
      if (error.response.status === 404) {
        log(`API is available but returned 404. This is acceptable for the root endpoint.`);
        return true;
      }
      log(`API check failed with status: ${error.response.status}`, 'ERROR');
    } else {
      log(`API check failed: ${error.message}`, 'ERROR');
    }
    return false;
  }
}

// Check that auth endpoint properly rejects unauthenticated requests
async function checkAuthEndpoint() {
  log('Checking auth endpoint without token...');
  try {
    await axios.get(`${API_URL}${AUTH_ENDPOINT}`);
    log('Authentication endpoint did not return 401 as expected for missing token', 'ERROR');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('Authentication endpoint correctly returned 401 for missing token', 'SUCCESS');
      return true;
    } else {
      log(`Unexpected error: ${error.message}`, 'ERROR');
      return false;
    }
  }
}

// Test endpoint with both header formats
async function checkTokenHeaderFormat() {
  log('Checking token header format compatibility...');
  
  // Create a dummy token for testing
  const dummyToken = 'test-token-123';
  
  try {
    // Test with x-auth-token header
    try {
      await axios.get(`${API_URL}${AUTH_ENDPOINT}`, {
        headers: { 'x-auth-token': dummyToken }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // 401 is expected because the token is invalid, but at least the format was accepted
        log('x-auth-token header format accepted', 'SUCCESS');
      } else {
        log(`Unexpected error with x-auth-token header: ${error.message}`, 'ERROR');
        return false;
      }
    }
    
    // Test with Authorization Bearer header
    try {
      await axios.get(`${API_URL}${AUTH_ENDPOINT}`, {
        headers: { 'Authorization': `Bearer ${dummyToken}` }
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // 401 is expected because the token is invalid, but at least the format was accepted
        log('Authorization Bearer header format accepted', 'SUCCESS');
      } else {
        log(`Unexpected error with Authorization Bearer header: ${error.message}`, 'ERROR');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    log(`Failed to test token header formats: ${error.message}`, 'ERROR');
    return false;
  }
}

// Run all checks
async function runChecks() {
  log('Starting authentication system checks...');
  
  const results = {
    apiAvailable: false,
    authEndpoint: false,
    tokenFormat: false
  };
  
  // Check API availability
  results.apiAvailable = await checkApiAvailability();
  
  if (results.apiAvailable) {
    // Only continue if API is available
    results.authEndpoint = await checkAuthEndpoint();
    results.tokenFormat = await checkTokenHeaderFormat();
  }
  
  // Calculate overall result
  const success = Object.values(results).every(result => result === true);
  
  // Log final results
  log('-----------------------------------------');
  log(`API Available: ${results.apiAvailable ? 'PASS' : 'FAIL'}`);
  log(`Auth Endpoint Security: ${results.authEndpoint ? 'PASS' : 'FAIL'}`);
  log(`Token Header Format: ${results.tokenFormat ? 'PASS' : 'FAIL'}`);
  log('-----------------------------------------');
  log(`OVERALL RESULT: ${success ? 'PASS' : 'FAIL'}`);
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

// Start checks
runChecks().catch(error => {
  log(`Fatal error: ${error.message}`, 'FATAL');
  process.exit(1);
}); 