#!/bin/bash

# Check if port 3001 is already in use
if lsof -i:3001 -t >/dev/null ; then
  echo "Port 3001 is already in use. Exiting to prevent crash-restart cycle."
  exit 1
fi

# Set environment variables
export PORT=3001
export HOST=0.0.0.0
export WDS_SOCKET_HOST=0.0.0.0
export DANGEROUSLY_DISABLE_HOST_CHECK=true

# Create a temporary webpack config file
cat > webpack.config.temp.js << 'EOL'
module.exports = {
  devServer: {
    port: 3001,
    host: '0.0.0.0',
    allowedHosts: ['all'],
    historyApiFallback: true,
    hot: true
  }
};
EOL

# Start the React app with the custom webpack config
NODE_ENV=development npx react-scripts start --config webpack.config.temp.js 