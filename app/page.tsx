import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";
import SearchBar from "@/components/SearchBar";
import VerifiedBadge from "@/components/VerifiedBadge";
import { DESTINOS } from "@/lib/data";

// Bienvenida: hero, search, featured cards, community insights.
export default function Home() {
  const destacados = DESTINOS.slice(0, 3);
  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-bosque-deep px-6 py-12 text-white shadow-warm sm:px-12 sm:py-16">
        <div className="flex max-w-2xl flex-col gap-4">
          <VerifiedBadge label="Turismo comunitario verificado" />
          <h1 className="font-headline text-3xl font-extrabold leading-tight sm:text-5xl">
            Descubre lo mejor del campo antes de llegar
          </h1>
          <p className="text-base text-white/80 sm:text-lg">
            Destinos rurales de Antioquia con rutas reales, clima en vivo y
            contacto directo con quienes te reciben.
          </p>
          <SearchBar />
        </div>
      </section>

      {/* Featured destinations */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="font-headline text-2xl font-bold">
            Destinos destacados
          </h2>
          <Link href="/oferta" className="text-sm font-semibold text-terracota underline">
            Ver toda la oferta
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((d) => (
            <DestinationCard key={d.slug} destino={d} />
          ))}
        </div>
      </section>

      {/* Community insights */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-card p-6 shadow-warm">
          <p className="font-headline text-4xl font-extrabold text-bosque">
            58,8 %
          </p>
          <p className="mt-2 text-sm text-ink/70">
            de los viajeros elige su destino rural por recomendación de la
            comunidad local. Por eso cada ficha está verificada por quienes
            viven el territorio.
          </p>
        </div>
        <div className="rounded-2xl bg-card p-6 shadow-warm">
          <p className="font-headline text-4xl font-extrabold text-terracota">
            75,3 %
          </p>
          <p className="mt-2 text-sm text-ink/70">
            de las reservas se cierran por WhatsApp directo con el prestador,
            sin intermediarios ni comisiones escondidas.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="flex flex-col gap-4 rounded-2xl bg-soft p-6 sm:p-8">
        <h2 className="font-headline text-2xl font-bold">¿Cómo funciona?</h2>
        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            ["1. Elige tu destino", "Compara tiempos de viaje, clima y transporte desde Medellín."],
            ["2. Conecta directo", "Escríbele por WhatsApp al prestador verificado, sin intermediarios."],
            ["3. Arma tu plan", "Guarda fechas y transporte, comparte tu itinerario e imprímelo."],
          ].map(([title, desc]) => (
            <li key={title} className="rounded-2xl bg-card p-5 shadow-warm">
              <p className="font-headline text-base font-bold text-bosque">{title}</p>
              <p className="mt-1 text-sm text-ink/70">{desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
