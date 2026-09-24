"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/oferta", label: "Explora" },
    { href: "/prestadores", label: "Prestadores" },
    { href: "/plan", label: "Mi plan" },
  ];

  const movilidadOptions = [
    {
      title: "Jeeps Willys \"Híbridos o Compartidos\"",
      desc: "El Willys es el alma de la zona cafetera. Sistema de rutas compartidas y horarios fijos para el uso de los mismos.",
    },
    {
      title: "Cablevías Turísticas de Carga y Pasajeros",
      desc: "Inspirado en los garruchas cafeteras (cables artesanales usados para mover el café). Son líneas de cable a pequeña escala para subir equipaje o personas con movilidad reducida hasta las fincas más empinadas, reduciendo la necesidad de abrir nuevas carreteras.",
    },
    {
      title: "Red de Bicicletas Eléctricas",
      desc: "Las bicicletas eléctricas son la mejor solución para las pendientes de montaña. Por medio de rutas diseñadas para conectar fincas independientes.",
    },
    {
      title: "Senderos de Herradura Reconvertidos",
      desc: "Antiguos caminos de arriería transformados en senderos peatonales o de ciclomontañismo. Se conectan puntos de interés como cascadas, miradores de avistamiento de aves y cafetales.",
    },
    {
      title: "Parqueaderos Obligatorios",
      desc: "Para que disfrutes de tu viaje es necesario que hagas uso de nuestros parqueaderos obligatorios a la entrada de la zona de montaña o del pueblo.",
    },
    {
      title: "Tarifa Integrada",
      desc: "Un solo código digital te permitirá hacer uso de nuestros medios alternativos de transporte local.",
    },
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-soft hover:text-bosque"
              aria-expanded={menuOpen}
            >
              Red de Movilidad Sostenible
            </button>
            {menuOpen && (
              <div className="absolute left-0 top-full mt-1 w-80 origin-top-left rounded-xl bg-[#F2F6E2] border border-inputborder/60 shadow-warm focus:outline-none">
                {movilidadOptions.map((opt, i) => (
                  <a
                    key={i}
                    href="#"
                    className="block px-4 py-3 hover:bg-soft hover:text-bosque transition-colors first:rounded-t-xl last:rounded-b-xl"
                    onClick={(e) => e.preventDefault()}
                  >
                    <p className="text-sm font-semibold text-ink">{opt.title}</p>
                    <p className="mt-1 text-xs text-ink/70 leading-relaxed">{opt.desc}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
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
