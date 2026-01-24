import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tra-favorite-routes';
const MAX_ROUTES = 5;

export interface FavoriteRoute {
  id: string;
  originId: string;
  destinationId: string;
  originName: string;
  destName: string;
}

function loadRoutes(): FavoriteRoute[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch {
    // ignore parse errors
  }
  return [];
}

function saveRoutes(routes: FavoriteRoute[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
}

export function useFavoriteRoutes() {
  const [routes, setRoutes] = useState<FavoriteRoute[]>(() => loadRoutes());

  // Sync to localStorage when routes change
  useEffect(() => {
    saveRoutes(routes);
  }, [routes]);

  const addRoute = useCallback(
    (originId: string, destinationId: string, originName: string, destName: string): boolean => {
      // Check if already at max
      if (routes.length >= MAX_ROUTES) {
        return false;
      }

      // Check if route already exists
      const exists = routes.some(
        (r) => r.originId === originId && r.destinationId === destinationId
      );
      if (exists) {
        return false;
      }

      const newRoute: FavoriteRoute = {
        id: `${originId}-${destinationId}-${Date.now()}`,
        originId,
        destinationId,
        originName,
        destName,
      };

      setRoutes((prev) => [...prev, newRoute]);
      return true;
    },
    [routes]
  );

  const removeRoute = useCallback((id: string) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const hasRoute = useCallback(
    (originId: string, destinationId: string): boolean => {
      return routes.some(
        (r) => r.originId === originId && r.destinationId === destinationId
      );
    },
    [routes]
  );

  const canAddMore = routes.length < MAX_ROUTES;

  return {
    routes,
    addRoute,
    removeRoute,
    hasRoute,
    canAddMore,
    maxRoutes: MAX_ROUTES,
  };
}
