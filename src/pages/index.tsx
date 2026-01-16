import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { Activity, Cpu, Radio, AlertCircle } from 'lucide-react';
import PTZControls from '@/components/PTZControls';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ptz' | 'encoding' | 'routing'>('dashboard');
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

      <div className="min-h-screen bg-slate-950 text-white">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-8 h-8 text-cyan-400" />
                <h1 className="text-2xl font-bold">Broadcast Control</h1>
              </div>
              <div className="flex items-center gap-2">
                {status ? (
                  <>
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">System Active</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">Loading...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className="border-b border-slate-800 bg-slate-900/50 sticky top-16 z-40">
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
                  className={`px-4 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-slate-400 hover:text-white'
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
        <main className="max-w-7xl mx-auto px-4 py-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Cpu className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-4" />
                <p className="text-slate-400">Initializing system...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {activeTab === 'dashboard' && status && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Cards */}
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">PTZ Status</p>
                        <p className="text-xl font-bold mt-2">
                          {status.ptz.connected ? '🟢 Connected' : '🔴 Offline'}
                        </p>
                      </div>
                      <Radio className="w-8 h-8 text-slate-600" />
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Encoding</p>
                        <p className="text-xl font-bold mt-2">
                          {status.encoding.active}/{status.encoding.total}
                        </p>
                      </div>
                      <Cpu className="w-8 h-8 text-slate-600" />
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">Routes Active</p>
                        <p className="text-xl font-bold mt-2">
                          {status.routing.active}/{status.routing.routes}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-slate-600" />
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-400 text-sm">FFmpeg</p>
                        <p className="text-xl font-bold mt-2">
                          {status.ffmpeg.available ? '✅ Ready' : '❌ Missing'}
                        </p>
                      </div>
                      <Activity className="w-8 h-8 text-slate-600" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'ptz' && <PTZControls />}
              {activeTab === 'encoding' && <EncodingPanel />}
              {activeTab === 'routing' && <RoutingManager />}
            </>
          )}
        </main>
      </div>
    </>
  );
}
