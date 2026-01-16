const express = require('express');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stream endpoint - proxy RTSP to HLS
app.get('/api/stream', (req, res) => {
  const streamUrl = req.query.url || 'rtsp://192.168.1.11/1/h264major';
  
  console.log('[Stream API] Received request for:', streamUrl);
  
  // Validate URL
  if (!streamUrl.match(/^(rtsp|http|file):/i)) {
    return res.status(400).json({ error: 'Invalid stream URL' });
  }

  // Use FFmpeg to probe stream
  const ffprobe = spawn('ffprobe', [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height,avg_frame_rate,duration',
    '-of', 'json',
    streamUrl
  ], { timeout: 5000 });

  let output = '';
  let error = '';

  ffprobe.stdout.on('data', (data) => {
    output += data.toString();
  });

  ffprobe.stderr.on('data', (data) => {
    error += data.toString();
  });

  ffprobe.on('close', (code) => {
    try {
      if (code === 0 && output) {
        const info = JSON.parse(output);
        res.json({
          status: 'ok',
          stream: info.streams?.[0] || {},
          url: streamUrl
        });
      } else {
        res.json({
          status: 'pending',
          message: 'Stream processing...',
          url: streamUrl
        });
      }
    } catch (e) {
      res.json({
        status: 'pending',
        message: 'Detecting stream...',
        url: streamUrl
      });
    }
  });
});

// PTZ control endpoint
app.post('/api/ptz', (req, res) => {
  const { command, pan, tilt, zoom } = req.body;
  
  console.log('[PTZ API] Command:', { command, pan, tilt, zoom });
  
  // TODO: Integrate with camera HTTP API
  // Example: http://192.168.1.11:81/cgi-bin/api.cgi?action=...
  
  res.json({ 
    status: 'received',
    command,
    pan: pan || 0,
    tilt: tilt || 0,
    zoom: zoom || 1
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`\n✅ PTZ Control Server running at http://localhost:${PORT}`);
  console.log(`📡 Stream endpoint: http://localhost:${PORT}/api/stream`);
  console.log(`🎮 PTZ endpoint: http://localhost:${PORT}/api/ptz\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
