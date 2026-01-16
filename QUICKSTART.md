# Quick Start Commands

🚀 **Copy-paste ready commands untuk deploy dan menjalankan Broadcast WebUI**

## 1️⃣ Setup Awal (Pertama Kali)

```bash
# Clone repository
git clone https://github.com/tedmark678-afk/broadcast-webui.git
cd broadcast-webui

# Run setup script (install dependencies, create .env.local)
bash scripts/setup.sh

# Edit configuration sesuai kebutuhan Anda
nano .env.local
```

## 2️⃣ Development (Lokal Testing)

```bash
# Start development server dengan hot reload
npm run dev

# Open di browser
# http://localhost:3000

# Stop dengan Ctrl+C
```

## 3️⃣ Docker Deployment (Single Command)

```bash
# Build dan run dengan Docker Compose
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app

# Stop semua services
docker-compose down
```

## 4️⃣ Production Deployment (Ubuntu/Debian)

```bash
# 1. Update dan install dependencies
sudo apt-get update
sudo apt-get install -y curl git ffmpeg docker.io docker-compose

# 2. Clone repository
git clone https://github.com/tedmark678-afk/broadcast-webui.git
cd broadcast-webui

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local dengan settings Anda
sudo nano .env.local

# 4. Deploy
bash scripts/deploy.sh production

# 5. Setup Nginx reverse proxy
sudo apt-get install -y nginx
sudo cp nginx.conf.example /etc/nginx/sites-available/broadcast-webui
sudo ln -s /etc/nginx/sites-available/broadcast-webui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Access
# http://your-server-ip:3000
```

## 5️⃣ Orange Pi Deployment (ARM64 - Recommended)

```bash
# 1. SSH ke Orange Pi
ssh user@192.168.1.xx

# 2. Install dependencies
sudo apt-get update
sudo apt-get install -y curl git ffmpeg docker.io

# 3. Clone dan setup
git clone https://github.com/tedmark678-afk/broadcast-webui.git
cd broadcast-webui
cp .env.example .env.local

# 4. Edit configuration
# Update ONVIF_HOST, FFmpeg paths, etc.
sudo nano .env.local

# 5. Build Docker image untuk ARM64
docker buildx build --platform linux/arm64 -t broadcast-webui:latest .

# 6. Run dengan Docker Compose
sudo docker-compose up -d

# 7. Akses
# http://192.168.1.xx:3000
```

## 6️⃣ API Commands (curl testing)

```bash
# Get system status
curl http://localhost:3000/api/status

# Get PTZ status
curl http://localhost:3000/api/ptz/status

# PTZ Pan left
curl -X POST "http://localhost:3000/api/ptz/pan?speed=0.5&direction=left"

# PTZ Tilt up
curl -X POST "http://localhost:3000/api/ptz/tilt?speed=0.5&direction=up"

# PTZ Zoom in
curl -X POST "http://localhost:3000/api/ptz/zoom?speed=0.3&direction=in"

# Get encoding presets
curl http://localhost:3000/api/encode/presets

# Start encoding
curl -X POST http://localhost:3000/api/encode/start \
  -H "Content-Type: application/json" \
  -d '{
    "input": "rtsp://camera:554/stream",
    "output": "rtmp://server/live/main",
    "preset": "h264_1080p_5000k"
  }'

# Get routing list
curl http://localhost:3000/api/routing/list

# Create new route
curl -X POST http://localhost:3000/api/routing/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Stream",
    "source": "rtsp://camera:554/stream",
    "destinations": ["rtmp://server/live/main"]
  }'
```

## 7️⃣ Environment Configuration Examples

### Kamera ONVIF Standard
```bash
ONVIF_HOST=192.168.1.100
ONVIF_PORT=8080
ONVIF_USERNAME=admin
ONVIF_PASSWORD=admin
```

### FFmpeg di Orange Pi
```bash
FFMPEG_BIN=/usr/bin/ffmpeg
FFPROBE_BIN=/usr/bin/ffprobe
```

### Streaming Output Options
```bash
# RTMP server
RTMP_SERVER=rtmp://192.168.1.50/live

# RTSP server
RTSP_SERVER=rtsp://0.0.0.0:554

# SRT server
SRT_SERVER=srt://0.0.0.0:9710
```

## 8️⃣ Troubleshooting

```bash
# Check if port 3000 is in use
lsof -i :3000

# Kill process using port 3000
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev

# Check FFmpeg installation
ffmpeg -version

# Test ONVIF camera connection
curl -u admin:admin http://192.168.1.100:8080/onvif/device_service

# View Docker logs
docker-compose logs -f app

# Restart Docker service
sudo systemctl restart docker

# Check disk space
df -h

# Check memory usage
free -h
```

## 9️⃣ Maintenance Commands

```bash
# Backup configuration
bash scripts/backup.sh

# Update dependencies
npm update

# Build for production
npm run build

# Start production server
npm start

# Rebuild Docker image
npm run docker:build

# Prune Docker (free up space)
docker system prune -a

# View application logs (systemd)
sudo journalctl -u broadcast-webui -f
```

## 10️⃣ Useful Aliases (Masukkan ke ~/.bashrc atau ~/.zshrc)

```bash
# Add to your shell config file
alias bw-start='cd ~/broadcast-webui && npm run dev'
alias bw-docker='docker-compose up -d'
alias bw-logs='docker-compose logs -f app'
alias bw-stop='docker-compose down'
alias bw-status='docker-compose ps'
alias bw-deploy='bash scripts/deploy.sh production'
alias bw-backup='bash scripts/backup.sh'

# Then reload
source ~/.bashrc
```

## 📄 Full Documentation

Untuk dokumentasi lengkap, lihat:
- [README.md](README.md) - Feature dan overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment guide
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development guide untuk contributors

## 😫 Support & Issues

Jika ada masalah:
1. Check [GitHub Issues](https://github.com/tedmark678-afk/broadcast-webui/issues)
2. Check logs: `docker-compose logs app`
3. Verify .env.local configuration
4. Test ONVIF camera connection
5. Check FFmpeg installation: `ffmpeg -version`
