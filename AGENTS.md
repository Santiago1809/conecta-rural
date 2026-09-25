<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Stack and commands

Next.js 16.3.5 (App Router), React 19, Tailwind v4, Auth.js v5 beta, Turso/libSQL, Leaflet, SWR. Bun is the package manager (`packageManager: bun@1.4.2`).

- `bun run dev` / `bun run build` / `bun run start`
- `bun run lint` — currently reports 1 pre-existing warning (`app/page.tsx:74`, `<img>` vs `next/image`). Not yours; don't chase it.
- `bunx tsc --noEmit` — **there is no `typecheck` script.** This is the typecheck.

There are **no tests and no CI**. Don't invent a `test` script, a test runner, or a `__tests__` folder. Verification is `bunx tsc --noEmit` + `bun run lint` + the affected page in `bun run dev`.

Single `main` branch, remote `github.com/Santiago1809/conecta-rural`, no PR/CI automation configured.

## Naming trap

Four different names coexist. They are intentional — do not "normalize" them:

| Thing | Name |
| --- | --- |
| package / repo dir | `conecta_rural` |
| user-facing brand | **Mi Ruta** |
| localStorage plan key | `conecta_rural_plan` |
| canonical domain | `mi-ruta-antioquia.vercel.app` |

## Language

Every user-facing string is Spanish — UI copy, validation messages, thrown `Error` messages, `data/*.json` field values, and the `lang="es"` / `es-CO` locale. Keep new copy in Spanish. Only identifiers and code comments are English.

## Environment

Live keys live in `.env` (gitignored via the `.env*` pattern). `README.md` tells you to use `.env.example` as a reference — **that file does not exist.**

- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `AUTH_SECRET` — required for auth, comments, and points.
- `RNT_DATASET_ID` — optional, defaults to `gt2j-8ykr` (`lib/env.ts`).

Everything else is keyless. `lib/env.ts` states the rule: "No secrets: every live source works without a key."

## Architecture

Static content, no CMS and no ORM:

- `data/{destinos,prestadores,experiencias,alojamientos}.json` are the source of truth for all content (4 / 6 / 10 / 6 entries). `lib/data.ts` holds the TS interfaces and typed accessors; always import `DESTINOS`, `PRESTADORES`, `ALOJAMIENTOS` from there rather than reaching into the JSON.
- JSON fields are `snake_case` (`tiempo_aprox`, `precio_desde`, `hero_credit`, `codigo_rnt`); TypeScript interfaces mirror that. Content is Colombia/Antioquia-specific — Colombian phone numbers are `57` + 10 digits, prices are COP.
- Travel-plan state is **client-only localStorage** via `lib/plan.ts`. Guard with the `isBrowser()` check it already provides; a plan is never on the server.
- `app/layout.tsx` is the only place fonts are defined (`--font-headline` = Plus Jakarta Sans, `--font-body` = Inter). Tailwind v4 has **no `tailwind.config.js`** — theme tokens live in the `@theme` block in `app/globals.css` (`bg-canvas`, `text-ink`, `text-bosque`, `text-terracota`, `shadow-warm`, `border-inputborder`). The `/* Tierra Viva palette */` comment there is stale naming, not a second brand.

### Auth

`auth.ts` sits at the **repo root**, not in `lib/`. It exports `{ handlers, auth, signIn, signOut }`. JWT sessions, credentials-only provider, bcrypt (cost 12), custom sign-in page at `/auth/sign-in`. Server actions live in `app/actions/auth.ts` and use the `useActionState`-shaped `(state, formData)` signature from `AuthFormState`. `types/next-auth.d.ts` augments the session with `user.id` — every server route reads `session.user.id`, which only exists because of the `jwt`/`session` callbacks in `auth.ts`.

### Database

`lib/db.ts` owns schema. Two things that will bite you:

1. **There are no migration files.** `ensureDatabase()` runs `CREATE TABLE IF NOT EXISTS` plus a hand-rolled table-rebuild migration in `migrateCommentsTable()` on nearly every call. `db/schema.sql` is a **reference copy only — nothing executes it.** Change a schema, and you must change both `lib/db.ts` and `db/schema.sql`.
2. **`getTurso()` requires `TURSO_AUTH_TOKEN` to be set**, so a local `file:` SQLite URL still throws. There is no local-DB escape hatch.

Points economy: `COMMENT_POINTS = 25` (`lib/db.ts:6`) is hardcoded and the README restates it — change both. Balance is a ledger (`point_transactions`), never a mutable column. The discount catalog is seeded with `INSERT OR IGNORE` from the first 3 `ALOJAMIENTOS`, and `redemptions` has `UNIQUE(user_id, discount_id)`, so a discount is redeemable once per user by design.

### External APIs

All three are server-side, keyless, and fail soft — every `/api/*` route returns a `fallback` flag rather than throwing, so pages keep rendering offline.

- `app/api/route` → OSRM, with a haversine ×1.35 @ 38 km/h fallback in `lib/osrm.ts`
- `app/api/weather` → Open-Meteo (`lib/meteo.ts`, Spanish WMO labels)
- `app/api/rnt` → datos.gov.co Socrata, **hardcoded to `departamento='ANTIOQUIA'`**

### Maps

Leaflet cannot render on the server. Follow the existing pattern: a thin `"use client"` wrapper that does `dynamic(() => import("...Map"), { ssr: false })` — see `components/HubsMapClient.tsx` and `app/destinos/[slug]/DestinoDetail.tsx`. `leaflet/dist/leaflet.css` is imported inside the map component, and `app/globals.css` carries a z-index fix keeping map panes below the sticky header. Keep both.

## Gotchas

- **Comment `resourceId` is not uniform.** Mount sites use different keys: destinos → `slug`, packages → `slug`, `provider` → **`p.nombre`** (`app/prestadores/page.tsx:59`), and `CustomResourceDetail` → a computed id. Renaming a provider in `data/prestadores.json` silently orphans its existing comments. The API's `resourceType` allowlist (`destination | provider | package | experience | lodging`) is duplicated in `lib/db.ts` and `app/api/comments/route.ts` — keep both in sync.
- `next.config.ts` has an `images.remotePatterns` **allowlist** (Pexels, Unsplash, Google Maps, gstatic). A new remote image host fails at runtime until you add it there.
- `lib/toast.ts` uses a `window` CustomEvent bus (`mi-ruta:toast`) with `ToastViewport` mounted in the root layout — the only sanctioned way to surface a transient message.
- Exported but currently unused: `isTursoConfigured()` (`lib/turso.ts`) and `isDemoNumber()` (`lib/whatsapp.ts`). The `demo` field exists in the `Prestador`/`Alojamiento` types but no data row sets it. Don't treat these as evidence of a live feature.

## Other instruction sources

- `CLAUDE.md` is just `@AGENTS.md` — keep them in sync via that reference.
- `.atl/skill-registry.md` is an auto-generated, **delegator-only** index. When spawning subagents, match the task against its `Trigger / description` column and pass the exact `Path` values under `## Skills to load before work`. Do not summarize its contents. Regenerate with `gentle-ai skill-registry refresh --force`.
