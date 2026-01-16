import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import VirtualJoystick from '@/components/VirtualJoystick';
import CameraPreview from '@/components/CameraPreview';
import { Home, Activity } from 'lucide-react';

const Dashboard = () => {
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [inputUrl, setInputUrl] = useState('rtsp://camera:554/stream');

  const handleJoystickMove = (panValue: number, tiltValue: number) => {
    setPan(panValue * 100);
    setTilt(tiltValue * 100);
  };

  const handleZoom = (zoomDelta: number) => {
    const newZoom = Math.max(1.0, Math.min(10.0, zoom + zoomDelta));
    setZoom(newZoom);
  };

  const handleHome = () => {
    setPan(0);
    setTilt(0);
    setZoom(1.0);
  };

  return (
    <>
      <Head>
        <title>Broadcast WebUI - PTZ Control</title>
        <meta name="description" content="Professional broadcast control system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Broadcast Control System
                </h1>
                <p className="text-sm text-slate-400 mt-1">Professional PTZ Camera Management</p>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold">System Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Top Section: Preview + Joystick */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Camera Preview - Main */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span>📹</span> Live Camera Feed
              </h2>
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-lg">
                <CameraPreview sourceUrl={inputUrl} title="" showControls={true} />
              </div>

              {/* Stream URL */}
              <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-slate-700">
                <label className="block text-sm font-medium mb-2">Stream URL:</label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                  placeholder="rtsp://camera:554/stream"
                />
                <p className="text-xs text-slate-400 mt-2">Supports: RTSP, RTMP, HTTP, HLS, or local file path</p>
              </div>
            </div>

            {/* Virtual Joystick */}
            <div className="flex flex-col items-center justify-start bg-slate-900 rounded-lg p-6 border border-slate-700 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span>🎮</span> PTZ Control
              </h2>
              <VirtualJoystick onMove={handleJoystickMove} onZoom={handleZoom} size={220} />

              {/* Home Button */}
              <button
                onClick={handleHome}
                className="mt-6 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-all flex items-center gap-2 shadow-lg"
              >
                <Home className="w-4 h-4" />
                Home
              </button>
            </div>
          </div>

          {/* Bottom Section: Status Displays */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pan */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>↔️</span> Pan (Horizontal)
              </h3>
              <p className="text-4xl font-mono text-cyan-400 font-bold mb-4">{pan.toFixed(1)}°</p>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all"
                  style={{ width: `${50 + pan / 2}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Range: -100° to +100°</p>
            </div>

            {/* Tilt */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>↕️</span> Tilt (Vertical)
              </h3>
              <p className="text-4xl font-mono text-blue-400 font-bold mb-4">{tilt.toFixed(1)}°</p>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all"
                  style={{ width: `${50 + tilt / 2}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Range: -100° to +100°</p>
            </div>

            {/* Zoom */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-6 border border-slate-700 shadow-lg">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <span>🔍</span> Zoom Level
              </h3>
              <p className="text-4xl font-mono text-purple-400 font-bold mb-4">{zoom.toFixed(1)}x</p>
              <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                  style={{ width: `${((zoom - 1) / 9) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-2">Range: 1x to 10x</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-900/50 backdrop-blur rounded-lg p-6 border border-slate-700 border-dashed">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span>📖</span> How to Use
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="flex gap-3">
                <span className="text-cyan-400 font-bold">1.</span>
                <p><strong>Drag</strong> the circular joystick knob to pan (left/right) and tilt (up/down)</p>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-400 font-bold">2.</span>
                <p><strong>Scroll</strong> your mouse wheel over the joystick to zoom in/out</p>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-400 font-bold">3.</span>
                <p>Click the <strong>HOME</strong> button to reset pan, tilt, and zoom to defaults</p>
              </div>
              <div className="flex gap-3">
                <span className="text-cyan-400 font-bold">4.</span>
                <p>Watch the status bars update in real-time as you move the joystick</p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-slate-900/50 mt-12 py-6 text-center text-sm text-slate-400">
          <p>Broadcast WebUI v1.0 • Professional PTZ Camera Control System</p>
          <p className="mt-1">© 2026 Broadcast Solutions</p>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;
