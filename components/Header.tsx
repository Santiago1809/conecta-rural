"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/oferta", label: "Explora" },
    { href: "/prestadores", label: "Prestadores" },
    { href: "/plan", label: "Mi itinerario" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-inputborder/60 bg-[#F2F6E2] backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Mi Ruta · inicio"
        >
          <Image
            src="/logo.jpeg"
            alt="Mi Ruta · Antioquia auténtica"
            width={360}
            height={126}
            priority
            className="h-16 w-auto sm:h-20"
          />
        </Link>
        <nav
          aria-label="Principal"
          className="flex items-center gap-1 sm:gap-2"
        >
          <Link
            href="/hubs"
            className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-soft hover:text-bosque"
          >
            Hubs sostenibles
          </Link>
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
