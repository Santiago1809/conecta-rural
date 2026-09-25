"use client";

import { useEffect, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ALOJAMIENTOS, DESTINOS, EXPERIENCIAS, type Destino } from "@/lib/data";

type PoiCategory =
  | "aventura"
  | "naturaleza"
  | "bienestar"
  | "cultura"
  | "alojamiento"
  | "restaurante";

const poiSymbols: Record<PoiCategory, string> = {
  aventura: "⚑",
  naturaleza: "✿",
  bienestar: "☼",
  cultura: "◇",
  alojamiento: "⌂",
  restaurante: "♨",
};

const poiIcons = Object.fromEntries(
  Object.entries(poiSymbols).map(([category, symbol]) => [
    category,
    L.divIcon({
      className: "hub-poi-icon",
      html: `<span class="hub-poi hub-poi-${category}" aria-hidden="true">${symbol}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    }),
  ]),
) as Record<PoiCategory, L.DivIcon>;

function ZoomAwarePoints({ destinos }: { destinos: Destino[] }) {
  const [zoom, setZoom] = useState(9);

  useMapEvents({
    zoomend: (event) => setZoom(event.target.getZoom()),
  });

  return <PointsOfInterest destinos={destinos} zoom={zoom} />;
}

function PointsOfInterest({
  destinos,
  zoom,
}: {
  destinos: Destino[];
  zoom: number;
}) {
  if (zoom < 11) return null;

  const activityPoints = EXPERIENCIAS.map((experiencia, index) => {
    const destino = destinos.find(
      (item) => item.slug === experiencia.destino_slug,
    );
    if (!destino) return null;
    return {
      key: `actividad-${experiencia.nombre}`,
      name: experiencia.nombre,
      description: experiencia.descripcion,
      type: experiencia.categoria as PoiCategory,
      label: `Actividad de ${experiencia.categoria}`,
      position: [
        destino.lat + 0.012 + (index % 2) * 0.006,
        destino.lon + 0.012 + (index % 3) * 0.006,
      ] as [number, number],
      destino: destino.municipio,
    };
  }).filter(Boolean);

  const accommodationPoints = ALOJAMIENTOS.map((alojamiento, index) => {
    const destino = destinos.find(
      (item) => item.slug === alojamiento.destino_slug,
    );
    if (!destino) return null;
    return {
      key: `alojamiento-${alojamiento.nombre}`,
      name: alojamiento.nombre,
      description: alojamiento.descripcion,
      type: "alojamiento" as const,
      label: "Alojamiento",
      position: [
        destino.lat - 0.012 - (index % 2) * 0.006,
        destino.lon - 0.014 - (index % 3) * 0.004,
      ] as [number, number],
      destino: destino.municipio,
    };
  }).filter(Boolean);

  const foodPoints = ALOJAMIENTOS.filter((alojamiento) =>
    /restaurant|restaurante|gastronómica|cocina|menú/i.test(
      alojamiento.descripcion,
    ),
  )
    .map((alojamiento, index) => {
      const destino = destinos.find(
        (item) => item.slug === alojamiento.destino_slug,
      );
      if (!destino) return null;
      return {
        key: `restaurante-${alojamiento.nombre}`,
        name: alojamiento.nombre,
        description: alojamiento.descripcion,
        type: "restaurante" as const,
        label: "Restaurante",
        position: [
          destino.lat - 0.018 - (index % 2) * 0.006,
          destino.lon + 0.018,
        ] as [number, number],
        destino: destino.municipio,
      };
    })
    .filter(Boolean);

  return (
    <>
      {[...activityPoints, ...accommodationPoints, ...foodPoints].map(
        (point) =>
          point && (
            <Marker
              key={point.key}
              position={point.position}
              icon={poiIcons[point.type]}
            >
              <Popup>
                <strong>{point.name}</strong>
                <br />
                <span>
                  {point.label} · {point.destino}
                </span>
                <p>{point.description}</p>
              </Popup>
            </Marker>
          ),
      )}
    </>
  );
}

function FitHubsBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = DESTINOS.map(
      (destino) => [destino.lat, destino.lon] as [number, number],
    );
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 9 });
  }, [map]);

  return null;
}

export default function HubsMap() {
  const route = DESTINOS.map(
    (destino) => [destino.lat, destino.lon] as [number, number],
  );

  return (
    <div className="relative z-0 isolate overflow-hidden rounded-2xl">
      <MapContainer
        center={[6.21, -75.46]}
        zoom={9}
        scrollWheelZoom={false}
        className="relative z-0 h-[28rem] w-full"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={route}
          pathOptions={{ color: "#C85A32", weight: 4, opacity: 0.75 }}
        />
        {DESTINOS.map((destino) => (
          <CircleMarker
            key={destino.slug}
            center={[destino.lat, destino.lon]}
            radius={9}
            pathOptions={{
              color: "#1E4B37",
              fillColor: "#C85A32",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <strong>{destino.municipio}</strong>
              <br />
              {destino.nombre}
            </Popup>
          </CircleMarker>
        ))}
        <ZoomAwarePoints destinos={DESTINOS} />
        <FitHubsBounds />
      </MapContainer>
    </div>
  );
}
