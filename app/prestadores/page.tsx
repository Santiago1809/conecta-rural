import Image from "next/image";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PRESTADORES, formatCOP, getDestino } from "@/lib/data";
import RntBadge from "./RntBadge";

// Mi Ruta: provider cards with direct wa.me chat + tel: fallback + RNT badge.
export default function PrestadoresPage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-extrabold">Conéctate con prestadores</h1>
        <p className="text-ink/70">
          Habla directo por WhatsApp con guías, fincas y operadores verificados.
          Si no tienes datos, usa la llamada telefónica.
        </p>
      </header>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {PRESTADORES.map((p) => {
          const destino = getDestino(p.destino_slug);
          const msg = `Hola ${p.nombre}, quiero información sobre ${p.tipo.toLowerCase()} en ${p.municipio}.`;
          return (
            <article key={p.nombre} className="overflow-hidden rounded-2xl bg-card shadow-warm">
              <div className="relative aspect-video w-full">
                <Image
                  src={p.fotos[0]}
                  alt={p.nombre}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <VerifiedBadge />
                  <RntBadge codigo={p.codigo_rnt} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
                  {p.tipo} · {p.municipio} · {p.vereda}
                </p>
                <h2 className="font-headline text-xl font-bold">{p.nombre}</h2>
                {destino && (
                  <p className="text-sm text-ink/70">
                    Zona: {destino.nombre} ({destino.tiempo_aprox})
                  </p>
                )}
                <p className="text-sm font-semibold text-bosque">
                  Desde {formatCOP(p.precio)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <WhatsAppButton phone={p.whatsapp} message={msg} label="Chatear por WhatsApp" />                  <a
                    href={`tel:${p.telefono.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified"
                  >
                    Llamar {p.telefono}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
