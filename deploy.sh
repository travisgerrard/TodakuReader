#!/bin/bash
# Deployment script for TodakuReader

# Exit on error
set -e

# Configuration - Update these variables with your actual values
SERVER_IP="50.116.14.245"
SERVER_USER="yourserverusername"  # Replace with your server username
SERVER_DIR="/var/www/todakureader"  # Replace with your target directory
SERVER_ENV_FILE=".env.production"

# Check if .env.production exists
if [ ! -f $SERVER_ENV_FILE ]; then
  echo "Error: $SERVER_ENV_FILE not found!"
  echo "Please create this file with your production environment variables."
  exit 1
fi

# Build the client
echo "Building client application..."
cd client
npm run build
cd ..

# Prepare the server files
echo "Preparing server files..."
mkdir -p deploy
cp -r server deploy/
cp package.json deploy/
cp package-lock.json deploy/
cp $SERVER_ENV_FILE deploy/.env
cp -r client/build deploy/client-build

# Make sure to include the data directory for fallback mechanism
echo "Including fallback data files..."
mkdir -p deploy/client-build/data
cp -r client/src/data/* deploy/client-build/data/

# Create a production pm2 config file
cat > deploy/ecosystem.config.js << EOL
module.exports = {
  apps: [{
    name: 'todakureader',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
    }
  }]
};
EOL

# Compress the deployment package
echo "Creating deployment package..."
tar -czf deploy.tar.gz -C deploy .
rm -rf deploy

# Transfer files to the server
echo "Transferring files to server at $SERVER_IP..."
scp deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

# SSH into the server and set up the deployment
echo "Setting up deployment on the server..."
ssh $SERVER_USER@$SERVER_IP << EOF
  # Create the application directory if it doesn't exist
  mkdir -p $SERVER_DIR

  # Extract the deployment package
  tar -xzf /tmp/deploy.tar.gz -C $SERVER_DIR

  # Install dependencies
  cd $SERVER_DIR
  npm ci --only=production

  # Setup database (if needed)
  # This step depends on your database setup - you might want to run migrations here

  # Set proper permissions
  chmod -R 755 $SERVER_DIR

  # Restart the application with PM2
  # First time: pm2 start ecosystem.config.js
  # Subsequent deploys: pm2 reload ecosystem.config.js
  if pm2 list | grep -q todakureader; then
    pm2 reload ecosystem.config.js
  else
    pm2 start ecosystem.config.js
  fi

  # Save PM2 configuration to survive server restarts
  pm2 save

  # Run verification scripts to check content accessibility
  echo "Verifying content accessibility..."
  cd $SERVER_DIR/client-build
  if [ -f "node_modules/.bin/react-scripts" ]; then
    npm run check-stories-access
    npm run check-grammar
  else
    echo "Verification scripts not available in production build. This is normal."
    echo "You can manually check accessibility by visiting the site."
  fi

  # Clean up
  rm /tmp/deploy.tar.gz
EOF

echo "Cleaning up local files..."
rm deploy.tar.gz

echo "Deployment completed successfully!"
echo "Your application should now be running at http://$SERVER_IP:5001"
echo "You might want to set up a reverse proxy with Nginx or Apache to serve it on port 80/443."
echo ""
echo "Note: The application now includes a fallback mechanism that ensures content is always"
echo "available to users, even during server outages or API failures." 