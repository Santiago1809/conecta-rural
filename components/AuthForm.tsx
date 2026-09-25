"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "next-auth/react";
import { registerUser, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function SignInForm() {
  return (
    <form action={async (formData) => {
      await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirectTo: "/puntos",
      });
    }} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">Correo<input name="email" type="email" required className="rounded-[10px] border border-inputborder px-4 py-2.5 font-normal" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Contraseña<input name="password" type="password" required className="rounded-[10px] border border-inputborder px-4 py-2.5 font-normal" /></label>
      <button className="rounded-[10px] bg-bosque px-4 py-2.5 font-semibold text-white">Iniciar sesión</button>
      <p className="text-sm text-ink/70">¿Primera vez? <Link href="/auth/register" className="font-semibold text-terracota">Crea tu cuenta</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerUser, initialState);
  return (
    <form action={action} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-semibold">Nombre<input name="name" required minLength={2} className="rounded-[10px] border border-inputborder px-4 py-2.5 font-normal" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Correo<input name="email" type="email" required className="rounded-[10px] border border-inputborder px-4 py-2.5 font-normal" /></label>
      <label className="flex flex-col gap-1 text-sm font-semibold">Contraseña<input name="password" type="password" required minLength={8} className="rounded-[10px] border border-inputborder px-4 py-2.5 font-normal" /></label>
      {state.error && <p role="alert" className="text-sm font-semibold text-terracota">{state.error}</p>}
      <button disabled={pending} className="rounded-[10px] bg-bosque px-4 py-2.5 font-semibold text-white disabled:opacity-60">{pending ? "Creando…" : "Crear cuenta"}</button>
      <p className="text-sm text-ink/70">¿Ya tienes cuenta? <Link href="/auth/sign-in" className="font-semibold text-terracota">Inicia sesión</Link></p>
    </form>
  );
}
