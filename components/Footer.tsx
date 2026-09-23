import Link from "next/link";

// Simple footer with attribution for map and photo sources.
export default function Footer() {
  return (
    <footer className="mt-16 border-t border-inputborder/60 bg-soft">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-ink/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-headline font-semibold text-ink">
           Mi Ruta · Turismo comunitario en Antioquia
        </p>
        <p>
          Mapas ©{" "}
          <a
            className="underline"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noreferrer"
          >
            OpenStreetMap
          </a>{" "}
          · Rutas OSRM · Clima Open-Meteo · Fotos Pexels
        </p>
        <Link href="/plan" className="font-medium text-bosque underline">
          Arma tu plan
        </Link>
      </div>
    </footer>
  );
}
