const express = require('express');
const path = require('path');
const http = require('http');
const net = require('net');

const app = express();
const PORT = process.env.PORT || 3000;

let cameraConfig = {
  ip: '192.168.1.11',
  httpPort: 81,
  rtspPort: 554,
  onvifPort: 2000,
  viscaPort: 52381,
  user: '',
  pass: '',
  protocol: 'http'
};

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// HTTP Request Helper
function httpReq(port, path, auth = '') {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: cameraConfig.ip,
      port: port,
      path: path,
      method: 'GET',
      timeout: 5000
    };

    if (auth) {
      opts.headers = { 'Authorization': auth };
    }

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ code: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

// Get basic auth header
function getAuthHeader() {
  if (cameraConfig.user && cameraConfig.pass) {
    return 'Basic ' + Buffer.from(`${cameraConfig.user}:${cameraConfig.pass}`).toString('base64');
  }
  return '';
}

// ONVIF Soap Request
function buildONVIFRequest(method, params = {}) {
  const ns = 'http://www.onvif.org/ver20/ptz/wsdl';
  const tns = 'http://www.onvif.org/ver10/ptz/wsdl';

  if (method === 'GetProfiles') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <GetProfiles xmlns="http://www.onvif.org/ver10/device/wsdl"/>
  </soap:Body>
</soap:Envelope>`;
  }

  if (method === 'ContinuousMove') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <ContinuousMove xmlns="${tns}">
      <ProfileToken>${params.profile || 'PTZ_Profile_1'}</ProfileToken>
      <Velocity>
        <PanTilt x="${params.panVel || 0}" y="${params.tiltVel || 0}"/>
        <Zoom x="${params.zoomVel || 0}"/>
      </Velocity>
    </ContinuousMove>
  </soap:Body>
</soap:Envelope>`;
  }

  if (method === 'Stop') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <Stop xmlns="${tns}">
      <ProfileToken>${params.profile || 'PTZ_Profile_1'}</ProfileToken>
    </Stop>
  </soap:Body>
