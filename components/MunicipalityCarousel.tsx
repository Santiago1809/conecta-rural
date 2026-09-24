"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { DESTINOS } from "@/lib/data";

export default function MunicipalityCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex(((i % DESTINOS.length) + DESTINOS.length) % DESTINOS.length),
    []
  );
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);
  const next = useCallback(() => goTo(index + 1), [index, goTo]);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl">
      <div
        className="carousel-track flex"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {DESTINOS.map((d, i) => (
          <div key={d.slug} className="carousel-slide relative h-64 sm:h-80 lg:h-96">
            <Image
              src={d.hero}
              alt={d.nombre}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10">
              <h2 className="font-headline text-2xl font-extrabold text-white sm:text-4xl">
                {d.nombre}
              </h2>
              <p className="mt-1 text-sm text-white/80 sm:text-base">
                {d.municipio} · {d.vereda}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button
        onClick={prev}
        className="carousel-btn absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur sm:left-6"
        aria-label="Anterior"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={next}
        className="carousel-btn absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur sm:right-6"
        aria-label="Siguiente"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {DESTINOS.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2 w-2 rounded-full transition-all ${
              i === index ? "bg-white w-6" : "bg-white/50"
            }`}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
