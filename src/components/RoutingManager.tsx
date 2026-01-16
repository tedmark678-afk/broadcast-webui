import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Play, Pause } from 'lucide-react';

interface Route {
  id: string;
  name: string;
  source: string;
  destinations: string[];
  active: boolean;
  createdAt: string;
}

export default function RoutingManager() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [newRoute, setNewRoute] = useState({ name: '', source: '', destination: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await fetch('/api/routing/list');
      if (res.ok) {
        const data = await res.json();
        setRoutes(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const addRoute = async () => {
    if (!newRoute.name || !newRoute.source || !newRoute.destination) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/routing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoute.name,
          source: newRoute.source,
          destinations: [newRoute.destination],
        }),
      });

      if (res.ok) {
        setNewRoute({ name: '', source: '', destination: '' });
        fetchRoutes();
      }
    } catch (error) {
      console.error('Failed to create route:', error);
    }
  };

  const toggleRoute = async (id: string) => {
    try {
      const res = await fetch(`/api/routing/toggle?id=${id}`, { method: 'POST' });
      if (res.ok) {
        fetchRoutes();
      }
    } catch (error) {
      console.error('Failed to toggle route:', error);
    }
  };

  const deleteRoute = async (id: string) => {
    if (!confirm('Delete this route?')) return;

    try {
      const res = await fetch(`/api/routing/delete?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchRoutes();
      }
    } catch (error) {
      console.error('Failed to delete route:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading routes...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* New Route Form */}
      <div className="lg:col-span-2">
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-bold mb-6">Create New Route</h2>

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Route Name</label>
            <input
              type="text"
              value={newRoute.name}
              onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
              placeholder="Main Stream"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Source</label>
            <input
              type="text"
              value={newRoute.source}
              onChange={(e) => setNewRoute({ ...newRoute, source: e.target.value })}
              placeholder="rtsp://camera:554/stream"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 text-sm font-medium mb-2">Destination</label>
            <input
              type="text"
              value={newRoute.destination}
              onChange={(e) => setNewRoute({ ...newRoute, destination: e.target.value })}
              placeholder="rtmp://server/live/main"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
            />
          </div>

          <button
            onClick={addRoute}
            className="w-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white py-3 rounded font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Route
          </button>
        </div>
      </div>

      {/* Routes List */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-bold mb-4">Routes ({routes.length})</h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {routes.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No routes created yet</p>
          ) : (
            routes.map((route) => (
              <div key={route.id} className="bg-slate-900 rounded p-4 border border-slate-700">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-sm">{route.name}</p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{route.source}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleRoute(route.id)}
                      className={`p-2 rounded text-white text-xs ${
                        route.active ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      {route.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteRoute(route.id)}
                      className="bg-red-600 hover:bg-red-500 p-2 rounded text-white text-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-slate-400 line-clamp-2">
                  {route.destinations.map((dest, idx) => (
                    <div key={idx}>→ {dest}</div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
