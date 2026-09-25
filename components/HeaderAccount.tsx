"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useSessionUser } from "@/lib/session-client";

export default function HeaderAccount() {
  const { user, loaded } = useSessionUser();

  if (!loaded) {
    return <span className="h-9 w-24 animate-pulse rounded-[10px] bg-soft" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/auth/sign-in"
        className="rounded-[10px] border border-bosque px-3 py-2 text-sm font-semibold text-bosque transition hover:bg-verified"
      >
        Iniciar sesión
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/perfil"
        className="max-w-32 truncate rounded-[10px] border border-inputborder bg-white px-3 py-2 text-sm font-semibold text-bosque transition hover:bg-verified"
        title={user.email ?? user.name ?? "Mi perfil"}
      >
        {user.name ?? "Mi perfil"}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ redirectTo: "/" })}
        className="hidden rounded-[10px] px-3 py-2 text-sm font-semibold text-ink/70 transition hover:bg-soft hover:text-terracota sm:inline-block"
      >
        Salir
      </button>
    </div>
  );
}
