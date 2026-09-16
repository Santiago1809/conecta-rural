import { NextRequest, NextResponse } from "next/server";
import { RNT_DATASET_ID } from "@/lib/env";

// GET /api/rnt?codigo=12345 — looks up a provider in the open RNT dataset
// on datos.gov.co (Socrata), restricted to ANTIOQUIA. Never fails hard:
// unknown results return { found: false } so the page keeps rendering.
export async function GET(request: NextRequest) {
  const codigo = request.nextUrl.searchParams.get("codigo")?.trim() ?? "";
  if (!codigo) {
    return NextResponse.json({ error: "Falta el código RNT" }, { status: 400 });
  }
  const soql = `$limit=5&$where=departamento='ANTIOQUIA'&$q=${encodeURIComponent(codigo)}`;
  try {
    const res = await fetch(
      `https://www.datos.gov.co/resource/${RNT_DATASET_ID}.json?${soql}`,
      { headers: { Accept: "application/json" }, next: { revalidate: 86400 } },
    );
    if (!res.ok) throw new Error(`Socrata ${res.status}`);
    const rows = (await res.json()) as unknown[];
    return NextResponse.json(
      { found: rows.length > 0, matches: rows.length, codigo },
      {
        headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400" },
      },
    );
  } catch {
    return NextResponse.json({ found: false, codigo, fallback: true });
  }
}
