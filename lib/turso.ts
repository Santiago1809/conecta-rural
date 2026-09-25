import { createClient, type Client } from "@libsql/client";

let client: Client | undefined;

export function getTurso(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error("Turso no está configurado. Define TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.");
  }
  client ??= createClient({ url, authToken });
  return client;
}

export function isTursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}
