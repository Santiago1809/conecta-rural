"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import Timeline from "@/components/Timeline";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import { MEDELLIN_ORIGIN } from "@/lib/env";
import { TRANSPORTE_LABELS, formatCOP, getDestino } from "@/lib/data";
import { consejoClima, weatherCodeLabel } from "@/lib/meteo";
import { formatDuration, type RouteResult } from "@/lib/osrm";
import { loadPlan, removePlanItem, type PlanItem } from "@/lib/plan";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// One saved destino with live weather + route snapshot.
function PlanCard({ item, onRemove }: { item: PlanItem; onRemove: () => void }) {
  const destino = getDestino(item.slug);
  const { data: ruta } = useSWR<RouteResult>(
    destino
      ? `/api/route?fromLat=${MEDELLIN_ORIGIN.lat}&fromLon=${MEDELLIN_ORIGIN.lon}&toLat=${destino.lat}&toLon=${destino.lon}`
      : null,
    fetcher,
  );
  const { data: clima } = useSWR<{
    current?: { temperature_2m: number; precipitation: number; weather_code: number; wind_speed_10m: number };
  }>(destino ? `/api/weather?lat=${destino.lat}&lon=${destino.lon}` : null, fetcher);

  if (!destino) return null;
  const c = clima?.current;

  return (
    <article className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-warm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
            {destino.municipio} · {destino.vereda}
          </p>
          <h2 className="font-headline text-2xl font-bold">{destino.nombre}</h2>
          <p className="text-sm text-ink/70">
            {item.fecha ? `Viaje: ${item.fecha}` : "Fecha por definir"} ·{" "}
            {TRANSPORTE_LABELS[item.transporte] ?? item.transporte}
          </p>
        </div>
        <VerifiedBadge />
      </div>

      <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-[10px] bg-soft p-3">
          <p className="font-bold text-bosque-deep">Snapshot de ruta</p>
          {ruta ? (
            <p className="text-ink/70">
              {ruta.distanceKm} km · {formatDuration(ruta.durationMin)} desde{" "}
              {MEDELLIN_ORIGIN.label}
              {ruta.fallback ? " (estimado)" : ""}
            </p>
          ) : (
            <p className="text-ink/60">Cargando ruta…</p>
          )}
        </div>
        <div className="rounded-[10px] bg-soft p-3">
          <p className="font-bold text-bosque-deep">Snapshot de clima</p>
          {c ? (
            <p className="text-ink/70">
              {Math.round(c.temperature_2m)} °C · {weatherCodeLabel(c.weather_code)} ·{" "}
              {consejoClima(c.temperature_2m, c.precipitation, c.wind_speed_10m)}
            </p>
          ) : (
            <p className="text-ink/60">Cargando clima…</p>
          )}
        </div>
      </div>

      <Timeline items={destino.itinerario.slice(0, 3)} />
      <p className="text-sm font-semibold text-bosque">
        Desde {formatCOP(destino.precio_desde)}
      </p>

      <div className="no-print flex flex-wrap gap-2">
        <Link
          href={`/destinos/${destino.slug}`}
          className="rounded-[10px] bg-bosque px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-bosque-hover"
        >
          Ver detalle
        </Link>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-[10px] border border-inputborder bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-terracota hover:text-terracota"
        >
          Quitar del plan
        </button>
      </div>
    </article>
  );
}

// Tu plan: localStorage summary with share-via-WhatsApp and print.
export default function PlanView() {
  const [items, setItems] = useState<PlanItem[] | null>(null);

  useEffect(() => {
    setItems(loadPlan());
  }, []);

  if (items === null) {
    return <p className="py-8 text-sm text-ink/60">Cargando tu plan…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 py-8">
        <h1 className="font-headline text-3xl font-extrabold">Tu plan está vacío</h1>
        <p className="text-ink/70">
          Elige un destino y guárdalo para ver aquí tu resumen con clima y ruta.
        </p>
        <Link
          href="/"
          className="rounded-[10px] bg-terracota px-6 py-2.5 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-terracota-hover"
        >
          Explorar destinos
        </Link>
      </div>
    );
  }

  const shareMsg = [
    "Mi plan Conecta Rural:",
    ...items.map((i) => {
      const d = getDestino(i.slug);
      return d
        ? `· ${d.nombre} (${d.municipio}) — ${i.fecha || "fecha por definir"} — ${TRANSPORTE_LABELS[i.transporte] ?? i.transporte} — desde ${formatCOP(d.precio_desde)}`
        : null;
    }).filter(Boolean),
  ].join("\n");

  return (
    <div className="flex flex-col gap-6 py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-headline text-3xl font-extrabold">Tu plan</h1>
          <p className="text-ink/70">
            {items.length} destino{items.length > 1 ? "s" : ""} guardado
            {items.length > 1 ? "s" : ""} en este dispositivo.
          </p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <WhatsAppButton message={shareMsg} label="Compartir por WhatsApp" />
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified"
          >
            Imprimir
          </button>
        </div>
      </header>
      {items.map((item) => (
        <PlanCard
          key={item.slug}
          item={item}
          onRemove={() => setItems(removePlanItem(item.slug))}
        />
      ))}
    </div>
  );
}
