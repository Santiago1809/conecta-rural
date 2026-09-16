import Image from "next/image";
import Link from "next/link";

// Top navigation with brand mark and section links.
export default function Header() {
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/oferta", label: "Explora" },
    { href: "/prestadores", label: "Prestadores" },
    { href: "/plan", label: "Mi plan" },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-inputborder/60 bg-canvas/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Conecta Rural · inicio">
          <Image
            src="/logo.svg"
            alt="Conecta Rural · Antioquia auténtica"
            width={190}
            height={48}
            priority
            className="h-9 w-auto"
          />
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-soft hover:text-bosque"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/oferta"
            className="ml-1 hidden rounded-[10px] bg-terracota px-4 py-2 text-sm font-semibold text-white shadow-warm transition-colors hover:bg-terracota-hover sm:inline-block"
          >
            Reservar
          </Link>
        </nav>
      </div>
    </header>
  );
}
