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

export interface PaqueteViaje {
  slug: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  duracion: string;
  precio_desde: number;
  elegidoPorcentaje: number;
  destinoSlugs: string[];
  imagen: string;
}

export const DESTINOS = destinos as Destino[];
export const PRESTADORES = prestadores as Prestador[];
export const EXPERIENCIAS = experiencias as Experiencia[];
export const ALOJAMIENTOS = alojamientos as Alojamiento[];

export const PAQUETES: PaqueteViaje[] = [
  {
    slug: "aventura-esencial",
    nombre: "Aventura esencial",
    resumen: "Embalse, cascadas y sabores locales en un fin de semana.",
    descripcion:
      "El paquete más elegido por quienes visitan Mi Ruta por primera vez.",
    duracion: "2 días / 1 noche",
    precio_desde: 165000,
    elegidoPorcentaje: 64,
    destinoSlugs: ["guatape", "san-carlos"],
    imagen:
      "https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg",
  },
  {
    slug: "montana-con-calma",
    nombre: "Montaña con calma",
    resumen: "Caminatas, yoga y una mesa campesina sin afanes.",
    descripcion:
      "Una pausa de bienestar para disfrutar el paisaje a otro ritmo.",
    duracion: "2 días / 1 noche",
    precio_desde: 120000,
    elegidoPorcentaje: 22,
    destinoSlugs: ["san-antonio-de-pereira", "sopetran"],
    imagen: "https://images.pexels.com/photos/317157/pexels-photo-317157.jpeg",
  },
  {
    slug: "agua-y-territorio",
    nombre: "Agua y territorio",
    resumen: "Río, cascadas y encuentros con anfitriones de la región.",
    descripcion:
      "Un recorrido activo para quienes quieren pasar más tiempo al aire libre.",
    duracion: "3 días / 2 noches",
    precio_desde: 230000,
    elegidoPorcentaje: 14,
    destinoSlugs: ["san-carlos", "guatape", "sopetran"],
    imagen:
      "https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg",
  },
];

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
