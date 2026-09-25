"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import HeaderAccount from "@/components/HeaderAccount";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/hubs", label: "Hubs sostenibles" },
  { href: "/oferta", label: "Explora" },
  { href: "/prestadores", label: "Prestadores" },
  { href: "/plan", label: "Mi itinerario" },
  { href: "/puntos", label: "Puntos" },
];

// "/" has to match by equality: a prefix test against "/" is true for every
// route in the app, so "Inicio" would be the active link everywhere.
function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// One rule, two presentations: a row from md up, a full-width panel below it.
function linkClass(active: boolean, panel: boolean) {
  return [
    "rounded-[10px] font-medium whitespace-nowrap transition-colors",
    panel ? "px-3 py-3 text-base" : "px-3 py-2 text-sm",
    active ? "text-bosque bg-verified" : "text-ink/70 hover:bg-soft hover:text-bosque",
  ].join(" ");
}

export default function Header() {
  const pathname = usePathname();
  // The panel is open only while the route it was opened on is still current, so
  // navigating away closes it. Derived during render rather than synced in a
  // useEffect: the compiler lint rule react-hooks/set-state-in-effect rejects a
  // setState in an effect body, and this is also one render and one less branch.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  return (
    <header className="sticky top-0 z-50 border-b border-inputborder/60 bg-header backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 sm:px-6 md:h-[72px]">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Mi Ruta · inicio">
          <Image
            src="/logo.jpeg"
            alt="Mi Ruta · Antioquia auténtica"
            width={360}
            height={126}
            priority
            className="h-[2.8rem] w-auto md:h-[3.85rem]"
          />
        </Link>
        {/* Desktop nav starts at lg, not md: six links plus a 176px logo need
            about 894px, and the 768px content box is only 720px. Below lg the
            hamburger carries the links instead of a two-line nav. */}
        <nav aria-label="Principal" className="ml-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href, pathname) ? "page" : undefined}
              className={linkClass(isActive(l.href, pathname), false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        {/* No icon library is installed, so the affordance is three bars. */}
        <button
          type="button"
          onClick={() => setOpenedOn(open ? null : pathname)}
          aria-expanded={open}
          aria-controls="menu-principal"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="ml-auto rounded-[10px] p-2 text-ink/80 transition-colors hover:bg-soft active:translate-y-[1px] lg:hidden"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-px w-5 bg-current" aria-hidden />
            <span className="block h-px w-5 bg-current" aria-hidden />
            <span className="block h-px w-5 bg-current" aria-hidden />
          </span>
        </button>
        {/* Exactly one instance at every breakpoint: a second copy would mount a
            second useSessionUser, and with it a second /api/auth/session fetch. */}
        <HeaderAccount />
      </div>
      {open && (
        <div className="border-b border-inputborder/60 bg-header lg:hidden">
          <nav
            id="menu-principal"
            aria-label="Principal"
            className="mx-auto flex w-full max-w-7xl flex-col px-4 py-2 sm:px-6"
          >
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href, pathname) ? "page" : undefined}
                className={linkClass(isActive(l.href, pathname), true)}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
