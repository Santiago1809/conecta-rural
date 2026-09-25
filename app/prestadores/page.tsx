"use client";

import Image from "next/image";
import { useState } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import { PRESTADORES, formatCOP, getDestino, slugify } from "@/lib/data";
import RntBadge from "./RntBadge";
import CommentsSection from "@/components/CommentsSection";

// Mi Ruta: provider cards with direct wa.me chat + tel: fallback + RNT badge.
export default function PrestadoresPage() {
  // One page-level state keyed by provider name, so only one thread is ever open
  // and only one CommentsSection is mounted (and fetching) at a time.
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-extrabold">Conéctate con prestadores</h1>
        <p className="max-w-2xl text-ink/70">
          Habla directo por WhatsApp con guías, fincas y operadores verificados.
          Si no tienes datos, usa la llamada telefónica.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {PRESTADORES.map((p) => {
          const destino = getDestino(p.destino_slug);
          const msg = `Hola ${p.nombre}, quiero información sobre ${p.tipo.toLowerCase()} en ${p.municipio}.`;
          // slugify, not the raw name: aria-controls is an IDREF list, so a space
          // inside the id would be read as two references.
          const comentariosId = `comentarios-${slugify(p.nombre)}`;
          const comentariosAbiertos = open === p.nombre;
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
                <p className="text-xs font-semibold uppercase tracking-wide text-terracota-hover">
                  <span className="block">{p.tipo}</span>
                  <span className="block">
                    {p.vereda}, {p.municipio}
                  </span>
                </p>
                <h2 className="font-headline text-xl font-bold">{p.nombre}</h2>
                {destino && (
                  <p className="text-sm text-ink/70">Tiempo de viaje: {destino.tiempo_aprox}</p>
                )}
                <p className="text-base font-semibold text-bosque">
                  Desde {formatCOP(p.precio)}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <WhatsAppButton phone={p.whatsapp} message={msg} label="Chatear por WhatsApp" />
                  <a
                    href={`tel:${p.telefono.replace(/\s/g, "")}`}
                    className="inline-flex items-center justify-center rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified active:translate-y-[1px]"
                  >
                    Llamar
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(comentariosAbiertos ? null : p.nombre)}
                  aria-expanded={comentariosAbiertos}
                  aria-controls={comentariosId}
                  className="mt-2 rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified active:translate-y-[1px]"
                >
                  {comentariosAbiertos ? "Ocultar comentarios" : "Ver comentarios"}
                </button>
                {comentariosAbiertos && (
                  <div id={comentariosId}>
                    <CommentsSection
                      resourceType="provider"
                      resourceId={p.nombre}
                      variant="embedded"
                    />
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
