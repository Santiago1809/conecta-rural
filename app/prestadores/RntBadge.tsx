"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Live RNT lookup badge: verifies the provider code against datos.gov.co.
export default function RntBadge({ codigo }: { codigo: string }) {
  const { data } = useSWR<{ found?: boolean; fallback?: boolean }>(
    `/api/rnt?codigo=${encodeURIComponent(codigo)}`,
    fetcher,
  );
  if (data?.found) {
    return (
      <span className="inline-flex items-center rounded-full bg-bosque px-2.5 py-1 text-xs font-semibold text-white">
        RNT {codigo} · registro activo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-soft px-2.5 py-1 text-xs font-semibold text-ink/70">
      RNT {codigo}
      {data && !data.found && !data.fallback ? " · sin registro visible" : ""}
    </span>
  );
}
