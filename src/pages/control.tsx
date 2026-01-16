import React from 'react';
import Head from 'next/head';

const ControlPage = () => {
  return (
    <>
      <Head>
        <title>PTZ Camera Control</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={styles.container}>
        <h1 style={styles.title}>PTZ Camera Control</h1>
        
        <div style={styles.grid}>
          {/* Left: Video */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Live Stream</h2>
            <div style={styles.videoBox}>
              <video
                id="videoPreview"
                style={styles.video}
                autoPlay
                muted
                controls
              />
            </div>
            <div style={styles.urlInput}>
              <label style={styles.label}>Stream URL:</label>
              <input
                id="streamUrl"
                type="text"
                defaultValue="rtsp://192.168.1.11/1/h264major"
                style={styles.input}
                placeholder="Enter stream URL"
              />
              <button
                onClick={() => {
                  const url = (document.getElementById('streamUrl') as HTMLInputElement).value;
                  console.log('Stream URL changed to:', url);
                }}
                style={styles.button}
              >
                Load Stream
              </button>
            </div>
          </div>

          {/* Right: Joystick & Controls */}
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>PTZ Control</h2>
            
            {/* Joystick */}
            <div style={styles.joystickContainer}>
              <div
                id="joystick"
                style={{
                  ...styles.joystick,
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  margin: '0 auto',
                }}
              >
                <div
                  id="joystickKnob"
                  style={{
                    ...styles.joystickKnob,
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
                    left: '75px',
                    top: '75px',
                  }}
                />
              </div>
            </div>

            {/* Status */}
            <div style={styles.statusBox}>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Pan:</span>
                <span id="panValue" style={styles.statusValue}>0.00°</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Tilt:</span>
                <span id="tiltValue" style={styles.statusValue}>0.00°</span>
              </div>
              <div style={styles.statusItem}>
                <span style={styles.statusLabel}>Zoom:</span>
                <span id="zoomValue" style={styles.statusValue}>1.0x</span>
              </div>
            </div>

            {/* Buttons */}
            <div style={styles.buttonGrid}>
              <button style={styles.smallButton} onClick={() => sendPTZ('left')}>← Pan Left</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('up')}>↑ Tilt Up</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('right')}>Pan Right →</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('home')}>⌂ Home</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('down')}>↓ Tilt Down</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('zoomin')}>🔍 Zoom In</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('zoomout')}>🔍 Zoom Out</button>
              <button style={styles.smallButton} onClick={() => sendPTZ('focus')}>◎ Auto Focus</button>
            </div>
          </div>
        </div>

        {/* Camera Info */}
        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>Camera Information</h3>
          <div style={styles.infoContent}>
            <p><strong>IP:</strong> 192.168.1.11:81</p>
            <p><strong>RTSP Stream:</strong> rtsp://192.168.1.11/1/h264major</p>
            <p><strong>HTTP Control:</strong> http://192.168.1.11:81/cgi-bin/</p>
          </div>
        </div>
      </div>

      <script dangerouslySetInnerHTML={{
        __html: `
          let panPos = 0;
          let tiltPos = 0;
          let zoomLevel = 1.0;
          let isDragging = false;

          const joystick = document.getElementById('joystick');
          const knob = document.getElementById('joystickKnob');
          const maxDistance = 75;

          function updateJoystickDisplay() {
            document.getElementById('panValue').textContent = (panPos * 100).toFixed(1) + '°';
            document.getElementById('tiltValue').textContent = (tiltPos * 100).toFixed(1) + '°';
            document.getElementById('zoomValue').textContent = zoomLevel.toFixed(1) + 'x';
          }

          joystick.addEventListener('mousedown', (e) => {
            isDragging = true;
            updateKnobPosition(e);
          });

          document.addEventListener('mousemove', (e) => {
            if (isDragging) updateKnobPosition(e);
          });

          document.addEventListener('mouseup', () => {
            isDragging = false;
            panPos = 0;
            tiltPos = 0;
            knob.style.left = '75px';
            knob.style.top = '75px';
            updateJoystickDisplay();
          });

          function updateKnobPosition(e) {
            const rect = joystick.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let x = e.clientX - centerX;
            let y = e.clientY - centerY;

            const distance = Math.sqrt(x * x + y * y);
            if (distance > maxDistance) {
              x = (x / distance) * maxDistance;
              y = (y / distance) * maxDistance;
            }

            knob.style.left = (100 + x) + 'px';
            knob.style.top = (100 + y) + 'px';

            panPos = x / maxDistance;
            tiltPos = -y / maxDistance;
            updateJoystickDisplay();
          }

          joystick.addEventListener('wheel', (e) => {
            e.preventDefault();
            zoomLevel += e.deltaY > 0 ? -0.1 : 0.1;
            zoomLevel = Math.max(1.0, Math.min(10.0, zoomLevel));
            updateJoystickDisplay();
          });
        `
      }} />

      <script>
        function sendPTZ(command) {
          console.log('PTZ Command:', command);
          // API calls will go here
        }
      </script>
    </>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    minHeight: '100vh',
  } as React.CSSProperties,
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '30px',
    textAlign: 'center',
    color: '#06b6d4',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    marginBottom: '30px',
  } as React.CSSProperties,
  section: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
    color: '#06b6d4',
  } as React.CSSProperties,
  videoBox: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '15px',
    border: '2px solid #334155',
  } as React.CSSProperties,
  video: {
    width: '100%',
    height: 'auto',
    display: 'block',
  } as React.CSSProperties,
  urlInput: {
    marginBottom: '15px',
  } as React.CSSProperties,
  label: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '12px',
    color: '#94a3b8',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '8px 12px',
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    color: '#e2e8f0',
    marginBottom: '10px',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  button: {
    backgroundColor: '#06b6d4',
    color: '#0f172a',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
  } as React.CSSProperties,
  joystickContainer: {
    marginBottom: '20px',
  } as React.CSSProperties,
  joystick: {
    backgroundColor: '#0f172a',
    border: '3px solid #06b6d4',
    borderRadius: '50%',
    cursor: 'grab',
  } as React.CSSProperties,
  joystickKnob: {
    backgroundColor: '#06b6d4',
    border: '2px solid #00d9ff',
    borderRadius: '50%',
    cursor: 'grabbing',
    transition: 'all 0.05s ease',
    boxShadow: '0 0 10px rgba(6, 182, 212, 0.6)',
  } as React.CSSProperties,
  statusBox: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '15px',
  } as React.CSSProperties,
  statusItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '5px 0',
    fontSize: '14px',
  } as React.CSSProperties,
  statusLabel: {
    color: '#94a3b8',
    fontWeight: 'bold',
  } as React.CSSProperties,
  statusValue: {
    color: '#06b6d4',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  } as React.CSSProperties,
  buttonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px',
  } as React.CSSProperties,
  smallButton: {
    backgroundColor: '#334155',
    color: '#e2e8f0',
    padding: '10px',
    border: '1px solid #475569',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    transition: 'all 0.2s',
  } as React.CSSProperties,
  infoBox: {
    backgroundColor: '#1e293b',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #334155',
  } as React.CSSProperties,
  infoTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#06b6d4',
  } as React.CSSProperties,
  infoContent: {
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.8',
  } as React.CSSProperties,
};

export default ControlPage;
