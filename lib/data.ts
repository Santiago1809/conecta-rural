// Typed access to mock JSON data + small formatting helpers.

import destinos from "@/data/destinos.json";
import prestadores from "@/data/prestadores.json";
import experiencias from "@/data/experiencias.json";
import alojamientos from "@/data/alojamientos.json";

export interface ItinerarioItem {
  hora: string;
  titulo: string;
  detalle: string;
}

export interface Destino {
  slug: string;
  nombre: string;
  municipio: string;
  vereda: string;
  lat: number;
  lon: number;
  tiempo_aprox: string;
  consejo: string;
  hero: string;
  hero_credit: string;
  transporte: string[];
  tiempos_transporte: Record<string, string>;
  precio_desde: number;
  verificado: boolean;
  descripcion: string;
  itinerario: ItinerarioItem[];
}

export interface Prestador {
  nombre: string;
  municipio: string;
  vereda: string;
  destino_slug: string;
  tipo: string;
  whatsapp: string;
  telefono: string;
  precio: number;
  codigo_rnt: string;
  fotos: string[];
  fotos_credit?: string[];
  demo?: boolean;
}

export interface Experiencia {
  nombre: string;
  destino_slug: string;
  categoria: string;
  precio: number;
  descripcion: string;
  foto: string;
  foto_credit?: string;
}

export interface Alojamiento {
  nombre: string;
  destino_slug: string;
  municipio: string;
  vereda: string;
  precio: number;
  whatsapp: string;
  descripcion: string;
  foto: string;
  foto_credit?: string;
  demo?: boolean;
}

export const DESTINOS = destinos as Destino[];
export const PRESTADORES = prestadores as Prestador[];
export const EXPERIENCIAS = experiencias as Experiencia[];
export const ALOJAMIENTOS = alojamientos as Alojamiento[];

export function getDestino(slug: string): Destino | undefined {
  return DESTINOS.find((d) => d.slug === slug);
}

/** "85000" -> "$85.000 COP" */
export function formatCOP(value: number): string {
  return `$${value.toLocaleString("es-CO")} COP`;
}

export const TRANSPORTE_LABELS: Record<string, string> = {
  bus: "Bus intermunicipal",
  chiva: "Chiva turística",
  carro_4x4: "Carro 4x4",
  caballo_caminata: "Caballo / caminata",
};
