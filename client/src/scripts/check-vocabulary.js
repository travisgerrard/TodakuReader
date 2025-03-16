/**
 * Script to check if the Vocabulary Browser is working properly
 * 
 * This script checks:
 * 1. If the mock data file exists
 * 2. If the server is responding
 * 3. If the vocabulary API endpoint is working
 * 
 * Run with: npm run check-vocabulary
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const VOCAB_ENDPOINT = '/api/vocab';
const MOCK_DATA_PATH = path.resolve(__dirname, '../utils/mockData.js');
const LOG_FILE_PATH = path.resolve(__dirname, '../logs/vocabulary-check.log');

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Helper to log messages to console and file
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  // Also write to log file
  fs.appendFileSync(LOG_FILE_PATH, logMessage + '\n');
}

// Check if mock data file exists
function checkMockData() {
  log('Checking mock data file...');
  
  if (fs.existsSync(MOCK_DATA_PATH)) {
    const fileContent = fs.readFileSync(MOCK_DATA_PATH, 'utf8');
    if (fileContent.includes('mockVocabulary')) {
      log('✅ Mock data file exists and contains vocabulary data');
      return true;
    } else {
      log('⚠️ Mock data file exists but does not contain vocabulary data', 'WARNING');
      return false;
    }
  } else {
    log('❌ Mock data file does not exist', 'ERROR');
    return false;
  }
}

// Check if server is responding
async function checkServer() {
  log('Checking if server is responding...');
  
  try {
    const response = await axios.get(`${API_URL}/health`, { 
      timeout: 5000,
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      log(`✅ Server is up and running`);
      return true;
    } else {
      log(`⚠️ Server responded with status ${response.status}`, 'WARNING');
      return false;
    }
  } catch (error) {
    log(`❌ Server check failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Check vocabulary API endpoint
async function checkVocabularyEndpoint() {
  log('Checking vocabulary API endpoint...');
  
  try {
    const response = await axios.get(`${API_URL}${VOCAB_ENDPOINT}`, { 
      timeout: 5000,
      params: { limit: 1 },
      validateStatus: () => true
    });
    
    if (response.status === 200) {
      // Verify response structure
      if (response.data && (response.data.vocabulary || Array.isArray(response.data))) {
        log('✅ Vocabulary API endpoint is working properly');
        return true;
      } else {
        log('⚠️ Vocabulary API endpoint returned an unexpected format', 'WARNING');
        return false;
      }
    } else {
      log(`⚠️ Vocabulary API endpoint responded with status ${response.status}`, 'WARNING');
      return false;
    }
  } catch (error) {
    log(`❌ Vocabulary API check failed: ${error.message}`, 'ERROR');
    return false;
  }
}

// Run all checks
async function runChecks() {
  log('Starting vocabulary checks...');
  
  // Results object to track overall status
  const results = {
    mockData: false,
    server: false,
    vocabApi: false
  };
  
  // Run checks
  results.mockData = checkMockData();
  results.server = await checkServer();
  
  // Only check API if server is responsive
  if (results.server) {
    results.vocabApi = await checkVocabularyEndpoint();
  }
  
  // Determine overall status
  const overallStatus = results.mockData && (results.server && results.vocabApi || !results.server);
  
  // Log summary
  log('');
  log('=== VOCABULARY CHECK SUMMARY ===');
  log(`Mock Data: ${results.mockData ? '✅ PASS' : '❌ FAIL'}`);
  log(`Server: ${results.server ? '✅ PASS' : '❌ FAIL'}`);
  log(`Vocabulary API: ${results.vocabApi ? '✅ PASS' : '❌ FAIL'}`);
  log(`Overall Status: ${overallStatus ? '✅ PASS' : '❌ FAIL'}`);
  
  if (!results.server && results.mockData) {
    log('');
    log('🔶 NOTE: The server is not available, but mock data is available.');
    log('🔶 The Vocabulary Browser will function in offline mode.');
  }
  
  // Exit with appropriate code (0 for success, 1 for failure)
  process.exit(overallStatus ? 0 : 1);
}

// Run all checks
runChecks().catch(error => {
  log(`❌ Unexpected error during checks: ${error.message}`, 'ERROR');
  process.exit(1);
}); 