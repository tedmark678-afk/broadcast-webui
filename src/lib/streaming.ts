// Stream routing and management

export interface StreamRoute {
  id: string;
  name: string;
  source: string;
  destinations: string[];
  active: boolean;
  createdAt: string;
}

export interface RoutingRules {
  switchOnError: boolean;
  loadBalance: boolean;
  recordBackup: boolean;
}

let routes: StreamRoute[] = [];

export function createRoute(
  name: string,
  source: string,
  destinations: string[]
): StreamRoute {
  const route: StreamRoute = {
    id: `route-${Date.now()}`,
    name,
    source,
    destinations,
    active: false,
    createdAt: new Date().toISOString(),
  };

  routes.push(route);
  return route;
}

export function getRoutes(): StreamRoute[] {
  return routes;
}

export function toggleRoute(id: string): boolean {
  const route = routes.find((r) => r.id === id);
  if (route) {
    route.active = !route.active;
    return route.active;
  }
  return false;
}

export function deleteRoute(id: string): boolean {
  const index = routes.findIndex((r) => r.id === id);
  if (index !== -1) {
    routes.splice(index, 1);
    return true;
  }
  return false;
}

export function updateRoute(
  id: string,
  updates: Partial<StreamRoute>
): StreamRoute | null {
  const route = routes.find((r) => r.id === id);
  if (route) {
    Object.assign(route, updates);
    return route;
  }
  return null;
}
