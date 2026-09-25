"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  alojamientoSlug,
  ALOJAMIENTOS,
  DESTINOS,
  experienciaSlug,
  EXPERIENCIAS,
  formatCOP,
} from "@/lib/data";
import { addCustomPlanItem } from "@/lib/plan";
import { showToast } from "@/lib/toast";

// Explora: filterable grid of experiencias + alojamientos + gastronomía.
export default function OfertaPage() {
  const [categoria, setCategoria] = useState("Todas");
  const [destino, setDestino] = useState("todos");
  const [query, setQuery] = useState("");
  const [savedItemId, setSavedItemId] = useState<string | null>(null);

  const categorias = useMemo(
    () => ["Todas", ...Array.from(new Set(EXPERIENCIAS.map((e) => e.categoria)))],
    [],
  );

  const experiencias = EXPERIENCIAS.filter(
    (e) =>
      (categoria === "Todas" || e.categoria === categoria) &&
      (destino === "todos" || e.destino_slug === destino) &&
      (query === "" ||
        `${e.nombre} ${e.descripcion}`.toLowerCase().includes(query.toLowerCase())),
  );

  const alojamientos = ALOJAMIENTOS.filter(
    (a) =>
      (destino === "todos" || a.destino_slug === destino) &&
      (query === "" ||
        `${a.nombre} ${a.descripcion}`.toLowerCase().includes(query.toLowerCase())),
  );

  const inputCls =
    "rounded-[10px] border border-inputborder bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-bosque focus:ring-2 focus:ring-bosque/20";

  const saveCustomItem = (item: Parameters<typeof addCustomPlanItem>[0]) => {
    addCustomPlanItem(item);
    setSavedItemId(item.id);
    showToast(`${item.name} se añadió a tu itinerario.`);
  };

  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-headline text-3xl font-extrabold">Explora la oferta</h1>
        <p className="text-ink/70">
          Experiencias, alojamientos y gastronomía de prestadores verificados por la comunidad.
        </p>
      </header>

      {/* Filters */}
      <div className="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-warm sm:flex-row">
        <input
          type="search"
          placeholder="Buscar (café, tubing, silletero…)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={`${inputCls} flex-1`}
        />
        <select value={destino} onChange={(e) => setDestino(e.target.value)} className={inputCls}>
          <option value="todos">Todos los destinos</option>
          {DESTINOS.map((d) => (
            <option key={d.slug} value={d.slug}>{d.nombre}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-2">
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategoria(c)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                categoria === c ? "bg-bosque text-white" : "bg-soft text-ink hover:bg-verified"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Experiencias */}
      <section className="flex flex-col gap-4">
        <h2 className="font-headline text-2xl font-bold">
          Experiencias ({experiencias.length})
        </h2>
        {experiencias.length === 0 && (
          <p className="text-sm text-ink/60">Sin resultados: prueba con otros filtros.</p>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {experiencias.map((e) => (
            <article key={e.nombre} className="overflow-hidden rounded-2xl bg-card shadow-warm">
              <div className="relative aspect-video w-full">
                <Image src={e.foto} alt={e.nombre} fill sizes="(max-width: 1024px) 50vw, 33vw" className="object-cover" />
              </div>
              <div className="flex flex-col gap-2 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-terracota">{e.categoria}</p>
                <Link href={`/experiencias/${experienciaSlug(e)}`} className="font-headline text-lg font-bold hover:text-terracota">
                  {e.nombre}
                </Link>
                <p className="text-sm text-ink/70">{e.descripcion}</p>
                <p className="text-sm font-semibold text-bosque">{formatCOP(e.precio)}</p>
                <button
                  type="button"
                  onClick={() => saveCustomItem({
                    kind: "experience",
                    id: `experience:${e.destino_slug}:${e.nombre}`,
                    name: e.nombre,
                    destination: DESTINOS.find((d) => d.slug === e.destino_slug)?.nombre ?? e.destino_slug,
                    destinationSlug: e.destino_slug,
                    description: e.descripcion,
                    price: e.precio,
                    image: e.foto,
                  })}
                  className="mt-2 rounded-[10px] border border-bosque px-4 py-2 text-sm font-semibold text-bosque transition hover:bg-verified"
                >
                  {savedItemId === `experience:${e.destino_slug}:${e.nombre}` ? "Agregado al itinerario" : "Agregar al itinerario"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Alojamientos */}
      <section className="flex flex-col gap-4">
        <h2 className="font-headline text-2xl font-bold">
          Alojamientos ({alojamientos.length})
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {alojamientos.map((a) => (
            <article key={a.nombre} className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-warm sm:flex-row">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl sm:w-48 sm:shrink-0">
                <Image src={a.foto} alt={a.nombre} fill sizes="300px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
                  {a.municipio} · {a.vereda}
                </p>
                <Link href={`/alojamientos/${alojamientoSlug(a)}`} className="font-headline text-lg font-bold hover:text-terracota">
                  {a.nombre}
                </Link>
                <p className="text-sm text-ink/70">{a.descripcion}</p>
                <p className="text-sm font-semibold text-bosque">{formatCOP(a.precio)} / noche</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => saveCustomItem({
                      kind: "lodging",
                      id: `lodging:${a.destino_slug}:${a.nombre}`,
                      name: a.nombre,
                      destination: a.municipio,
                      destinationSlug: a.destino_slug,
                      description: a.descripcion,
                      price: a.precio,
                      image: a.foto,
                    })}
                    className="rounded-[10px] border border-bosque px-4 py-2 text-sm font-semibold text-bosque transition hover:bg-verified"
                  >
                    {savedItemId === `lodging:${a.destino_slug}:${a.nombre}` ? "Agregado al itinerario" : "Agregar al itinerario"}
                  </button>
                  <WhatsAppButton
                    phone={a.whatsapp}
                    message={`Hola, quiero reservar alojamiento en ${a.nombre} (${a.municipio}).`}
                    label="Reservar"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