</soap:Envelope>`;
  }

  return '';
}

// VISCA Command Builder
function buildVISCACmd(command) {
  const cmds = {
    'left': Buffer.from([0x81, 0x01, 0x06, 0x01, 0x04, 0x18, 0x03, 0x01, 0xFF]),
    'right': Buffer.from([0x81, 0x01, 0x06, 0x01, 0x04, 0x18, 0x02, 0x01, 0xFF]),
    'up': Buffer.from([0x81, 0x01, 0x06, 0x01, 0x04, 0x18, 0x01, 0x03, 0xFF]),
    'down': Buffer.from([0x81, 0x01, 0x06, 0x01, 0x04, 0x18, 0x01, 0x02, 0xFF]),
    'zoomin': Buffer.from([0x81, 0x01, 0x04, 0x47, 0x00, 0xFF]),
    'zoomout': Buffer.from([0x81, 0x01, 0x04, 0x47, 0x03, 0xFF]),
    'home': Buffer.from([0x81, 0x01, 0x06, 0x04, 0xFF]),
    'focus': Buffer.from([0x81, 0x01, 0x04, 0x18, 0x01, 0xFF])
  };
  return cmds[command];
}

// Send VISCA
function sendVISCA(command) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(cameraConfig.viscaPort, cameraConfig.ip);
    const buf = buildVISCACmd(command);

    if (!buf) {
      reject(new Error('Unknown command'));
      return;
    }

    socket.on('connect', () => {
      socket.write(buf);
      setTimeout(() => socket.end(), 200);
    });

    socket.on('end', () => resolve({ status: 'sent' }));
    socket.on('error', reject);
    socket.setTimeout(5000);
  });
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    camera: `${cameraConfig.ip}:${cameraConfig.httpPort}`,
    protocol: cameraConfig.protocol
  });
});

app.get('/api/camera/info', async (req, res) => {
  try {
    const auth = getAuthHeader();
    const result = await httpReq(cameraConfig.httpPort, '/cgi-bin/api.cgi?action=getStatus', auth);
    res.json({ status: 'ok', code: result.code });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

app.post('/api/ptz', async (req, res) => {
  const { command, pan = 0, tilt = 0, zoom = 1 } = req.body;

  console.log('[PTZ]', { command, pan, tilt, zoom, proto: cameraConfig.protocol });

  try {
    if (cameraConfig.protocol === 'http') {
      let url = '';
      if (command === 'left') url = '/cgi-bin/api.cgi?action=ptzControl&panLeft=1';
      else if (command === 'right') url = '/cgi-bin/api.cgi?action=ptzControl&panRight=1';
      else if (command === 'up') url = '/cgi-bin/api.cgi?action=ptzControl&tiltUp=1';
      else if (command === 'down') url = '/cgi-bin/api.cgi?action=ptzControl&tiltDown=1';
      else if (command === 'zoomin') url = '/cgi-bin/api.cgi?action=ptzControl&zoomIn=1';
      else if (command === 'zoomout') url = '/cgi-bin/api.cgi?action=ptzControl&zoomOut=1';
      else if (command === 'home') url = '/cgi-bin/api.cgi?action=ptzControl&presetGoto=1';
      else if (command === 'focus') url = '/cgi-bin/api.cgi?action=ptzControl&autoFocus=1';

      if (url) {
        const auth = getAuthHeader();
        const result = await httpReq(cameraConfig.httpPort, url, auth);
        res.json({ status: 'sent', code: result.code });
      } else {
        res.json({ status: 'idle' });
      }

    } else if (cameraConfig.protocol === 'visca') {
      const result = await sendVISCA(command);
      res.json({ status: 'sent', protocol: 'visca' });

    } else if (cameraConfig.protocol === 'onvif') {
      // ONVIF via HTTP POST
      const panVel = pan * 0.5;
      const tiltVel = tilt * 0.5;
      const soap = buildONVIFRequest('ContinuousMove', { panVel, tiltVel, zoomVel: zoom * 0.1 });
      const auth = getAuthHeader();

      const opts = {
        hostname: cameraConfig.ip,
        port: cameraConfig.onvifPort,
        path: '/onvif/ptz_service',
        method: 'POST',
        timeout: 5000,
        headers: {
          'Content-Type': 'application/soap+xml',
          'Content-Length': Buffer.byteLength(soap)
        }
      };

      if (auth) opts.headers['Authorization'] = auth;

      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          res.statusCode === 200
            ? res.json({ status: 'sent', protocol: 'onvif' })
            : res.json({ status: 'error', code: res.statusCode });
        });
      });

      req.on('error', (e) => res.status(500).json({ status: 'error', message: e.message }));
      req.write(soap);
      req.end();
    }
  } catch (e) {
    console.error('[Error]', e.message);
    res.status(500).json({ status: 'error', message: e.message });
  }
});

app.post('/api/config', (req, res) => {
  const { ip, httpPort, rtspPort, onvifPort, viscaPort, user, pass, protocol } = req.body;

  if (ip) cameraConfig.ip = ip;
  if (httpPort) cameraConfig.httpPort = httpPort;
  if (rtspPort) cameraConfig.rtspPort = rtspPort;
  if (onvifPort) cameraConfig.onvifPort = onvifPort;
  if (viscaPort) cameraConfig.viscaPort = viscaPort;
  if (user !== undefined) cameraConfig.user = user;
  if (pass !== undefined) cameraConfig.pass = pass;
  if (protocol) cameraConfig.protocol = protocol;

  console.log('[Config]', cameraConfig);
  res.json({ status: 'ok', config: cameraConfig });
});

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));
app.use((err, req, res) => {
  console.error('[Error]', err);
  res.status(500).json({ error: err.message });
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`\nPTZ Server: http://localhost:${PORT}`);
  console.log(`Camera: ${cameraConfig.ip}`);
  console.log(`Protocol: ${cameraConfig.protocol}\n`);
});

process.on('SIGTERM', () => {
  console.log('\nShutdown...');
  server.close(() => process.exit(0));
});
