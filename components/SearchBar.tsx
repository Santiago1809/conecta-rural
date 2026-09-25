"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINOS } from "@/lib/data";

// Home search: destination + date, then jump to the destino page.
export default function SearchBar() {
  const router = useRouter();
  const [slug, setSlug] = useState(DESTINOS[0]?.slug ?? "");
  const [query, setQuery] = useState(DESTINOS[0]?.nombre ?? "");
  const [fecha, setFecha] = useState("");
  // The field ships with a default destination, so without this the suggestion
  // list renders on page load and, on a phone, covers the date field.
  const [touched, setTouched] = useState(false);

  const suggestions = DESTINOS.filter((d) =>
    `${d.nombre} ${d.municipio} ${d.vereda}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  ).slice(0, 6);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const selected =
      DESTINOS.find((d) => d.slug === slug) ?? suggestions[0] ?? DESTINOS[0];
    if (!selected) return;
    const qs = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
    router.push(`/destinos/${selected.slug}${qs}`);
  }

  const inputCls =
    "w-full rounded-[10px] border border-inputborder bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-bosque focus:ring-2 focus:ring-bosque/20";

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl bg-white/95 p-3 shadow-warm sm:flex-row"
    >
      <label className="flex-1">
        <span className="sr-only">Destino</span>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSlug("");
              setTouched(true);
            }}
            onFocus={() => setTouched(true)}
            placeholder="Busca un destino o municipio"
            className={inputCls}
            aria-label="Buscar destino o municipio"
            autoComplete="off"
          />
          {touched && query && suggestions.length > 0 && (
            // Opens upward: the hero clips its own overflow, and the field sits
            // in a bottom-anchored band, so a dropdown below would be cut off.
            <div className="absolute bottom-full left-0 right-0 z-20 mb-1 overflow-hidden rounded-xl border border-inputborder bg-white shadow-warm">
              {suggestions.map((d) => (
                <button
                  key={d.slug}
                  type="button"
                  className="block w-full px-4 py-3 text-left text-sm hover:bg-soft"
                  onClick={() => {
                    setSlug(d.slug);
                    setQuery(`${d.nombre} · ${d.municipio}`);
                  }}
                >
                  <span className="font-semibold text-ink">{d.nombre}</span>
                  <span className="ml-2 text-ink/60">{d.municipio}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </label>
      <label className="flex-1">
        <span className="sr-only">Fecha del viaje</span>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className={inputCls}
        />
      </label>
      <button
        type="submit"
        className="rounded-[10px] bg-terracota-hover px-6 py-2.5 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-terracota-deep active:translate-y-[1px]"
      >
        Buscar
      </button>
    </form>
  );
}
