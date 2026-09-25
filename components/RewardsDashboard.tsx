"use client";

import { useEffect, useState } from "react";

type Reward = { id: string; nombre: string; porcentaje: number; pointsCost: number; redeemed: boolean };

export default function RewardsDashboard() {
  const [balance, setBalance] = useState(0);
  const [discounts, setDiscounts] = useState<Reward[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  function load() {
    return fetch("/api/rewards")
      .then((response) => response.json().then((data: { balance?: number; discounts?: Reward[]; error?: string }) => ({ response, data })))
      .then(({ response, data }) => {
        if (!response.ok) { setMessage(data.error ?? "No pudimos cargar tus puntos."); setLoading(false); return; }
        setBalance(data.balance ?? 0);
        setDiscounts(data.discounts ?? []);
        setMessage("");
        setLoading(false);
      });
  }

  useEffect(() => {
    let active = true;
    fetch("/api/rewards")
      .then((response) => response.json().then((data: { balance?: number; discounts?: Reward[]; error?: string }) => ({ response, data })))
      .then(({ response, data }) => {
        if (!active) return;
        if (!response.ok) { setMessage(data.error ?? "No pudimos cargar tus puntos."); setLoading(false); return; }
        setBalance(data.balance ?? 0);
        setDiscounts(data.discounts ?? []);
        setMessage("");
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function redeem(discountId: string) {
    const response = await fetch("/api/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ discountId }) });
    const data = await response.json() as { error?: string };
    setMessage(data.error ?? "Descuento canjeado. Muéstralo al reservar.");
    if (response.ok) await load();
  }

  return <div className="flex flex-col gap-6"><section className="rounded-2xl bg-bosque p-6 text-white shadow-warm"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">PUNTOS MI RUTA</p>{loading ? <span aria-hidden className="mt-2 block h-12 w-24 animate-pulse rounded-[10px] bg-soft" /> : <p className="mt-2 font-headline text-5xl font-extrabold">{balance}</p>}<p className="mt-1 text-sm text-white/75">25 puntos por cada comentario publicado y 15 por cada me gusta que reciba.</p></section><section className="flex flex-col gap-4"><div><h2 className="font-headline text-2xl font-bold">Descuentos disponibles</h2><p className="mt-1 text-sm text-ink/70">Mantenemos pocos cupos para cuidar el equilibrio entre viajeros y alojamientos.</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-3">{loading ? [0, 1, 2].map((slot) => <article key={slot} aria-hidden className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-warm"><span className="h-3 w-20 animate-pulse rounded-[10px] bg-soft" /><span className="h-5 w-32 animate-pulse rounded-[10px] bg-soft" /><span className="h-4 w-24 animate-pulse rounded-[10px] bg-soft" /><span className="mt-auto h-10 w-full animate-pulse rounded-[10px] bg-soft" /></article>) : discounts.map((discount) => <article key={discount.id} className="flex flex-col gap-3 rounded-2xl bg-card p-5 shadow-warm"><p className="text-xs font-semibold uppercase tracking-wide text-terracota">{discount.porcentaje}% de descuento</p><h3 className="font-headline text-lg font-bold">{discount.nombre}</h3><p className="text-sm text-ink/70">Canjea por {discount.pointsCost} puntos.</p><button type="button" disabled={discount.redeemed || balance < discount.pointsCost} onClick={() => redeem(discount.id)} className="mt-auto rounded-[10px] bg-terracota px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{discount.redeemed ? "Ya canjeado" : balance < discount.pointsCost ? "Faltan puntos" : "Canjear descuento"}</button></article>)}</div></section>{message && <p role="status" className="text-sm text-ink/70">{message}</p>}</div>;
}
