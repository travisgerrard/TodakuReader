#!/bin/bash

# Load environment variables from .env
export $(grep -v '^#' .env | xargs)

# Override DB name if it's incorrectly set
export DB_NAME=tadoku_reader

# Start the server
echo "Starting server with database: $DB_NAME"
cd server && node index.js 