import React from 'react';
import PTZPanel from '@/components/PTZPanel';

const PTZControlPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Broadcast Control
              </h1>
              <p className="text-sm text-slate-400 mt-1">Professional PTZ Camera Management System</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">System Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="font-semibold text-green-400">Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <PTZPanel />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-sm text-slate-400">
          <p>Broadcast WebUI v1.0 • PTZ Control System</p>
          <p className="mt-2">© 2026 Professional Broadcasting Solutions</p>
        </div>
      </footer>
    </div>
  );
};

export default PTZControlPage;
