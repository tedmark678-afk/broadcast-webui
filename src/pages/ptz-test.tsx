import React, { useState } from 'react';
import VirtualJoystick from '@/components/VirtualJoystick';
import CameraPreview from '@/components/CameraPreview';
import { Home } from 'lucide-react';

const PTZTestPage: React.FC = () => {
  const [pan, setPan] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [zoom, setZoom] = useState(1.0);
  const [inputUrl, setInputUrl] = useState('rtsp://camera:554/stream');

  const handleJoystickMove = (panValue: number, tiltValue: number) => {
    setPan(panValue * 100);
    setTilt(tiltValue * 100);
    console.log(`Pan: ${panValue}, Tilt: ${tiltValue}`);
  };

  const handleZoom = (zoomDelta: number) => {
    const newZoom = Math.max(1.0, Math.min(10.0, zoom + zoomDelta));
    setZoom(newZoom);
    console.log(`Zoom: ${newZoom}`);
  };

  const handleHome = () => {
    setPan(0);
    setTilt(0);
    setZoom(1.0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">🎥 PTZ Test Page</h1>
        <p className="text-slate-400">Testing Virtual Joystick & Camera Preview Components</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Camera Preview - Full Width Top */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">📹 Camera Preview</h2>
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <CameraPreview sourceUrl={inputUrl} title="Live Stream" showControls={true} />
          </div>
          
          {/* Input URL Config */}
          <div className="mt-4 bg-slate-900 rounded-lg p-4 border border-slate-700">
            <label className="block text-sm font-medium mb-2">Stream URL:</label>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white"
              placeholder="rtsp://camera:554/stream"
            />
          </div>
        </div>

        {/* Virtual Joystick */}
        <div className="flex flex-col items-center justify-start bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-6">🎮 Virtual Joystick</h2>
          <VirtualJoystick onMove={handleJoystickMove} onZoom={handleZoom} size={220} />
          
          {/* Home Button */}
          <button
            onClick={handleHome}
            className="mt-6 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded font-semibold transition-colors flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Pan Status */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3">Pan (Horizontal)</h3>
          <p className="text-3xl font-mono text-cyan-400 mb-3">{pan.toFixed(1)}°</p>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${50 + pan / 2}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">-100 to +100</p>
        </div>

        {/* Tilt Status */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3">Tilt (Vertical)</h3>
          <p className="text-3xl font-mono text-blue-400 mb-3">{tilt.toFixed(1)}°</p>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${50 + tilt / 2}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">-100 to +100</p>
        </div>

        {/* Zoom Status */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold mb-3">Zoom Level</h3>
          <p className="text-3xl font-mono text-purple-400 mb-3">{zoom.toFixed(1)}x</p>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all"
              style={{ width: `${((zoom - 1) / 9) * 100}%` }}
            />
          </div>
          <p className="text-sm text-slate-400 mt-2">1x to 10x</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-slate-900 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold mb-4">📖 Instructions</h3>
        <div className="space-y-2 text-slate-300">
          <p>✅ <strong>Drag</strong> the circular joystick knob to Pan & Tilt</p>
          <p>✅ <strong>Scroll</strong> over joystick to Zoom in/out</p>
          <p>✅ <strong>Center button</strong> returns to home position (0, 0, 1x)</p>
          <p>✅ Real-time position feedback displayed above</p>
          <p>✅ Check browser console (F12) for API calls</p>
        </div>
      </div>

      {/* Console Output */}
      <div className="mt-8 bg-black rounded-lg p-4 border border-slate-700 font-mono text-sm">
        <p className="text-slate-400">Current Position:</p>
        <p className="text-cyan-400">Pan: {pan.toFixed(1)}° | Tilt: {tilt.toFixed(1)}° | Zoom: {zoom.toFixed(1)}x</p>
      </div>
    </div>
  );
};

export default PTZTestPage;
