// OSRM helpers: route fetch with a haversine fallback when the service fails.

export interface RoutePoint {
  lat: number;
  lon: number;
}

export interface RouteResult {
  distanceKm: number;
  durationMin: number;
  /** GeoJSON LineString coordinates as [lon, lat] pairs. */
  geometry: [number, number][];
  fallback: boolean;
}

export function osrmUrl(from: RoutePoint, to: RoutePoint): string {
  return (
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
  );
}

/** Great-circle distance in km (used for the offline fallback estimate). */
export function haversineKm(from: RoutePoint, to: RoutePoint): number {
  const R = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLon = ((to.lon - from.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Fallback estimate: road distance ~1.35x straight line at ~38 km/h rural average. */
export function fallbackRoute(from: RoutePoint, to: RoutePoint): RouteResult {
  const distanceKm = Math.round(haversineKm(from, to) * 1.35 * 10) / 10;
  const durationMin = Math.round((distanceKm / 38) * 60);
  return {
    distanceKm,
    durationMin,
    geometry: [
      [from.lon, from.lat],
      [to.lon, to.lat],
    ],
    fallback: true,
  };
}

interface OsrmResponse {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry?: { coordinates?: [number, number][] };
  }>;
}

export async function fetchRoute(
  from: RoutePoint,
  to: RoutePoint,
): Promise<RouteResult> {
  try {
    const res = await fetch(osrmUrl(from, to), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return fallbackRoute(from, to);
    const data = (await res.json()) as OsrmResponse;
    const route = data.routes?.[0];
    if (!route) return fallbackRoute(from, to);
    return {
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
      geometry: route.geometry?.coordinates ?? [
        [from.lon, from.lat],
        [to.lon, to.lat],
      ],
      fallback: false,
    };
  } catch {
    return fallbackRoute(from, to);
  }
}

export function formatDuration(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
