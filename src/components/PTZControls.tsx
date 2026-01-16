import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Zap, Save, Download } from 'lucide-react';

interface PTZStatus {
  position: { x: number; y: number; z: number };
  preset: string;
  connected: boolean;
}

interface Preset {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
}

export default function PTZControls() {
  const [status, setStatus] = useState<PTZStatus | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [speed, setSpeed] = useState(0.5);
  const [newPresetName, setNewPresetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/ptz/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch PTZ status:', error);
    }
  };

  const executeCommand = async (action: string, params: Record<string, any>) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`/api/ptz/${action}?${query}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        console.log(`${action}:`, data);
        fetchStatus();
      }
    } catch (error) {
      console.error(`Failed to execute ${action}:`, error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading PTZ controls...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main PTZ Control Panel */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-xl font-bold mb-6">PTZ Camera Control</h2>

          {/* Status Bar */}
          <div className="mb-6 p-4 bg-slate-900 rounded border border-slate-700">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm">Pan</p>
                <p className="text-lg font-mono font-bold">{status?.position.x || 0}°</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Tilt</p>
                <p className="text-lg font-mono font-bold">{status?.position.y || 0}°</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Zoom</p>
                <p className="text-lg font-mono font-bold">{(status?.position.z || 1).toFixed(1)}x</p>
              </div>
            </div>
          </div>

          {/* Pan/Tilt Pad */}
          <div className="mb-8">
            <p className="text-slate-400 text-sm mb-4">Pan & Tilt</p>
            <div className="grid grid-cols-3 gap-2 w-40 mx-auto">
              <div />
              <button
                onMouseDown={() => executeCommand('tilt', { direction: 'up', speed })}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 p-4 rounded flex items-center justify-center transition-colors"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <div />

              <button
                onMouseDown={() => executeCommand('pan', { direction: 'left', speed })}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 p-4 rounded flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onMouseDown={() => {
                  /* Center/Home */
                }}
                className="bg-slate-700 hover:bg-slate-600 p-4 rounded flex items-center justify-center transition-colors text-xs font-bold"
              >
                CENTER
              </button>
              <button
                onMouseDown={() => executeCommand('pan', { direction: 'right', speed })}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 p-4 rounded flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div />
              <button
                onMouseDown={() => executeCommand('tilt', { direction: 'down', speed })}
                className="bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 p-4 rounded flex items-center justify-center transition-colors"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <div />
            </div>
          </div>

          {/* Zoom Control */}
          <div className="mb-8">
            <p className="text-slate-400 text-sm mb-4">Zoom</p>
            <div className="flex gap-2">
              <button
                onMouseDown={() => executeCommand('zoom', { direction: 'out', speed })}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 py-2 rounded transition-colors text-sm font-bold"
              >
                ZOOM OUT
              </button>
              <button
                onMouseDown={() => executeCommand('zoom', { direction: 'in', speed })}
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 py-2 rounded transition-colors text-sm font-bold"
              >
                ZOOM IN
              </button>
            </div>
          </div>

          {/* Speed Control */}
          <div>
            <label className="block text-slate-400 text-sm mb-2">Control Speed</label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="text-center text-slate-300 text-sm mt-2">{(speed * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Presets Panel */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold mb-4">Presets</h3>

        {/* Save New Preset */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Preset name"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-sm mb-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded text-sm font-bold flex items-center justify-center gap-2 transition-colors">
            <Save className="w-4 h-4" />
            Save Preset
          </button>
        </div>

        {/* Preset List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {presets.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No presets yet</p>
          ) : (
            presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  /* Goto preset */
                }}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm transition-colors text-left px-3"
              >
                <div className="flex items-center justify-between">
                  <span>{preset.name}</span>
                  <Zap className="w-4 h-4 text-yellow-400" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
