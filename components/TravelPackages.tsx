"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PAQUETES, DESTINOS, formatCOP } from "@/lib/data";
import { upsertPlanItem } from "@/lib/plan";
import CommentsSection from "@/components/CommentsSection";
import { showToast } from "@/lib/toast";

// Derived from the data, not from the array index, so reordering data/paquetes
// cannot hand the "El más elegido" label to the wrong package.
const MAS_ELEGIDO = Math.max(...PAQUETES.map((paquete) => paquete.elegidoPorcentaje));

export default function TravelPackages() {
  const router = useRouter();
  // One section-level state, so only one thread is ever open and only one
  // CommentsSection is mounted (and fetching) at a time.
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function customize(slugs: string[]) {
    if (pending) return;
    setPending(true);
    slugs.forEach((slug) => {
      const destino = DESTINOS.find((item) => item.slug === slug);
      if (destino) {
        upsertPlanItem({
          slug,
          fecha: "",
          transporte: destino.transporte[0] ?? "bus",
        });
      }
    });
    showToast("El paquete se añadió a tu itinerario.");
    router.push("/plan");
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota-hover">
          Viajes ya armados
        </p>
        <h2 className="reveal-up mt-2 font-headline text-2xl font-bold sm:text-3xl">
          Si no quieres empezar de cero, Mi Ruta ya te propone un camino.
        </h2>
        <p className="mt-2 text-ink/70">
          Creamos estos planes con base en lo que más eligen los viajeros.
          Puedes tomar el más elegido y modificarlo a tu gusto.
        </p>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {PAQUETES.map((paquete) => {
          const esMasElegido = paquete.elegidoPorcentaje === MAS_ELEGIDO;
          const comentariosId = `comentarios-${paquete.slug}`;
          const comentariosAbiertos = openSlug === paquete.slug;
          return (
            <article
              key={paquete.slug}
              className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-warm"
            >
              <div className="relative aspect-video shrink-0">
                <Image
                  src={paquete.imagen}
                  alt={`Imagen del paquete ${paquete.nombre}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-3 p-5">
                {esMasElegido && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-terracota-hover">
                    El más elegido
                  </p>
                )}
                <h3 className="font-headline text-xl font-bold leading-tight">
                  {paquete.nombre}
                </h3>
                <p className="text-sm text-ink/70">{paquete.resumen}</p>
                <p className="text-base font-semibold text-bosque">
                  Desde {formatCOP(paquete.precio_desde)}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/70">
                  {paquete.duracion} · {paquete.elegidoPorcentaje}% lo eligen
                </p>
                <button
                  type="button"
                  onClick={() => customize(paquete.destinoSlugs)}
                  disabled={pending}
                  className="mt-auto w-full rounded-[10px] bg-terracota-hover px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-terracota-deep active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Modificar a mi gusto
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenSlug(comentariosAbiertos ? null : paquete.slug)
                  }
                  aria-expanded={comentariosAbiertos}
                  aria-controls={comentariosId}
                  className="rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified active:translate-y-[1px]"
                >
                  {comentariosAbiertos
                    ? "Ocultar comentarios"
                    : "Ver comentarios"}
                </button>
                {comentariosAbiertos && (
                  <div id={comentariosId}>
                    <CommentsSection
                      resourceType="package"
                      resourceId={paquete.slug}
                      variant="embedded"
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
