import Link from "next/link";
import DestinationCard from "@/components/DestinationCard";
import SearchBar from "@/components/SearchBar";
import VerifiedBadge from "@/components/VerifiedBadge";
import WhatsAppButton from "@/components/WhatsAppButton";
import MunicipalityCarousel from "@/components/MunicipalityCarousel";
import { DESTINOS, PRESTADORES, formatCOP } from "@/lib/data";

// Bienvenida: hero, search, featured cards, community insights.
export default function Home() {
  const destacados = DESTINOS.slice(0, 5);
  const prestadorDestacado = PRESTADORES[0];
  return (
    <div className="flex flex-col gap-12 py-8">
      {/* Hero: logo + carousel */}
      <section className="overflow-hidden rounded-3xl bg-canvas px-0 py-0 text-ink shadow-warm sm:px-0">
        <div className="flex flex-col items-center gap-6 p-6 sm:p-8">
          <div className="flex w-full justify-center">
            <MunicipalityCarousel />
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <VerifiedBadge label="Turismo comunitario verificado" />
            <h1 className="font-headline text-2xl font-extrabold leading-tight sm:text-4xl">
              Tu próxima aventura está más cerca de lo que imaginas
            </h1>
            <p className="text-base text-ink/70 sm:text-lg">
              Destinos rurales de Antioquia con rutas reales, clima en vivo y
              contacto directo con quienes te reciben.
            </p>
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Featured destinations */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <h2 className="font-headline text-2xl font-bold">
            Destinos destacados
          </h2>
          <Link
            href="/oferta"
            className="text-sm font-semibold text-terracota underline"
          >
            Ver toda la oferta
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destacados.map((d) => (
            <DestinationCard key={d.slug} destino={d} />
          ))}
        </div>
      </section>

      {/* Prestador destacado */}
      {prestadorDestacado && (
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="font-headline text-2xl font-bold">
              Primer prestador destacado
            </h2>
            <Link
              href="/prestadores"
              className="text-sm font-semibold text-terracota underline"
            >
              Ver todos
            </Link>
          </div>
          <article className="overflow-hidden rounded-2xl bg-card shadow-warm">
            <div className="relative aspect-video w-full">
              <img
                src={prestadorDestacado.fotos[0]}
                alt={prestadorDestacado.nombre}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col gap-2 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <VerifiedBadge />
                <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
                  {prestadorDestacado.tipo} · {prestadorDestacado.municipio} ·{" "}
                  {prestadorDestacado.vereda}
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
                  className="inline-flex items-center justify-center rounded-[10px] border border-bosque bg-white px-4 py-2.5 text-sm font-semibold text-bosque transition hover:bg-verified"
                >
                  Llamar
                </a>
              </div>
            </div>
          </article>
        </section>
      )}

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
            [
              "1. Elige tu destino",
              "Compara tiempos de viaje, clima y transporte por la región.",
            ],
            [
              "2. Conecta directo",
              "Escríbele por WhatsApp al prestador verificado, sin intermediarios.",
            ],
            [
              "3. Arma tu plan",
              "Guarda fechas y transporte, comparte tu itinerario e imprímelo.",
            ],
          ].map(([title, desc]) => (
            <li key={title} className="rounded-2xl bg-card p-5 shadow-warm">
              <p className="font-headline text-base font-bold text-bosque">
                {title}
              </p>
              <p className="mt-1 text-sm text-ink/70">{desc}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
