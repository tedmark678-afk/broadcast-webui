import React, { useState, useEffect } from 'react';
import { Play, Stop, Settings, Zap } from 'lucide-react';

interface EncodingPreset {
  id: string;
  name: string;
  codec: string;
  bitrate: string;
  resolution: string;
  framerate: number;
}

interface ActiveEncoding {
  processId: string;
  preset: string;
  input: string;
  output: string;
  bitrate: string;
  fps: number;
  uptime: number;
}

export default function EncodingPanel() {
  const [presets, setPresets] = useState<EncodingPreset[]>([]);
  const [activeEncodings, setActiveEncodings] = useState<ActiveEncoding[]>([]);
  const [input, setInput] = useState('rtsp://camera:554/stream');
  const [output, setOutput] = useState('rtmp://server/live/main');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/encode/presets');
      if (res.ok) {
        const data = await res.json();
        setPresets(data);
        if (data.length > 0) {
          setSelectedPreset(data[0].id);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    }
  };

  const startEncoding = async () => {
    if (!selectedPreset || !input || !output) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/encode/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          output,
          preset: selectedPreset,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Encoding started:', data);
        // Update active encodings list
      }
    } catch (error) {
      console.error('Failed to start encoding:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading encoding settings...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Encoding Configuration */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-6">Encoding Configuration</h2>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Input Source</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="rtsp://camera:554/stream"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
            />
            <p className="text-slate-400 text-xs mt-2">RTSP, RTMP, HTTP, or local file path</p>
          </div>

          {/* Output */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Output Destination</label>
            <input
              type="text"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="rtmp://server/live/stream"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
            />
            <p className="text-slate-400 text-xs mt-2">RTMP, RTSP, SRT, or local file path</p>
          </div>

          {/* Preset Selection */}
          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Encoding Preset</label>
            <select
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
            >
              {presets.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preset Details */}
          {selectedPreset && presets.find((p) => p.id === selectedPreset) && (
            <div className="mb-6 p-4 bg-slate-900 rounded border border-slate-700">
              {(() => {
                const preset = presets.find((p) => p.id === selectedPreset);
                return (
                  <>
                    <p className="text-slate-300 text-sm font-medium mb-3">Preset Details</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-slate-400 text-xs">Codec</p>
                        <p className="font-mono font-bold">{preset?.codec.toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Bitrate</p>
                        <p className="font-mono font-bold">{preset?.bitrate}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">Resolution</p>
                        <p className="font-mono font-bold">{preset?.resolution}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs">FPS</p>
                        <p className="font-mono font-bold">{preset?.framerate}</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={startEncoding}
            className="w-full bg-green-600 hover:bg-green-500 active:bg-green-700 text-white py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Start Encoding
          </button>
        </div>
      </div>

      {/* Active Encodings */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold mb-4">Active Encodings</h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activeEncodings.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No active encodings</p>
          ) : (
            activeEncodings.map((enc) => (
              <div key={enc.processId} className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-sm">{enc.preset}</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">{enc.output}</p>
                  </div>
                  <button className="bg-red-600 hover:bg-red-500 p-2 rounded text-white text-xs">
                    <Stop className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-slate-400">Bitrate</p>
                    <p className="font-mono font-bold">{enc.bitrate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">FPS</p>
                    <p className="font-mono font-bold">{enc.fps}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
