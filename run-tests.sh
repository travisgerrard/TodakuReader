#!/bin/bash

# Run the tests in the client directory
echo "Running frontend tests..."
cd client && npm test -- --watchAll=false

# Print completion message
if [ $? -eq 0 ]; then
  echo "✅ Frontend tests completed successfully!"
else
  echo "❌ Frontend tests failed!"
  exit 1
fi

# Run server tests
echo "Running backend tests..."
cd ../server && npm test

# Print completion message
if [ $? -eq 0 ]; then
  echo "✅ Backend tests completed successfully!"
else
  echo "❌ Backend tests failed!"
  exit 1
fi

echo "All tests completed successfully!" 