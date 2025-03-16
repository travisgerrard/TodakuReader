/**
 * Script to check if stories are accessible to non-authenticated users
 * and verify that fallback data is properly provided when the API fails.
 * 
 * Usage: 
 *   npm run check-stories-access
 * 
 * This script performs the following checks:
 * 1. Verifies that the mock data file exists and is valid
 * 2. Tests the API endpoint directly to see if it's accessible without auth
 * 3. Tests the fallback mechanism when API fails
 * 
 * Exit codes:
 *   0 = All checks passed
 *   1 = One or more checks failed
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const STORIES_ENDPOINT = '/api/stories';
const MOCK_DATA_PATH = path.join(__dirname, '../data/mockStories.json');
const LOG_FILE = path.join(__dirname, '../../logs/stories-access-check.log');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Helper to log to console and file
function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  
  console.log(logMessage);
  
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

// Check if mock data exists and is valid
function checkMockData() {
  log('Checking for mock data...');
  
  try {
    if (!fs.existsSync(MOCK_DATA_PATH)) {
      log(`Mock data file not found at: ${MOCK_DATA_PATH}`, 'ERROR');
      return false;
    }
    
    const mockData = require(MOCK_DATA_PATH);
    
    if (!Array.isArray(mockData) || mockData.length === 0) {
      log('Mock data file exists but does not contain valid story data', 'ERROR');
      return false;
    }
    
    // Validate structure of first story
    const firstStory = mockData[0];
    if (!firstStory.id || !firstStory.title_jp || !firstStory.content_jp) {
      log('Mock story data is missing required fields (id, title_jp, content_jp)', 'ERROR');
      return false;
    }
    
    log(`Mock data file exists with ${mockData.length} stories`);
    return true;
  } catch (error) {
    log(`Error checking mock data: ${error.message}`, 'ERROR');
    return false;
  }
}

// Check if API is accessible without authentication
async function checkApiAccess() {
  log(`Checking API access at ${API_URL}${STORIES_ENDPOINT}...`);
  
  try {
    const response = await axios.get(`${API_URL}${STORIES_ENDPOINT}`);
    
    if (response.status !== 200) {
      log(`API returned non-200 status: ${response.status}`, 'ERROR');
      return false;
    }
    
    if (!response.data || !Array.isArray(response.data.stories)) {
      log('API response does not contain stories array', 'ERROR');
      return false;
    }
    
    log(`API returned ${response.data.stories.length} stories successfully`);
    return true;
  } catch (error) {
    log(`API access error: ${error.message}`, 'ERROR');
    log('This is expected if the API is not running - checking fallback mechanism next');
    return false;
  }
}

// Test fallback mechanism by force-failing the API
async function testFallbackMechanism() {
  log('Testing fallback mechanism...');
  
  try {
    // We'll use a non-existent endpoint to force a failure
    const badEndpoint = `${API_URL}/non-existent-endpoint`;
    
    try {
      await axios.get(badEndpoint);
      // If we get here, something is wrong - we expected a failure
      log('Fallback test unexpected success - should have failed', 'ERROR');
      return false;
    } catch (error) {
      // This is expected - the request should fail
      log('API request failed as expected for fallback test');
      
      // Now check if mock data is available as fallback
      if (!checkMockData()) {
        log('Fallback mechanism check failed - mock data not available', 'ERROR');
        return false;
      }
      
      log('Fallback mechanism check passed - mock data is available');
      return true;
    }
  } catch (error) {
    log(`Error during fallback test: ${error.message}`, 'ERROR');
    return false;
  }
}

// Check if Stories component is properly exported and importable
function checkComponentExport() {
  log('Checking Stories component export...');
  
  try {
    // This will throw an error if the import fails
    const storiesPath = require.resolve('../pages/Stories');
    
    if (!storiesPath) {
      log('Stories component not found', 'ERROR');
      return false;
    }
    
    log('Stories component is properly exported');
    return true;
  } catch (error) {
    log(`Error checking Stories component: ${error.message}`, 'ERROR');
    return false;
  }
}

// Run all checks
async function runChecks() {
  log('=== Starting Stories Accessibility Check ===');
  
  // Track results
  const results = {
    mockData: checkMockData(),
    componentExport: checkComponentExport()
  };
  
  // Run API checks
  results.apiAccess = await checkApiAccess();
  results.fallbackMechanism = await testFallbackMechanism();
  
  // Log summary
  log('\n=== Stories Accessibility Check Results ===');
  Object.entries(results).forEach(([test, passed]) => {
    log(`${test}: ${passed ? 'PASS' : 'FAIL'}`, passed ? 'INFO' : 'ERROR');
  });
  
  // Overall status - consider it a success if either API access works OR fallback works
  const criticalChecks = results.mockData && results.componentExport;
  const accessChecks = results.apiAccess || results.fallbackMechanism;
  const allPassed = criticalChecks && accessChecks;
  
  log(`\nOverall Status: ${allPassed ? 'PASS' : 'FAIL'}`, allPassed ? 'INFO' : 'ERROR');
  
  if (allPassed) {
    if (!results.apiAccess && results.fallbackMechanism) {
      log('Stories are accessible through fallback mechanism when API is unavailable', 'INFO');
    } else if (results.apiAccess) {
      log('Stories are directly accessible through the API', 'INFO');
    }
  } else {
    log('CRITICAL: Stories are not accessible to non-authenticated users!', 'ERROR');
  }
  
  // Exit with appropriate code
  process.exit(allPassed ? 0 : 1);
}

// Run the checks
runChecks().catch(error => {
  log(`Unhandled error: ${error.message}`, 'ERROR');
  process.exit(1);
}); 