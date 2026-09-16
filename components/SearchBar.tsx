"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DESTINOS } from "@/lib/data";

// Home search: destination + date, then jump to the destino page.
export default function SearchBar() {
  const router = useRouter();
  const [slug, setSlug] = useState(DESTINOS[0]?.slug ?? "");
  const [fecha, setFecha] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qs = fecha ? `?fecha=${encodeURIComponent(fecha)}` : "";
    router.push(`/destinos/${slug}${qs}`);
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
        <select value={slug} onChange={(e) => setSlug(e.target.value)} className={inputCls}>
          {DESTINOS.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.nombre} · {d.municipio}
            </option>
          ))}
        </select>
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
        className="rounded-[10px] bg-terracota px-6 py-2.5 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-terracota-hover"
      >
        Buscar
      </button>
    </form>
  );
}
