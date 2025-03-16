# Google OAuth Authentication Troubleshooting

This document provides steps to troubleshoot and fix Google OAuth authentication issues in the Todaku Reader application.

## Issue: 400 Bad Request when authenticating with Google

If you're experiencing a 400 Bad Request error when trying to sign in with Google, follow these steps:

### 1. Check the parameter format

The server is expecting the Google token in a parameter called `tokenId`, but the client may be sending it as `token`. We've updated the client to use the correct parameter name.

### 2. Verify Google Client ID

Ensure your Google Client ID is correctly set up in:
- `.env` file in the client directory
- `.env` file in the root directory for the server
- Google Cloud Console's Authorized JavaScript origins (should include `http://localhost:3000`)
- Google Cloud Console's Authorized redirect URIs (should include `http://localhost:3000`)

### 3. Test using the diagnostic page

We've created a diagnostic HTML page that allows you to test Google authentication in isolation:

1. Open `http://localhost:3000/google-auth-test.html` in your browser
2. Sign in with Google
3. Click the "Test API Call with Token" button
4. Check the response from the server

### 4. Database connection issues

If you're seeing database errors, make sure:
- PostgreSQL is running on your machine
- The correct database name is specified in your `.env` file (should be `tadoku_reader`)
- The database user has permission to access the database

### 5. Starting the application correctly

We've created two scripts to help start the application correctly:

```bash
# Start the server (in one terminal)
./start-server.sh

# Start the client (in another terminal)
./start-client.sh
```

Make sure you're not running the old http-server on port 3000, as this will conflict with the React development server.

### 6. Check the server logs

If you're still having issues, check the server logs for more detailed error messages. Common issues include:
- Invalid token format
- Token verification failure
- Database connection problems
- Environment variable configuration issues

## Advanced troubleshooting

If the above steps don't resolve your issue, you may need to:

1. Clear your browser cookies and localStorage
2. Verify CORS settings in the server
3. Check for network issues (firewalls, VPNs)
4. Regenerate your Google OAuth credentials
5. Update the Google Sign-In library version 