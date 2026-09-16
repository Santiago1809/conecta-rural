import { NextRequest, NextResponse } from "next/server";
import { fetchRoute } from "@/lib/osrm";

// GET /api/route?fromLat=..&fromLon=..&toLat=..&toLon=..
// Proxies OSRM with a haversine fallback so the map never breaks.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const fromLat = Number(q.get("fromLat"));
  const fromLon = Number(q.get("fromLon"));
  const toLat = Number(q.get("toLat"));
  const toLon = Number(q.get("toLon"));
  if ([fromLat, fromLon, toLat, toLon].some((n) => !Number.isFinite(n))) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }
  const result = await fetchRoute(
    { lat: fromLat, lon: fromLon },
    { lat: toLat, lon: toLon },
  );
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
