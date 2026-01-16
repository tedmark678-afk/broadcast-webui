import React, { useState, useEffect } from 'react';
import VirtualJoystick from './VirtualJoystick';
import CameraPreview from './CameraPreview';
import { Send, Home } from 'lucide-react';

interface PTZStatus {
  pan: number;
  tilt: number;
  zoom: number;
}

const PTZPanel: React.FC = () => {
  const [status, setStatus] = useState<PTZStatus>({
    pan: 0,
    tilt: 0,
    zoom: 1.0,
  });
  const [input, setInput] = useState('rtsp://camera:554/stream');
  const [output, setOutput] = useState('rtmp://server/live/main');
  const [isMoving, setIsMoving] = useState(false);

  // Send PTZ command to backend
  const sendPTZCommand = async (pan: number, tilt: number, zoom?: number) => {
    try {
      await fetch('/api/ptz/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pan,
          tilt,
          zoom: zoom || status.zoom,
        }),
      });
    } catch (error) {
      console.error('Failed to send PTZ command:', error);
    }
  };

  // Joystick movement handler
  const handleJoystickMove = (pan: number, tilt: number) => {
    setIsMoving(pan !== 0 || tilt !== 0);
    setStatus((prev) => ({
      ...prev,
      pan: pan * 100, // Scale to percentage
      tilt: tilt * 100,
    }));
    sendPTZCommand(pan, tilt);
  };

  // Zoom handler
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(1.0, Math.min(10.0, status.zoom + delta));
    setStatus((prev) => ({
      ...prev,
      zoom: newZoom,
    }));
    sendPTZCommand(status.pan / 100, status.tilt / 100, newZoom);
  };

  // Home position
  const handleHome = async () => {
    setStatus({ pan: 0, tilt: 0, zoom: 1.0 });
    await sendPTZCommand(0, 0, 1.0);
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">PTZ Control System</h2>
          <p className="text-sm text-slate-400 mt-1">Pan, Tilt, Zoom camera control with live preview</p>
        </div>
        <button
          onClick={handleHome}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold transition-colors"
        >
          <Home className="w-5 h-5" />
          Home Position
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Preview */}
        <div className="lg:col-span-2">
          <CameraPreview sourceUrl={input} title="Live Camera Feed" />
        </div>

        {/* Virtual Joystick */}
        <div className="flex flex-col items-center justify-center bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Pan & Tilt</h3>
          <VirtualJoystick onMove={handleJoystickMove} onZoom={handleZoom} size={220} />
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stream Configuration */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Stream Configuration</h3>

          <div className="space-y-4">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Input Source</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="rtsp://camera:554/stream"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-xs text-slate-400 mt-1">RTSP, RTMP, HTTP, or file path</p>
            </div>

            {/* Output */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Output Destination</label>
              <input
                type="text"
                value={output}
                onChange={(e) => setOutput(e.target.value)}
                placeholder="rtmp://server/live/main"
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <p className="text-xs text-slate-400 mt-1">RTMP, RTSP, SRT, or file path</p>
            </div>
          </div>
        </div>

        {/* PTZ Status & Zoom */}
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
          <h3 className="text-lg font-bold text-white mb-4">Position & Zoom</h3>

          {/* Pan/Tilt Display */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-800 rounded p-3">
              <p className="text-xs text-slate-400 mb-1">Pan (Horizontal)</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{status.pan.toFixed(1)}°</p>
              <div className="mt-2 h-2 bg-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{ width: `${50 + status.pan / 2}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-800 rounded p-3">
              <p className="text-xs text-slate-400 mb-1">Tilt (Vertical)</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{status.tilt.toFixed(1)}°</p>
              <div className="mt-2 h-2 bg-slate-700 rounded overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{ width: `${50 + status.tilt / 2}%` }}
                />
              </div>
            </div>
          </div>

          {/* Zoom Control */}
          <div className="bg-slate-800 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-300">Zoom Level</p>
              <p className="text-lg font-mono font-bold text-cyan-400">{status.zoom.toFixed(1)}x</p>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.1"
              value={status.zoom}
              onChange={(e) => handleZoom(parseFloat(e.target.value) - status.zoom)}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>1x</span>
              <span>10x</span>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="mt-4 flex items-center gap-2 text-sm">
            <div
              className={`w-3 h-3 rounded-full ${
                isMoving ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
              }`}
            />
            <span className="text-slate-300">
              {isMoving ? 'Camera Moving' : 'Standby'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => sendPTZCommand(-0.5, 0)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            ← Pan Left
          </button>
          <button
            onClick={() => sendPTZCommand(0.5, 0)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            Pan Right →
          </button>
          <button
            onClick={() => sendPTZCommand(0, 0.5)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            ↑ Tilt Up
          </button>
          <button
            onClick={() => sendPTZCommand(0, -0.5)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium transition-colors"
          >
            ↓ Tilt Down
          </button>
        </div>
      </div>
    </div>
  );
};

export default PTZPanel;
