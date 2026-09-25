import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";
import SearchBar from "@/components/SearchBar";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import HomeHero from "@/components/HomeHero";
import TravelPackages from "@/components/TravelPackages";
import {
  ALOJAMIENTOS,
  DESTINOS,
  EXPERIENCIAS,
  PRESTADORES,
  formatCOP,
} from "@/lib/data";

// Bienvenida: hero, destinos, paquetes, prestador destacado, cifras y pasos.
export default function Home() {
  const prestadorDestacado = PRESTADORES[0];

  // Trust row reads the real counts, so adding a record updates the page.
  const cifras = [
    {
      valor: DESTINOS.length,
      etiqueta: "destinos rurales de Antioquia con ficha verificada",
    },
    {
      valor: PRESTADORES.length,
      etiqueta: "prestadores con registro turístico y contacto directo",
    },
    {
      valor: EXPERIENCIAS.length,
      etiqueta: "experiencias de aventura, naturaleza, bienestar y cultura",
    },
    {
      valor: ALOJAMIENTOS.length,
      etiqueta: "alojamientos para dormir en cada destino",
    },
  ];

  return (
    <div className="flex flex-col pb-8">
      {/* Hero: full-bleed autoplaying carousel with a two-column overlay band.
          Escapes `main`'s max-w-7xl column: 100vw plus left-1/2/-translate-x-1/2
          re-centers the box on the viewport. The scrollbar gutter that 100vw
          includes is absorbed by `html { overflow-x: clip }` in globals.css. */}
      <div className="w-[100vw] relative left-1/2 -translate-x-1/2">
        <HomeHero>
          <SearchBar />
        </HomeHero>
      </div>

      {/* Destinos: 4 records, 2 columns, no orphan cell. */}
      <section className="mt-16 lg:mt-24">
        <div className="flex items-end justify-between gap-4">
          <h2 className="reveal-up font-headline text-2xl font-bold sm:text-3xl">
            Destinos destacados
          </h2>
          <Link
            href="/oferta"
            className="shrink-0 text-sm font-semibold text-terracota-hover underline underline-offset-4 transition hover:text-terracota-deep active:translate-y-[1px]"
          >
            Ver toda la oferta
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {DESTINOS.map((d) => (
            <DestinationCard key={d.slug} destino={d} />
          ))}
        </div>
      </section>

      <div className="mt-16 lg:mt-24">
        <TravelPackages />
      </div>

      {/* Prestador destacado: media left, content right. */}
      {prestadorDestacado && (
        <section className="mt-16 lg:mt-24">
          <div className="flex items-end justify-between gap-4">
            <h2 className="reveal-up font-headline text-2xl font-bold sm:text-3xl">
              Primer prestador destacado
            </h2>
            <Link
              href="/prestadores"
              className="shrink-0 text-sm font-semibold text-terracota-hover underline underline-offset-4 transition hover:text-terracota-deep active:translate-y-[1px]"
            >
              Ver todos
            </Link>
          </div>
          <article className="mt-6 overflow-hidden rounded-2xl bg-card shadow-warm">
            <div className="grid lg:grid-cols-2">
              <div className="relative aspect-video w-full lg:aspect-auto lg:h-full">
                <img
                  src={prestadorDestacado.fotos[0]}
                  alt={prestadorDestacado.nombre}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <VerifiedBadge />
                  <p className="text-xs font-semibold uppercase tracking-wide text-terracota-hover">
                    <span className="block">{prestadorDestacado.tipo}</span>
                    <span className="block">
                      {prestadorDestacado.municipio} · {prestadorDestacado.vereda}
                    </span>
                  </p>
                </div>
                <h3 className="font-headline text-xl font-bold">
                  {prestadorDestacado.nombre}
                </h3>
                <p className="text-sm font-semibold text-bosque">
                  Desde {formatCOP(prestadorDestacado.precio)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <WhatsAppButton
                    phone={prestadorDestacado.whatsapp}
                    message={`Hola ${prestadorDestacado.nombre}, quiero información sobre ${prestadorDestacado.tipo.toLowerCase()} en ${prestadorDestacado.municipio}.`}
                    label="Chatear por WhatsApp"
                  />
                  <a
                    href={`tel:${prestadorDestacado.telefono.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified active:translate-y-[1px]"
                  >
                    Llamar
                  </a>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {/* Trust row: real counts, hairline dividers, no card boxes. */}
      <section className="mt-16 lg:mt-24">
        <div className="grid grid-cols-2 divide-y divide-inputborder/60 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          {cifras.map((c) => (
            <div
              key={c.etiqueta}
              className="py-5 pl-4 pr-4 first:pl-0 lg:pl-6 lg:pr-6 lg:first:pl-0"
            >
              <p className="font-headline text-4xl font-extrabold text-bosque sm:text-5xl">
                {c.valor}
              </p>
              <p className="mt-1 text-sm text-ink/70">{c.etiqueta}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works: one divided row, no per-step cards. */}
      <section className="mt-16 lg:mt-24">
        <div className="rounded-2xl bg-soft p-6 sm:p-8">
          <h2 className="reveal-up font-headline text-2xl font-bold sm:text-3xl">
            ¿Cómo funciona?
          </h2>
          <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:divide-x sm:divide-inputborder/60">
            {[
              [
                "Elige",
                "Compara tiempos de viaje, clima y transporte por la región.",
              ],
              [
                "Conecta",
                "Escríbele por WhatsApp al prestador verificado, sin intermediarios.",
              ],
              [
                "Arma",
                "Guarda fechas y transporte, comparte tu itinerario e imprímelo.",
              ],
            ].map(([title, desc]) => (
              <li key={title} className="sm:pl-6 sm:first:pl-0">
                <p className="font-headline text-base font-bold text-bosque">
                  {title}
                </p>
                <p className="mt-1 text-sm text-ink/70">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
