import Link from "next/link";
import { auth } from "@/auth";

export const metadata = { title: "Mi perfil · Mi Ruta" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col gap-4 py-10">
        <h1 className="font-headline text-3xl font-extrabold">Mi perfil</h1>
        <p className="text-ink/70">Inicia sesión para consultar tu perfil y tus PUNTOS MI RUTA.</p>
        <Link href="/auth/sign-in" className="w-fit rounded-[10px] bg-bosque px-4 py-2.5 font-semibold text-white">Iniciar sesión</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Tu cuenta</p>
        <h1 className="mt-2 font-headline text-3xl font-extrabold">Mi perfil</h1>
      </header>
      <section className="flex flex-col gap-3 rounded-2xl bg-card p-6 shadow-warm">
        <p className="text-sm text-ink/60">Nombre</p>
        <p className="font-semibold text-bosque">{session.user.name}</p>
        <p className="mt-2 text-sm text-ink/60">Correo</p>
        <p className="font-semibold text-bosque">{session.user.email}</p>
      </section>
      <Link href="/puntos" className="w-fit rounded-[10px] bg-terracota px-4 py-2.5 font-semibold text-white">Ver PUNTOS MI RUTA</Link>
    </main>
  );
}
