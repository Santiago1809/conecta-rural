"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { DESTINOS } from "@/lib/data";

const AUTOPLAY_MS = 5500;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// The reduced-motion preference is an external store, not local state: it is
// owned by the browser and can change under us. The server snapshot reports
// reduced, so both the server render and the hydration render start with
// autoplay off and the real value is only adopted after hydration.
function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

// Full-width autoplaying hero: the track owns the media, the overlay band owns
// the destination label, the headline and the search field.
export default function HomeHero({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );

  const paused = hovered || focused;

  // `index` is a dependency on purpose: a manual click must restart the timer
  // instead of being swallowed by an interval that is about to fire.
  useEffect(() => {
    if (reduced || paused) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % DESTINOS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [index, reduced, paused]);

  const goTo = useCallback((i: number) => {
    setIndex(((i % DESTINOS.length) + DESTINOS.length) % DESTINOS.length);
  }, []);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);
  const next = useCallback(() => goTo(index + 1), [index, goTo]);

  const destino = DESTINOS[index];

  return (
    <section
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={() => setFocused(false)}
      aria-roledescription="carrusel"
      aria-label="Destinos rurales de Antioquia"
    >
      <div className="relative h-[440px] w-full overflow-hidden sm:h-[500px] lg:h-[560px]">
        <div
          className="flex"
          style={{
            transform: `translateX(-${index * 100}%)`,
            transition: "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {DESTINOS.map((d, i) => (
            <div
              key={d.slug}
              className="relative h-[440px] w-full min-w-full shrink-0 sm:h-[500px] lg:h-[560px]"
            >
              <Image
                src={d.hero}
                alt={d.nombre}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Scrim: bottom-weighted so white text clears AA over any photo. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/15" />

        {/* Dots live top-right, clear of the content band and the arrows. */}
        <div className="absolute right-4 top-24 flex gap-2 sm:right-6">
          {DESTINOS.map((d, i) => (
            <button
              key={d.slug}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60 active:translate-y-[calc(-50%+1px)] sm:left-6"
          aria-label="Anterior"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={next}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur transition-colors hover:bg-black/60 active:translate-y-[calc(-50%+1px)] sm:right-6"
          aria-label="Siguiente"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Content band, bottom-anchored. `relative` lifts it over the scrim. */}
        <div className="absolute inset-x-0 bottom-0">
          <div className="relative grid gap-6 px-4 pb-8 pt-28 sm:px-6 sm:pb-10 lg:grid-cols-2 lg:gap-12 lg:px-10 lg:pb-12">
            <p
              key={destino.slug}
              className="slide-name-in font-headline text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl"
            >
              {destino.municipio}
            </p>

            <div className="flex flex-col gap-3">
              <h1 className="font-headline text-2xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-3xl lg:text-4xl">
                Tu próxima aventura está más cerca de lo que imaginas
              </h1>
              <p className="max-w-xl text-sm text-white/85 sm:text-base">
                Destinos rurales de Antioquia con rutas reales, clima en vivo y
                contacto directo con quienes te reciben.
              </p>
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
