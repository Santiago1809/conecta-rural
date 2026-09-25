"use server";

import { signIn } from "@/auth";
import { createUser } from "@/lib/db";

export type AuthFormState = { error?: string };

export async function registerUser(_state: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (name.length < 2) return { error: "Escribe tu nombre." };
  if (!/^\S+@\S+\.\S+$/.test(email)) return { error: "Escribe un correo válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };
  try {
    await createUser(name, email, password);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No pudimos crear tu cuenta." };
  }
  await signIn("credentials", { email, password, redirectTo: "/puntos" });
  return {};
}
