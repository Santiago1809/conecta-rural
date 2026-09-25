import Link from "next/link";
import { DESTINOS } from "@/lib/data";
import HubsMapClient from "@/components/HubsMapClient";

export const metadata = {
  title: "Hubs sostenibles · Mi Ruta",
};

export default function HubsPage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Conexiones del territorio</p>
        <h1 className="mt-2 font-headline text-3xl font-extrabold sm:text-4xl">Hubs sostenibles</h1>
        <p className="mt-3 text-lg text-ink/70">Una red de municipios conectados por experiencias, transporte local y anfitriones que cuidan el paisaje.</p>
      </header>
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <HubsMapClient />
        <aside className="flex flex-col gap-4 rounded-2xl bg-card p-6 shadow-warm">
          <h2 className="font-headline text-xl font-bold">Municipios conectados</h2>
          <p className="text-sm text-ink/70">Explora la red de destinos disponibles en Mi Ruta y elige dónde quieres empezar.</p>
          <ul className="flex flex-col divide-y divide-inputborder/60">
            {DESTINOS.map((destino) => (
              <li key={destino.slug} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/destinos/${destino.slug}`} className="font-semibold text-bosque hover:text-terracota">
                  {destino.municipio}
                </Link>
                <p className="text-sm text-ink/60">{destino.tiempo_aprox} · {destino.vereda}</p>
              </li>
            ))}
          </ul>
        </aside>
      </section>
    </div>
  );
}