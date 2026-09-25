import { RegisterForm } from "@/components/AuthForm";

export const metadata = { title: "Crear cuenta · Mi Ruta" };

export default function RegisterPage() {
  return <main className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md items-center px-4 py-10"><section className="w-full rounded-2xl bg-card p-6 shadow-warm sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Mi Ruta</p><h1 className="mt-2 font-headline text-3xl font-extrabold">Crea tu cuenta</h1><p className="mt-2 mb-6 text-sm text-ink/70">Cada comentario publicado suma 25 PUNTOS MI RUTA.</p><RegisterForm /></section></main>;
}
