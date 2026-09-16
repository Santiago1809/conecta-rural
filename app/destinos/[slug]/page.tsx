import { notFound } from "next/navigation";
import { DESTINOS, getDestino } from "@/lib/data";
import { NOMINATIM_USER_AGENT } from "@/lib/env";
import DestinoDetail from "./DestinoDetail";

export function generateStaticParams() {
  return DESTINOS.map((d) => ({ slug: d.slug }));
}

// Reverse-geocode a friendly place label (Nominatim, 1 req/s friendly: cached).
async function placeLabel(lat: number, lon: number, fallback: string): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`,
      {
        headers: { "User-Agent": NOMINATIM_USER_AGENT, Accept: "application/json" },
        next: { revalidate: 86400 },
      },
    );
    if (!res.ok) return fallback;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name?.split(",").slice(0, 2).join(",") ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function DestinoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fecha?: string }>;
}) {
  const { slug } = await params;
  const { fecha } = await searchParams;
  const destino = getDestino(slug);
  if (!destino) notFound();
  const label = await placeLabel(
    destino.lat,
    destino.lon,
    `${destino.municipio}, Antioquia`,
  );
  return <DestinoDetail destino={destino} fechaInicial={fecha ?? ""} placeLabel={label} />;
}
