"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useMemo, useState } from "react";
import useSWR from "swr";
import Timeline from "@/components/Timeline";
import TransportSelector from "@/components/TransportSelector";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import CommentsSection from "@/components/CommentsSection";
import { MEDELLIN_ORIGIN } from "@/lib/env";
import { formatCOP, PRESTADORES, TRANSPORTE_LABELS, type Destino } from "@/lib/data";
import { consejoClima, weatherCodeLabel } from "@/lib/meteo";
import { formatDuration, type RouteResult } from "@/lib/osrm";
import { upsertPlanItem } from "@/lib/plan";
import { showToast } from "@/lib/toast";

const DestinationMap = dynamic(
  () => import("@/components/DestinationMap"),
  { ssr: false, loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-soft sm:h-96" /> },
);

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface WeatherPayload {
  current?: {
    temperature_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
  };
  daily?: {
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
  error?: string;
}

interface Props {
  destino: Destino;
  fechaInicial: string;
  placeLabel: string;
}

// Client detail: live route + weather, transport picker, itinerary, save-to-plan.
export default function DestinoDetail({ destino, fechaInicial, placeLabel }: Props) {
  const [transporte, setTransporte] = useState(destino.transporte[0] ?? "bus");
  const [fecha, setFecha] = useState(fechaInicial);
  const [guardado, setGuardado] = useState(false);

  const routeUrl =
    `/api/route?fromLat=${MEDELLIN_ORIGIN.lat}&fromLon=${MEDELLIN_ORIGIN.lon}` +
    `&toLat=${destino.lat}&toLon=${destino.lon}`;
  const { data: ruta } = useSWR<RouteResult>(routeUrl, fetcher);

  const { data: clima } = useSWR<WeatherPayload>(
    `/api/weather?lat=${destino.lat}&lon=${destino.lon}`,
    fetcher,
  );

  const prestador = useMemo(
    () => PRESTADORES.find((p) => p.destino_slug === destino.slug),
    [destino.slug],
  );

  const climaActual = clima?.current;
  const tiempoEstimado =
    transporte === "carro_4x4" && ruta
      ? formatDuration(ruta.durationMin)
      : destino.tiempos_transporte[transporte] ?? destino.tiempo_aprox;
  const consejoVivo = climaActual
    ? consejoClima(climaActual.temperature_2m, climaActual.precipitation, climaActual.wind_speed_10m)
    : destino.consejo;

  function guardar() {
    upsertPlanItem({ slug: destino.slug, fecha, transporte });
    setGuardado(true);
    showToast(`${destino.nombre} se añadió a tu itinerario.`);
  }

  const waMsg = `Hola, quiero reservar en ${destino.nombre} (${destino.municipio}) para el ${fecha || "próximo fin de semana"}. Llego en ${TRANSPORTE_LABELS[transporte] ?? transporte}.`;

  const inputCls =
    "w-full rounded-[10px] border border-inputborder bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-bosque focus:ring-2 focus:ring-bosque/20";

  return (
    <div className="flex flex-col gap-8 py-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-card shadow-warm">
        <div className="relative aspect-video w-full">
          <Image src={destino.hero} alt={destino.nombre} fill priority className="object-cover" />
        </div>
        <div className="flex flex-col gap-3 p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
              {destino.municipio} · {destino.vereda}
            </p>
            {destino.verificado && <VerifiedBadge />}
          </div>
          <h1 className="font-headline text-3xl font-extrabold sm:text-4xl">
            {destino.nombre}
          </h1>
          <p className="max-w-2xl text-ink/70">{destino.descripcion}</p>
          <p className="text-sm text-ink/60">Ubicación aproximada: {placeLabel}</p>
          <p className="text-lg font-bold text-bosque">
            Desde {formatCOP(destino.precio_desde)}
          </p>
        </div>
      </section>

      {/* Map + route */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DestinationMap
            destLat={destino.lat}
            destLon={destino.lon}
            destName={destino.nombre}
            geometry={ruta?.geometry ?? []}
          />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-warm">
          <h2 className="font-headline text-xl font-bold">Cómo llegar</h2>
          <p className="text-sm text-ink/70">
            Desde {MEDELLIN_ORIGIN.label} en {TRANSPORTE_LABELS[transporte] ?? transporte}.
          </p>
          {ruta ? (
            <ul className="flex flex-col gap-1 text-sm">
              <li><strong>Distancia:</strong> {ruta.distanceKm} km</li>
              <li><strong>Tiempo estimado:</strong> {tiempoEstimado}</li>
              <li className="text-ink/60">
                {transporte === "carro_4x4"
                  ? "Calculado con OSRM y ajustable según el estado de la vía."
                  : "Estimación local para este medio de transporte."}
              </li>
              {ruta.fallback && (
                <li className="text-ink/60">Estimación aproximada (OSRM no disponible).</li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-ink/60">Calculando ruta…</p>
          )}
          <h3 className="mt-2 font-headline text-base font-bold">Transporte</h3>
          <TransportSelector options={destino.transporte} value={transporte} onChange={setTransporte} />
        </div>
      </section>

      {/* Weather + itinerary */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-warm">
          <h2 className="font-headline text-xl font-bold">Clima ahora</h2>
          {climaActual ? (
            <>
              <p className="font-headline text-4xl font-extrabold text-bosque">
                {Math.round(climaActual.temperature_2m)} °C
              </p>
              <p className="text-sm text-ink/70">
                {weatherCodeLabel(climaActual.weather_code)} · Viento{" "}
                {Math.round(climaActual.wind_speed_10m)} km/h
              </p>
              {clima?.daily && (
                <p className="text-sm text-ink/70">
                  Hoy: {Math.round(clima.daily.temperature_2m_min[0])}° /{" "}
                  {Math.round(clima.daily.temperature_2m_max[0])}° · Lluvia{" "}
                  {clima.daily.precipitation_probability_max[0]} %
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink/60">Cargando clima en vivo…</p>
          )}
          <p className="rounded-[10px] bg-soft p-3 text-sm font-medium text-bosque-deep">
            Consejo: {consejoVivo}
          </p>
        </div>
        <div className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-warm lg:col-span-2">
          <h2 className="font-headline text-xl font-bold">Itinerario sugerido</h2>
          <Timeline items={destino.itinerario} />
        </div>
      </section>

      {/* Booking */}
      <section className="flex flex-col gap-4 rounded-2xl bg-soft p-6 sm:flex-row sm:items-end sm:p-8">
        <label className="flex-1">
          <span className="mb-1 block text-sm font-semibold">Fecha del viaje</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className={inputCls} />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={guardar}
            className="rounded-[10px] bg-terracota px-6 py-2.5 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-terracota-hover"
          >
            {guardado ? "Guardado en mi plan ✓" : "Reservar / Guardar plan"}
          </button>
          {prestador && (
            <WhatsAppButton phone={prestador.whatsapp} message={waMsg} label="Reservar por WhatsApp" />
          )}
        </div>
      </section>

      <CommentsSection resourceType="destination" resourceId={destino.slug} />
    </div>
  );
}
