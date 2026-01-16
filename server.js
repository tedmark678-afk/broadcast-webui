const express = require('express');
const path = require('path');
const http = require('http');
const net = require('net');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

let cameraConfig = {
  ip: '192.168.1.11',
  port: 81,
  user: '',
  pass: '',
  protocol: 'http'
};

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: HTTP request to camera
function httpRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: cameraConfig.ip,
      port: cameraConfig.port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    if (cameraConfig.user && cameraConfig.pass) {
      const auth = Buffer.from(`${cameraConfig.user}:${cameraConfig.pass}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    options.headers = headers;

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// VISCA command builder
function buildVISCACommand(command, params = {}) {
  const cmd = Buffer.alloc(20);
  cmd[0] = 0x81; // Camera
  cmd[1] = 0x01; // Sequence
  
  switch(command) {
    case 'pan_left':
      cmd[2] = 0x06; cmd[3] = 0x01;
      cmd[4] = 0x04; cmd[5] = 0x18;
      cmd[6] = 0x03; cmd[7] = 0x01;
      cmd[8] = 0xFF; // End
      return cmd.slice(0, 9);
    
    case 'pan_right':
      cmd[2] = 0x06; cmd[3] = 0x01;
      cmd[4] = 0x04; cmd[5] = 0x18;
      cmd[6] = 0x02; cmd[7] = 0x01;
      cmd[8] = 0xFF;
      return cmd.slice(0, 9);
    
    case 'tilt_up':
      cmd[2] = 0x06; cmd[3] = 0x01;
      cmd[4] = 0x04; cmd[5] = 0x18;
      cmd[6] = 0x01; cmd[7] = 0x03;
      cmd[8] = 0xFF;
      return cmd.slice(0, 9);
    
    case 'tilt_down':
      cmd[2] = 0x06; cmd[3] = 0x01;
      cmd[4] = 0x04; cmd[5] = 0x18;
      cmd[6] = 0x01; cmd[7] = 0x02;
      cmd[8] = 0xFF;
      return cmd.slice(0, 9);
    
    case 'zoom_in':
      cmd[2] = 0x04; cmd[3] = 0x47; cmd[4] = 0x00; cmd[5] = 0xFF;
      return cmd.slice(0, 6);
    
    case 'zoom_out':
      cmd[2] = 0x04; cmd[3] = 0x47; cmd[4] = 0x03; cmd[5] = 0xFF;
      return cmd.slice(0, 6);
    
    case 'home':
      cmd[2] = 0x06; cmd[3] = 0x04; cmd[4] = 0xFF;
      return cmd.slice(0, 5);
    
    default:
      return null;
  }
}

// Send VISCA command
function sendVISCACommand(command) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(cameraConfig.port, cameraConfig.ip);
    const cmdBuf = buildVISCACommand(command);
    
    if (!cmdBuf) {
      reject(new Error('Unknown VISCA command'));
      return;
    }

    socket.on('connect', () => {
      socket.write(cmdBuf);
      setTimeout(() => socket.end(), 200);
    });

    socket.on('end', () => resolve({ status: 'sent' }));
    socket.on('error', reject);
    socket.setTimeout(5000);
  });
}

// Main endpoints
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    camera: `${cameraConfig.ip}:${cameraConfig.port}`,
    protocol: cameraConfig.protocol
  });
});

app.get('/api/camera/info', async (req, res) => {
  try {
    const result = await httpRequest('/cgi-bin/api.cgi?action=getStatus');
    res.json({
      status: 'ok',
      response_code: result.status,
      camera_ip: cameraConfig.ip
    });
  } catch (e) {
    res.status(500).json({
      status: 'error',
      message: e.message
    });
  }
});

app.post('/api/ptz', async (req, res) => {
  const { command, pan = 0, tilt = 0, zoom = 1 } = req.body;
  
  console.log('[PTZ]', { command, pan, tilt, zoom, protocol: cameraConfig.protocol });

  try {
    let result;

    if (cameraConfig.protocol === 'http') {
      // HTTP API commands
      let httpCmd = '';
      
      if (command === 'left') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&panLeft=1';
      } else if (command === 'right') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&panRight=1';
      } else if (command === 'up') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&tiltUp=1';
      } else if (command === 'down') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&tiltDown=1';
      } else if (command === 'zoomin') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&zoomIn=1';
      } else if (command === 'zoomout') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&zoomOut=1';
      } else if (command === 'home') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&presetGoto=1';
      } else if (command === 'focus') {
        httpCmd = '/cgi-bin/api.cgi?action=ptzControl&autoFocus=1';
      }

      if (httpCmd) {
        result = await httpRequest(httpCmd);
        res.json({ status: 'sent', command, protocol: 'http', response: result.status });
      } else {
        res.json({ status: 'idle' });
      }

    } else if (cameraConfig.protocol === 'visca') {
      // VISCA commands
      let viscaCmd = '';
      
      if (command === 'left') viscaCmd = 'pan_left';
      else if (command === 'right') viscaCmd = 'pan_right';
      else if (command === 'up') viscaCmd = 'tilt_up';
      else if (command === 'down') viscaCmd = 'tilt_down';
      else if (command === 'zoomin') viscaCmd = 'zoom_in';
      else if (command === 'zoomout') viscaCmd = 'zoom_out';
      else if (command === 'home') viscaCmd = 'home';

      if (viscaCmd) {
        result = await sendVISCACommand(viscaCmd);
        res.json({ status: 'sent', command, protocol: 'visca', result });
      } else {
        res.json({ status: 'idle' });
      }

    } else if (cameraConfig.protocol === 'onvif') {
      // ONVIF - placeholder for future implementation
      res.json({ status: 'pending', protocol: 'onvif', message: 'ONVIF support coming soon' });
    }
  } catch (e) {
    console.error('[PTZ Error]', e.message);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

app.post('/api/camera/config', (req, res) => {
  const { ip, port, user, pass, protocol } = req.body;
  
  if (ip) cameraConfig.ip = ip;
  if (port) cameraConfig.port = port;
  if (user !== undefined) cameraConfig.user = user;
  if (pass !== undefined) cameraConfig.pass = pass;
  if (protocol) cameraConfig.protocol = protocol;

  console.log('[Config Updated]', cameraConfig);
  res.json({ status: 'ok', config: cameraConfig });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message });
});

// Start
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`\n Ready: http://localhost:${PORT}`);
  console.log(` Camera: http://${cameraConfig.ip}:${cameraConfig.port}`);
  console.log(` Protocol: ${cameraConfig.protocol}\n`);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
