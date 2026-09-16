"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  destLat: number;
  destLon: number;
  destName: string;
  /** Route polyline as [lon, lat] pairs from the /api/route handler. */
  geometry: [number, number][];
}

const ORIGIN: [number, number] = [6.2442, -75.5812]; // Medellín

// Keeps the viewport fitted to origin + destination + route.
function FitBounds({ dest, geometry }: { dest: [number, number]; geometry: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [ORIGIN, dest];
    for (const [lon, lat] of geometry) pts.push([lat, lon]);
    map.fitBounds(pts, { padding: [32, 32] });
  }, [map, dest, geometry]);
  return null;
}

// Leaflet + OSM map with route line. Always loaded with ssr:false.
export default function DestinationMap({ destLat, destLon, destName, geometry }: Props) {
  const dest: [number, number] = [destLat, destLon];
  const line: [number, number][] = geometry.map(([lon, lat]) => [lat, lon]);
  return (
    <div className="relative z-0 isolate">
    <MapContainer
      center={dest}
      zoom={9}
      scrollWheelZoom={false}
      className="relative z-0 h-72 w-full overflow-hidden rounded-2xl sm:h-96"
      style={{ zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={ORIGIN} radius={8} pathOptions={{ color: "#1E4B37", fillColor: "#1E4B37", fillOpacity: 1 }}>
        <Popup>Medellín · punto de partida</Popup>
      </CircleMarker>
      <CircleMarker center={dest} radius={8} pathOptions={{ color: "#C85A32", fillColor: "#C85A32", fillOpacity: 1 }}>
        <Popup>{destName}</Popup>
      </CircleMarker>
      {line.length > 1 && (
        <Polyline positions={line} pathOptions={{ color: "#C85A32", weight: 4 }} />
      )}
      <FitBounds dest={dest} geometry={geometry} />
    </MapContainer>
    </div>
  );
}
