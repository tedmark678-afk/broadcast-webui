# Broadcast WebUI

Professional broadcast control WebUI dengan dukungan PTZ camera (ONVIF), encode/decode settings, multi-source routing, dan streaming management.

## Features

✅ **PTZ Camera Control**
- ONVIF protocol support
- Pan/Tilt/Zoom control
- Preset management
- Real-time position monitoring

✅ **Encode/Decode Settings**
- FFmpeg wrapper untuk encode/decode
- Multiple codec support (H.264, H.265, VP8, VP9)
- Bitrate, resolution, framerate configuration
- Real-time encoding status

✅ **Multi-Source Routing**
- RTMP input/output routing
- RTSP streaming support
- SRT protocol for secure transport
- Custom routing rules

✅ **WebUI Dashboard**
- Real-time camera preview
- Settings management interface
- System monitoring
- WebSocket for real-time updates

## Quick Start

### Prerequisites
- Node.js 18+
- FFmpeg & FFprobe
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/tedmark678-afk/broadcast-webui.git
cd broadcast-webui

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update .env.local dengan konfigurasi Anda
nano .env.local

# Development
npm run dev

# Production build
npm run build
npm start
```

### Docker Deployment

```bash
# Build Docker image
npm run docker:build

# Run with Docker Compose
docker-compose up -d
```

Akses WebUI di `http://localhost:3000`

## Project Structure

```
├── src/
│   ├── pages/
│   │   ├── api/              # API routes
│   │   │   ├── ptz/          # PTZ camera control
│   │   │   ├── encode/       # FFmpeg encoding
│   │   │   ├── routing/      # Stream routing
│   │   │   └── status/       # System status
│   │   ├── index.tsx         # Dashboard
│   │   ├── ptz.tsx           # PTZ control page
│   │   ├── encoding.tsx      # Encoding settings
│   │   └── routing.tsx       # Routing configuration
│   │
│   ├── components/
│   │   ├── PTZControls.tsx
│   │   ├── EncodingPanel.tsx
│   │   ├── RoutingManager.tsx
│   │   └── StatusMonitor.tsx
│   │
│   ├── lib/
│   │   ├── onvif.ts          # ONVIF client
│   │   ├── ffmpeg.ts         # FFmpeg wrapper
│   │   ├── streaming.ts      # Stream management
│   │   └── socket.ts         # WebSocket handler
│   │
│   └── styles/
│       └── globals.css
│
├── config/                   # Configuration files
├── logs/                     # Application logs
├── public/                   # Static assets
├── docker-compose.yml
├── Dockerfile
├── next.config.js
└── package.json
```

## API Endpoints

### PTZ Control
```bash
# Continuous pan/tilt
POST /api/ptz/pan?speed=0.5&direction=left
POST /api/ptz/tilt?speed=0.5&direction=up

# Zoom control
POST /api/ptz/zoom?speed=0.3&direction=in

# Presets
GET /api/ptz/presets
POST /api/ptz/preset/save?id=1&name=Wide
POST /api/ptz/preset/goto?id=1

# Camera status
GET /api/ptz/status
```

### Encoding
```bash
# Get encoding presets
GET /api/encode/presets

# Start encoding
POST /api/encode/start
{ 
  "input": "rtsp://camera:554/stream",
  "output": "rtmp://server/live/stream",
  "preset": "h264_1080p_5000k"
}

# Stop encoding
POST /api/encode/stop?processId=12345

# Get encoding status
GET /api/encode/status
```

### Routing
```bash
# Create route
POST /api/routing/create
{
  "name": "Main Stream",
  "source": "rtsp://camera:554",
  "destinations": ["rtmp://server/live", "srt://output:9710"]
}

# List routes
GET /api/routing/list

# Toggle route
POST /api/routing/toggle?id=route-1
```

## Environment Variables

Lihat `.env.example` untuk daftar lengkap konfigurasi yang tersedia.

## Contributing

Kontribusi welcome! Silakan buat PR dengan improvement.

## License

MIT
