# Mi Ruta

## Auth, comentarios y PUNTOS MI RUTA

El sistema de comentarios y recompensas usa Auth.js con sesiones JWT y Turso/libSQL.

Configura estas variables en `.env.local` usando `.env.example` como referencia:

```env
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
AUTH_SECRET=replace-with-a-long-random-secret
```

Las tablas se crean automáticamente en la primera operación de registro, comentario o recompensas. También está disponible el esquema completo en `db/schema.sql`.

Cada comentario publicado suma 25 PUNTOS MI RUTA, y cada "me gusta" que recibe ese comentario suma 15 más a quien lo escribió (quitar el me gusta los descuenta). El saldo se guarda en un ledger y los descuentos de alojamiento se pueden canjear una sola vez por usuario; el catálogo inicial está limitado a tres alojamientos y sus costos se rebalancearon dos veces, un 50 % cada vez (100 → 150 y luego 150 → 300; 75 → 113 y luego 113 → 226), mediante una migración idempotente que también corrige bases ya sembradas.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
