const express = require('express');
const path = require('path');
const http = require('http');
const https = require('https');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const CAMERA_IP = process.env.CAMERA_IP || '192.168.1.11';
const CAMERA_PORT = process.env.CAMERA_PORT || 81;
const CAMERA_USER = process.env.CAMERA_USER || '';
const CAMERA_PASS = process.env.CAMERA_PASS || '';

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: Make HTTP request to camera
function cameraRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: CAMERA_IP,
      port: CAMERA_PORT,
      path: path,
      method: method,
      timeout: 5000
    };

    // Add auth if provided
    if (CAMERA_USER && CAMERA_PASS) {
      const auth = Buffer.from(`${CAMERA_USER}:${CAMERA_PASS}`).toString('base64');
      options.headers = { 'Authorization': `Basic ${auth}` };
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseData
        });
      });
    });

    req.on('error', (err) => {
      console.error('[Camera Error]', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Camera timeout'));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

// Main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    server: 'running',
    camera: `${CAMERA_IP}:${CAMERA_PORT}`,
    timestamp: new Date().toISOString()
  });
});

// Camera info endpoint
app.get('/api/camera/info', async (req, res) => {
  try {
    const result = await cameraRequest('/cgi-bin/api.cgi?action=getStatus');
    console.log('[Camera Info]', result.status);
    res.json({
      status: 'ok',
      camera_status: result.status,
      response: result.body.substring(0, 200)
    });
  } catch (e) {
    res.json({
      status: 'error',
      message: e.message,
      camera: `${CAMERA_IP}:${CAMERA_PORT}`
    });
  }
});

// PTZ Control endpoint
app.post('/api/ptz', async (req, res) => {
  const { command, pan = 0, tilt = 0, zoom = 0 } = req.body;
  
  console.log('[PTZ API]', { command, pan, tilt, zoom });

  try {
    let cameraCommand = '';

    // Map joystick data to camera commands
    if (command) {
      switch (command) {
        case 'up':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&tiltUp=1';
          break;
        case 'down':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&tiltDown=1';
          break;
        case 'left':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&panLeft=1';
          break;
        case 'right':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&panRight=1';
          break;
        case 'zoomin':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&zoomIn=1';
          break;
        case 'zoomout':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&zoomOut=1';
          break;
        case 'focus':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&autoFocus=1';
          break;
        case 'home':
          cameraCommand = '/cgi-bin/api.cgi?action=ptzControl&presetGoto=1';
          break;
      }
    } else if (pan !== 0 || tilt !== 0 || zoom !== 0) {
      // Continuous pan/tilt/zoom
      const panVal = Math.round(pan * 100);
      const tiltVal = Math.round(tilt * 100);
      const zoomVal = Math.round(zoom * 10);
      cameraCommand = `/cgi-bin/api.cgi?action=ptzControl&pan=${panVal}&tilt=${tiltVal}&zoom=${zoomVal}`;
    }

    if (cameraCommand) {
      const result = await cameraRequest(cameraCommand);
      console.log('[PTZ Response]', result.status);
      res.json({
        status: 'sent',
        command,
        pan, tilt, zoom,
        camera_response: result.status
      });
    } else {
      res.json({ status: 'idle', command: 'none' });
    }
  } catch (e) {
    console.error('[PTZ Error]', e.message);
    res.status(500).json({
      status: 'error',
      message: e.message
    });
  }
});

// Stream proxy endpoint
app.get('/api/stream', async (req, res) => {
  const streamUrl = req.query.url || `rtsp://${CAMERA_IP}/1/h264major`;
  
  console.log('[Stream API]', streamUrl);
  
  try {
    // Use FFprobe to check stream
    const ffprobe = spawn('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,avg_frame_rate',
      '-of', 'json',
      streamUrl
    ], { timeout: 5000 });

    let output = '';
    ffprobe.stdout.on('data', (data) => { output += data.toString(); });
    
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
            url: streamUrl,
            message: 'Stream detected but not yet fully parsed'
          });
        }
      } catch (e) {
        res.json({
          status: 'pending',
          url: streamUrl
        });
      }
    });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: e.message
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

// Start server
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`\n✅ PTZ Control Server running at http://localhost:${PORT}`);
  console.log(`📡 Camera: http://${CAMERA_IP}:${CAMERA_PORT}`);
  console.log(`🎮 PTZ endpoint: http://localhost:${PORT}/api/ptz`);
  console.log(`📊 Stream endpoint: http://localhost:${PORT}/api/stream\n`);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.close(() => process.exit(0));
});
