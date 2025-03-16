# Troubleshooting the Todaku Reader Application

This guide will help you resolve common issues with running the Todaku Reader application, particularly focusing on server connection problems and Google OAuth authentication.

## Problem: Server Connection Issues

If your server-status.html page shows connection errors, follow these steps:

### Step 1: Check for Running Processes

First, let's check if there are any conflicting processes running:

```bash
npm run check-processes
```

If you see processes running on ports 3000 or 5001, you may need to kill them:

```bash
kill -9 [PID]
```

Replace `[PID]` with the process ID from the output.

### Step 2: Start the Server Properly

Use our safe starter script to ensure the server starts with the correct environment variables:

```bash
npm run start:safe
```

Keep this terminal window open while the server is running.

### Step 3: Start the Test HTTP Server

In a new terminal window, run:

```bash
npm run test-server
```

This will start an HTTP server on port 3001 to serve the test pages.

### Step 4: Test the Connection

Open your browser and navigate to:
- http://localhost:3001/server-status.html

If everything is working correctly, you should see green indicators for both the API connection and auth route.

### Step 5: Test Google OAuth

Once the server connections are working, click the "Go to OAuth Test Page" button on the server-status page, or navigate directly to:
- http://localhost:3001/oauth-test.html

## Database Connection Issues

If you're encountering database connection errors:

1. Make sure PostgreSQL is running
2. Verify the database exists:
   ```bash
   psql -l
   ```
3. Check if you can connect to it manually:
   ```bash
   psql -d tadoku_reader
   ```
4. Confirm the environment variables in the .env file match your PostgreSQL configuration

## Google OAuth Issues

For Google OAuth problems:

1. Verify your Google Cloud Console configuration:
   - Go to https://console.cloud.google.com/apis/credentials
   - Check that the OAuth 2.0 Client ID includes these authorized JavaScript origins:
     - http://localhost:3000
     - http://localhost:3001
     - http://localhost:5001

2. Verify the environment variables:
   - Check that `GOOGLE_CLIENT_ID` in the root .env file matches your Google Cloud Console client ID
   - Check that `REACT_APP_GOOGLE_CLIENT_ID` in the client/.env file matches as well

3. Clear browser cookies and cache, especially for accounts.google.com

## Advanced Debugging

If you still encounter issues:

1. Check the server logs for specific error messages
2. Use the browser developer console (F12) to check for JavaScript errors or network issues
3. Try using the server-test.html and oauth-test.html pages which provide detailed debugging information 