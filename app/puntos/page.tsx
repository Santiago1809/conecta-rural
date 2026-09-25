import Link from "next/link";
import { auth } from "@/auth";
import RewardsDashboard from "@/components/RewardsDashboard";

export const metadata = { title: "PUNTOS MI RUTA · Mi Ruta" };

export default async function PointsPage() {
  const session = await auth();
  if (!session) return <main className="mx-auto flex max-w-2xl flex-col gap-4 py-10"><h1 className="font-headline text-3xl font-extrabold">PUNTOS MI RUTA</h1><p className="text-ink/70">Inicia sesión para consultar tu saldo y canjear descuentos de alojamientos seleccionados.</p><Link href="/auth/sign-in" className="w-fit rounded-[10px] bg-bosque px-4 py-2.5 font-semibold text-white">Iniciar sesión</Link></main>;
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-8"><header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Recompensas por compartir</p><h1 className="mt-2 font-headline text-3xl font-extrabold">PUNTOS MI RUTA</h1><p className="mt-2 text-ink/70">Comenta sobre destinos, prestadores, experiencias o paquetes y transforma tus recomendaciones en beneficios.</p></header><RewardsDashboard /></main>;
}
