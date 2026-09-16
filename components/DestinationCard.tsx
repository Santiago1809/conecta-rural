import Image from "next/image";
import Link from "next/link";
import { formatCOP, type Destino } from "@/lib/data";
import VerifiedBadge from "./VerifiedBadge";

// 16:9 destination card: place tag + verified badge, title, metadata, COP price.
export default function DestinationCard({ destino }: { destino: Destino }) {
  return (
    <Link
      href={`/destinos/${destino.slug}`}
      className="group overflow-hidden rounded-2xl bg-card shadow-warm transition-transform hover:-translate-y-0.5"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={destino.hero}
          alt={destino.nombre}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
            {destino.municipio} · {destino.vereda}
          </p>
          {destino.verificado && <VerifiedBadge />}
        </div>
        <h3 className="font-headline text-xl font-bold text-ink">
          {destino.nombre}
        </h3>
        <p className="text-sm text-ink/70">
          {destino.tiempo_aprox} · {destino.transporte.length} opciones de
          transporte
        </p>
        <p className="text-sm font-semibold text-bosque">
          Desde {formatCOP(destino.precio_desde)}
        </p>
      </div>
    </Link>
  );
}
