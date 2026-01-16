import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Activity, Cpu, Radio, AlertCircle } from 'lucide-react';
import PTZPanel from '@/components/PTZPanel';
import EncodingPanel from '@/components/EncodingPanel';
import RoutingManager from '@/components/RoutingManager';
import StatusMonitor from '@/components/StatusMonitor';

interface SystemStatus {
  ptz: { connected: boolean; preset: string };
  encoding: { active: number; total: number };
  routing: { routes: number; active: number };
  ffmpeg: { available: boolean; version: string };
}

export default function Dashboard() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ptz' | 'encoding' | 'routing'>('ptz');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          setStatus(data);
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Broadcast WebUI - Control Center</title>
        <meta name="description" content="Professional broadcast control system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Broadcast Control
                  </h1>
                  <p className="text-xs text-slate-400">Professional PTZ Management System</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  {status ? (
                    <>
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-400">System Active</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">PTZ: {status.ptz.connected ? '✅' : '❌'} | Encoding: {status.encoding.active}/{status.encoding.total}</p>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-yellow-500 animate-spin" />
                      <span className="text-sm font-medium">Loading...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-[73px] z-40">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                { id: 'ptz', label: 'PTZ Control', icon: '🎥' },
                { id: 'encoding', label: 'Encoding', icon: '⚙️' },
                { id: 'routing', label: 'Routing', icon: '🔀' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                      : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block">
                  <Cpu className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
                </div>
                <p className="text-slate-400 text-lg">Initializing broadcast system...</p>
                <p className="text-slate-500 text-sm mt-2">Connecting to camera and services</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'dashboard' && status && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* PTZ Status */}
                    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 hover:border-cyan-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm font-medium">PTZ Camera</p>
                          <p className="text-2xl font-bold mt-2 flex items-center gap-2">
                            <span className={status.ptz.connected ? 'text-green-400' : 'text-red-400'}>
                              {status.ptz.connected ? '🟢' : '🔴'}
                            </span>
                            {status.ptz.connected ? 'Connected' : 'Offline'}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">Preset: {status.ptz.preset}</p>
                        </div>
                      </div>
                    </div>

                    {/* Encoding Status */}
                    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 hover:border-cyan-500/30 transition-colors">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Encoding Sessions</p>
                        <p className="text-2xl font-bold mt-2 text-cyan-400">
                          {status.encoding.active}/{status.encoding.total}
                        </p>
                        <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
                            style={{ width: `${(status.encoding.active / status.encoding.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Routing Status */}
                    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 hover:border-cyan-500/30 transition-colors">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Active Routes</p>
                        <p className="text-2xl font-bold mt-2 text-blue-400">
                          {status.routing.active}/{status.routing.routes}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Stream routing configured</p>
                      </div>
                    </div>

                    {/* FFmpeg Status */}
                    <div className="bg-slate-800/50 backdrop-blur rounded-lg p-6 border border-slate-700 hover:border-cyan-500/30 transition-colors">
                      <div>
                        <p className="text-slate-400 text-sm font-medium">FFmpeg</p>
                        <p className="text-2xl font-bold mt-2 flex items-center gap-2">
                          <span className={status.ffmpeg.available ? 'text-green-400' : 'text-red-400'}>
                            {status.ffmpeg.available ? '✅' : '❌'}
                          </span>
                          {status.ffmpeg.available ? 'Ready' : 'Unavailable'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 truncate">v6.1.2</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ptz' && <PTZPanel />}
              {activeTab === 'encoding' && <EncodingPanel />}
              {activeTab === 'routing' && <RoutingManager />}
            </>
          )}
        </main>
      </div>
    </>
  );
}
