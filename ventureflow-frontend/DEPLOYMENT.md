# Ventureflow Frontend Deployment Guide

**App Name:** Ventureflow  
**Version:** 1.0.0  
**Developed By:** Acquaint Technologies

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Method 1: NPM Build Deployment](#method-1-npm-build-deployment)
3. [Method 2: Docker Deployment with Nixpacks](#method-2-docker-deployment-with-nixpacks)
4. [Environment Configuration](#environment-configuration)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 18+ and npm installed
- Git (for cloning the repository)
- Docker (for Docker deployment method)
- A web server (Nginx, Apache, or similar) for serving static files

---

## Method 1: NPM Build Deployment

### Step 1: Install Dependencies

```bash
cd ventureflow-frontend-main
npm install
```

### Step 2: Build the Application

```bash
npm run build
```

This will create a `dist` folder containing the production-ready static files.

### Step 3: Serve the Built Files

#### Option A: Using a Static File Server (Node.js)

```bash
# Install serve globally
npm install -g serve

# Serve the dist folder
serve -s dist -l 3000
```

#### Option B: Using Nginx

1. Copy the `dist` folder to your web server directory:

```bash
cp -r dist /var/www/ventureflow
```

2. Create an Nginx configuration file (`/etc/nginx/sites-available/ventureflow`):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ventureflow;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/ventureflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Option C: Using Apache

1. Copy the `dist` folder to your web server directory:

```bash
cp -r dist /var/www/html/ventureflow
```

2. Create a `.htaccess` file in the `ventureflow` directory:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

3. Ensure `mod_rewrite` is enabled:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

---

## Method 2: Docker Deployment with Nixpacks

Nixpacks automatically detects your application type and builds an optimized Docker image.

### Step 1: Install Nixpacks

```bash
# Using curl
curl -sSL https://nixpacks.com/install.sh | bash

# Or using npm
npm install -g nixpacks
```

### Step 2: Build Docker Image with Nixpacks

```bash
# Navigate to project directory
cd ventureflow-frontend-main

# Build the Docker image
nixpacks build . --name ventureflow-frontend
```

Nixpacks will automatically:

- Detect it's a Vite/React application
- Install dependencies
- Run the build process
- Create an optimized production image

### Step 3: Run the Docker Container

```bash
# Run the container
docker run -d \
  --name ventureflow \
  -p 80:3000 \
  ventureflow-frontend
```

### Step 4: Verify Deployment

```bash
# Check if container is running
docker ps

# View logs
docker logs ventureflow

# Access the application
# Open browser and navigate to http://localhost or your server IP
```

### Alternative: Using Docker Compose with Nixpacks

Create a `docker-compose.yml` file (if not already present):

```yaml
version: '3.8'

services:
  ventureflow:
    image: ventureflow-frontend
    container_name: ventureflow
    ports:
      - '80:3000'
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Then run:

```bash
# Build with nixpacks first
nixpacks build . --name ventureflow-frontend

# Start with docker-compose
docker-compose up -d
```

### Docker Management Commands

```bash
# Stop the container
docker stop ventureflow

# Start the container
docker start ventureflow

# Restart the container
docker restart ventureflow

# Remove the container
docker rm -f ventureflow

# Remove the image
docker rmi ventureflow-frontend

# View container logs
docker logs -f ventureflow
```

---

## Environment Configuration

### Setting Environment Variables

If your application requires environment variables, create a `.env.production` file:

```env
VITE_API_URL=https://api.your-domain.com
VITE_APP_NAME=Ventureflow
VITE_APP_VERSION=1.0.0
```

**Note:** Vite requires environment variables to be prefixed with `VITE_` to be exposed to the client.

### For NPM Build:

Environment variables are embedded during build time. Make sure `.env.production` exists before running `npm run build`.

### For Docker/Nixpacks:

You can pass environment variables when running the container:

```bash
docker run -d \
  --name ventureflow \
  -p 80:3000 \
  -e VITE_API_URL=https://api.your-domain.com \
  ventureflow-frontend
```

Or use an env file:

```bash
docker run -d \
  --name ventureflow \
  -p 80:3000 \
  --env-file .env.production \
  ventureflow-frontend
```

---

## Troubleshooting

### Build Issues

**Problem:** `npm run build` fails with memory errors

```bash
# Solution: Increase Node.js memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Problem:** Module not found errors

```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker Issues

**Problem:** Nixpacks build fails

```bash
# Solution: Check nixpacks logs and ensure all dependencies are in package.json
nixpacks build . --name ventureflow-frontend --verbose
```

**Problem:** Container exits immediately

```bash
# Solution: Check container logs
docker logs ventureflow

# Ensure the container has a proper start command
docker inspect ventureflow-frontend
```

### Routing Issues (404 on Refresh)

If you get 404 errors when refreshing pages in production, ensure your web server is configured to redirect all requests to `index.html` (see Nginx/Apache configurations above).

### Performance Optimization

1. **Enable Gzip/Brotli compression** on your web server
2. **Set proper cache headers** for static assets
3. **Use a CDN** for global distribution
4. **Enable HTTP/2** on your web server

---

## Production Checklist

- [ ] Environment variables are properly configured
- [ ] API endpoints are pointing to production servers
- [ ] Build completes without errors
- [ ] All routes work correctly (no 404s on refresh)
- [ ] Static assets are loading properly
- [ ] Gzip compression is enabled
- [ ] Cache headers are set correctly
- [ ] SSL certificate is installed (HTTPS)
- [ ] Security headers are configured
- [ ] Application is accessible from the internet

---

## Support

For issues or questions, contact **Acquaint Technologies**.

**Version:** 1.0.0  
**Last Updated:** December 2025
