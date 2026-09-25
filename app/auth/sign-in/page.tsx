import { SignInForm } from "@/components/AuthForm";

export const metadata = { title: "Iniciar sesión · Mi Ruta" };

export default function SignInPage() {
  return <AuthShell title="Vuelve a tu ruta"><SignInForm /></AuthShell>;
}

function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return <main className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-md items-center px-4 py-10"><section className="w-full rounded-2xl bg-card p-6 shadow-warm sm:p-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracota">Mi Ruta</p><h1 className="mt-2 font-headline text-3xl font-extrabold">{title}</h1><p className="mt-2 mb-6 text-sm text-ink/70">Comenta, gana puntos y guarda tus beneficios.</p>{children}</section></main>;
}
