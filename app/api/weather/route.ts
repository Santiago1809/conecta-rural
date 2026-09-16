import { NextRequest, NextResponse } from "next/server";
import { openMeteoUrl } from "@/lib/meteo";

// GET /api/weather?lat=..&lon=.. — Open-Meteo proxy, cached 1h at the edge.
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const lat = Number(q.get("lat"));
  const lon = Number(q.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 });
  }
  try {
    const res = await fetch(openMeteoUrl(lat, lon), {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener el clima", fallback: true },
      { status: 502 },
    );
  }
}
