import React, { useState, useEffect } from 'react';
import { Activity, Zap, AlertCircle } from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  network: { in: number; out: number };
  uptime: number;
}

export default function StatusMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 0,
    memory: 0,
    network: { in: 0, out: 0 },
    uptime: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // TODO: Fetch actual metrics from system
      setMetrics({
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: { in: Math.random() * 100, out: Math.random() * 100 },
        uptime: Date.now(),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-4">
      {/* CPU */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            CPU Usage
          </h3>
          <span className="text-2xl font-mono font-bold">{metrics.cpu.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
          <div
            className="bg-yellow-400 h-full transition-all duration-300"
            style={{ width: `${metrics.cpu}%` }}
          />
        </div>
      </div>

      {/* Memory */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Memory Usage
          </h3>
          <span className="text-2xl font-mono font-bold">{metrics.memory.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-400 h-full transition-all duration-300"
            style={{ width: `${metrics.memory}%` }}
          />
        </div>
      </div>

      {/* Network */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="font-bold mb-4">Network</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">↓ Incoming</p>
            <p className="text-lg font-mono font-bold">{metrics.network.in.toFixed(2)} Mbps</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">↑ Outgoing</p>
            <p className="text-lg font-mono font-bold">{metrics.network.out.toFixed(2)} Mbps</p>
          </div>
        </div>
      </div>
    </div>
  );
}
