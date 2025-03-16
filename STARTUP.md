# Todaku Reader Startup Guide

This guide will help you start the Todaku Reader application properly, ensuring that both the frontend and backend are correctly configured and running.

## Quick Start

The easiest way to start the entire application (both frontend and backend) is to use our clean startup script:

```bash
# Stop any running servers first
npx kill-port 3000 5001

# Start both servers with one command
npm run dev:clean
```

This will start:
- The Express backend on port 5001
- The React frontend on port 3000

Visit http://localhost:3000 to access the application.

## Starting Components Separately

If you prefer to start components individually for development purposes:

### 1. Start the Backend Server

```bash
# Navigate to the project root
cd /path/to/TodakuReader

# Start the server with proper environment variables
npm run start:safe
```

The backend will be available at http://localhost:5001/api

### 2. Start the React Frontend

In a new terminal window:

```bash
# Navigate to the client directory
cd /path/to/TodakuReader/client

# Start the React development server
npm start
```

The frontend will be available at http://localhost:3000

## Troubleshooting

If you encounter issues:

1. **Check for running processes**:
   ```bash
   npm run check-processes
   ```

2. **Kill processes on specific ports**:
   ```bash
   npx kill-port 3000 5001
   ```

3. **Test the server connection**:
   ```bash
   # Start the test server
   npm run test-server
   ```

   Then visit http://localhost:3001/server-status.html

4. **Update Google Cloud Console**:
   Ensure your Google OAuth client has these authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:3001
   - http://localhost:5001

## Database Setup

If you need to initialize or reset the database:

```bash
# Create the database if it doesn't exist
psql -c "CREATE DATABASE tadoku_reader;" postgres

# Initialize the database schema
node init-db.js
```

## Environment Variables

Make sure your `.env` file in the project root has the correct settings:

```
# Database configuration
DB_USER=yourdbuser
DB_PASSWORD=yourdbpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tadoku_reader

# Server configuration
PORT=5001
NODE_ENV=development

# JWT Secret for authentication
JWT_SECRET=yourjwtsecret

# Google OAuth configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

And your `client/.env` file:

```
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5001/api
```

For more detailed troubleshooting information, see the TROUBLESHOOTING.md file. 