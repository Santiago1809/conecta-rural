"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PAQUETES, DESTINOS, formatCOP } from "@/lib/data";
import { upsertPlanItem } from "@/lib/plan";
import CommentsSection from "@/components/CommentsSection";
import { showToast } from "@/lib/toast";

export default function TravelPackages() {
  const router = useRouter();

  function customize(slugs: string[]) {
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
    router.push("/plan");
  }

  return (
    <section className="flex flex-col gap-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">
          Viajes ya armados
        </p>
        <h2 className="mt-2 font-headline text-2xl font-bold sm:text-3xl">
          Si no quieres empezar de cero, Mi Ruta ya te propone un camino.
        </h2>
        <p className="mt-2 text-ink/70">
          Creamos estos planes con base en lo que más eligen los viajeros.
          Puedes tomar el más elegido y modificarlo a tu gusto.
        </p>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-3">
        {PAQUETES.map((paquete, index) => (
          <article
            key={paquete.slug}
            className="flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-warm"
          >
            <div className="relative aspect-[4/3] shrink-0">
              <Image
                src={paquete.imagen}
                alt={`Personas disfrutando ${paquete.nombre}`}
                fill
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-cover"
              />
              {index === 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-terracota px-3 py-1 text-xs font-bold text-white">
                  El más elegido
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex min-h-12 items-start justify-between gap-3">
                <h3 className="font-headline text-xl font-bold leading-tight">
                  {paquete.nombre}
                </h3>
                <span className="shrink-0 pt-1 text-right text-xs font-semibold text-bosque">
                  {paquete.elegidoPorcentaje}% lo elige
                </span>
              </div>
              <p className="text-sm text-ink/70">{paquete.resumen}</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                {paquete.duracion} · desde {formatCOP(paquete.precio_desde)}
              </p>
              <button
                type="button"
                onClick={() => customize(paquete.destinoSlugs)}
                className="mt-auto w-full rounded-[10px] bg-bosque px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-bosque-hover"
              >
                Modificar a mi gusto
              </button>
              <CommentsSection resourceType="package" resourceId={paquete.slug} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
  showToast("El paquete se añadió a tu itinerario.");
