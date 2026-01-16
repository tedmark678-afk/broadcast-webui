# Deployment Guide

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your configuration

# Start dev server
npm run dev

# Access at http://localhost:3000
```

### Docker Deployment

```bash
# Build image
npm run docker:build

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Production Deployment

```bash
# Run setup script
bash scripts/setup.sh

# Run deployment script
bash scripts/deploy.sh production
```

## Environment Configuration

Edit `.env.local` with your settings:

```bash
# ONVIF Camera
ONVIF_HOST=192.168.1.100
ONVIF_PORT=8080
ONVIF_USERNAME=admin
ONVIF_PASSWORD=admin

# FFmpeg paths
FFMPEG_BIN=/usr/bin/ffmpeg
FFPROBE_BIN=/usr/bin/ffprobe

# Server
NEXT_PUBLIC_API_BASE=http://localhost:3000
PORT=3000
```

## Docker Image Details

### Multi-stage Build

1. **Build stage**: Compiles Next.js and installs dependencies
2. **Runtime stage**: Minimal image with FFmpeg and Node.js

### Volumes

- `./config:/app/config` - Configuration files
- `./logs:/app/logs` - Application logs

### Network

Docker Compose creates a `broadcast` network for service communication.

## Systemd Service (Optional)

Create `/etc/systemd/system/broadcast-webui.service`:

```ini
[Unit]
Description=Broadcast WebUI Service
After=network.target

[Service]
Type=simple
User=broadcast
WorkingDirectory=/opt/broadcast-webui
Environment="NODE_ENV=production"
EnvironmentFile=/opt/broadcast-webui/.env.production
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable broadcast-webui
sudo systemctl start broadcast-webui
```

## Nginx Reverse Proxy

Create `/etc/nginx/sites-available/broadcast-webui`:

```nginx
upstream broadcast_backend {
    server localhost:3000;
}

server {
    listen 80;
    server_name broadcast.example.com;

    client_max_body_size 100M;

    location / {
        proxy_pass http://broadcast_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://broadcast_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable and test:

```bash
sudo ln -s /etc/nginx/sites-available/broadcast-webui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/TLS with Let's Encrypt

```bash
sudo certbot certonly --standalone -d broadcast.example.com

# Update nginx config with:
# listen 443 ssl;
# ssl_certificate /etc/letsencrypt/live/broadcast.example.com/fullchain.pem;
# ssl_certificate_key /etc/letsencrypt/live/broadcast.example.com/privkey.pem;
```

## Monitoring and Logging

### View logs

```bash
# Docker Compose
docker-compose logs -f app

# Systemd
sudo journalctl -u broadcast-webui -f
```

### Health checks

```bash
curl http://localhost:3000/api/status
```

## Backup and Recovery

### Create backup

```bash
bash scripts/backup.sh
```

### Restore from backup

```bash
tar -xzf backups/broadcast-webui_backup_TIMESTAMP.tar.gz
```

## Performance Tuning

### Docker resources

Edit `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

### Node.js optimization

```bash
# Increase max file descriptors
ulimit -n 65536

# Use cluster mode
export NODE_ENV=production
node --max-old-space-size=2048 server.js
```

## Troubleshooting

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000

# Or use different port
PORT=3001 npm start
```

### FFmpeg not found

```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Verify
ffmpeg -version
```

### ONVIF connection issues

1. Verify camera IP and port are correct
2. Check firewall rules allow port 8080
3. Test connection with `onvif-cli` tool
4. Check camera credentials

### Database/persistence issues

Ensure volume mounts have proper permissions:

```bash
chown -R 1000:1000 ./config ./logs
chmod -R 755 ./config ./logs
```

## Support

For issues and questions:
1. Check GitHub Issues: https://github.com/tedmark678-afk/broadcast-webui/issues
2. Review documentation in README.md
3. Check deployment logs
