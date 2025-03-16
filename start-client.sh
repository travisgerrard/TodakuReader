#!/bin/bash

# First, make sure any http-server instances are stopped
pkill -f http-server || true

# Start the client
echo "Starting React client..."
cd client && npm start 