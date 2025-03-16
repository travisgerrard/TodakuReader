# Production Server Setup for TodakuReader

This document provides instructions for setting up TodakuReader on a production server.

## Prerequisites

1. A Linux server (Ubuntu/Debian recommended)
2. Node.js 16+ and npm installed
3. PostgreSQL database server
4. PM2 process manager (`npm install -g pm2`)
5. Nginx or Apache for reverse proxy (optional but recommended)

## Manual Setup Steps

If you prefer to set up manually instead of using the deployment script:

### 1. Server Preparation

```bash
# Update packages
sudo apt update
sudo apt upgrade -y

# Install Node.js if not already installed
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install PostgreSQL if needed
sudo apt install postgresql postgresql-contrib -y
```

### 2. PostgreSQL Database Setup

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE tadoku_reader;
CREATE USER db_username WITH ENCRYPTED PASSWORD 'db_password';
GRANT ALL PRIVILEGES ON DATABASE tadoku_reader TO db_username;
\q

# Import schema (if you have a SQL dump)
psql -U db_username -d tadoku_reader -f path/to/schema.sql
```

### 3. Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/todakureader
sudo chown $USER:$USER /var/www/todakureader

# Clone repository
git clone https://github.com/travisgerrard/TodakuReader.git /var/www/todakureader
cd /var/www/todakureader

# Install dependencies
npm install --production
cd client
npm install
npm run build
cd ..

# Create .env file
cp .env.example .env
# Edit .env with your production values
nano .env
```

### 4. PM2 Setup

```bash
# Create ecosystem.config.js file
cat > ecosystem.config.js << EOL
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

# Start the application
pm2 start ecosystem.config.js

# Set PM2 to start on system boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp /home/$USER
pm2 save
```

### 5. Nginx Setup (Recommended)

```bash
# Install Nginx
sudo apt install nginx -y

# Create configuration file
sudo nano /etc/nginx/sites-available/todakureader

# Add the following configuration:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/todakureader /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt (optional but recommended)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Using the Deployment Script

The `deploy.sh` script automates most of the steps above:

1. Edit `.env.production` with your server's environment variables
2. Update the SERVER_USER and SERVER_DIR variables in `deploy.sh`
3. Make sure you have SSH access to your server
4. Run the script:
   ```bash
   ./deploy.sh
   ```

## Troubleshooting

1. **Application not starting:**
   - Check logs: `pm2 logs todakureader`
   - Verify environment variables: `cat /var/www/todakureader/.env`

2. **Database connection issues:**
   - Verify database exists: `sudo -u postgres psql -c "\l"`
   - Check database user: `sudo -u postgres psql -c "\du"`
   - Verify connection settings in .env file

3. **Nginx/Apache problems:**
   - Check server status: `sudo systemctl status nginx`
   - Check error logs: `sudo tail -f /var/log/nginx/error.log`

## Backup Strategy

1. **Database Backup:**
   ```bash
   # Create a backup script
   mkdir -p /var/www/backups
   sudo -u postgres pg_dump tadoku_reader > /var/www/backups/todakureader_$(date +%Y%m%d).sql
   ```

2. **Application Backup:**
   ```bash
   # Backup application files
   tar -czf /var/www/backups/todakureader_app_$(date +%Y%m%d).tar.gz /var/www/todakureader
   ```

3. **Set up a cron job for daily backups:**
   ```bash
   crontab -e
   # Add:
   0 2 * * * sudo -u postgres pg_dump tadoku_reader > /var/www/backups/todakureader_$(date +%Y%m%d).sql && tar -czf /var/www/backups/todakureader_app_$(date +%Y%m%d).tar.gz /var/www/todakureader
   ```

## Security Considerations

1. **Firewall Setup:**
   ```bash
   sudo apt install ufw -y
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. **Database Security:**
   - Use strong passwords
   - Restrict database connection to localhost
   - Consider setting up role-based access

3. **Application Security:**
   - Keep Node.js and npm packages updated
   - Monitor for security vulnerabilities: `npm audit`
   - Use HTTPS with a valid SSL certificate 