# Comments session gating + points loading

## Objective

Two UI defects reported by the maintainer:

1. The "Iniciar sesión" banner in the comments box shows even when the visitor **is** signed in.
2. The points section (`/puntos`) has no real loading state.

## Problem

**1. `components/CommentsSection.tsx:50`.** The sign-in link lives inside `{message && (...)}`, so it renders for *any* message — including the success text `Comentario publicado. Ganaste 25 PUNTOS MI RUTA.`. The link must be gated on real session state, not on message presence.

**2. `components/RewardsDashboard.tsx`.** `loading` is modeled as a magic initial `message` string (`"Cargando tus puntos…"`). Consequences: the balance card renders a hard `0` immediately, and the discount grid renders empty — both read as "broken" rather than "loading". There is no skeleton.

## Why

The repo has no `SessionProvider` by design. `components/HeaderAccount.tsx` already answers "am I signed in?" by fetching `/api/auth/session` in a `useEffect`, tracking `user` + `loaded`, and rendering an `animate-pulse` placeholder while pending. That is the established pattern to follow, not to invent a second one.

## Scope

Authorized:

- Extract the `HeaderAccount` session fetch into one shared client hook.
- Use it to gate the comments sign-in link on real session state.
- Give the points section a real loading state with skeleton placeholders.
- Switch `HeaderAccount` to the shared hook so there is one implementation.

Out of scope: adding `SessionProvider`, changing auth callbacks, changing API routes, touching `data/*.json`.

## Tasks

- [x] **T1** Extract `useSessionUser()` into `lib/session-client.ts` (client hook: `/api/auth/session` fetch, `user`, `loaded`). Delete the inline duplicate in `HeaderAccount.tsx` and consume the hook instead.
- [x] **T2** `CommentsSection.tsx`: consume `useSessionUser()`; render the action link per message context — see below. (Revised 2026-09-25 at maintainer request.)
- [ ] **T2b** Success message links to `/puntos` (`Ver mis puntos`), not `/auth/sign-in`. Rationale: reaching the success state already required an active session, so a sign-in prompt there is nonsense — the useful next action is seeing the balance. The 401 `Inicia sesión para comentar.` case keeps the `Iniciar sesión` link, since that is the only case where it is actionable. All other messages stay plain text.
- [x] **T3** `RewardsDashboard.tsx`: replace the magic initial message with a real `loading` boolean. Render `animate-pulse` skeletons for the balance figure and the discount grid while pending; keep the existing copy and spacing when loaded.

## Constraints

- **All new user-facing copy is Spanish** (`lang="es"`, `es-CO`). Identifiers and comments stay English.
- Match the existing Tailwind v4 theme tokens in `app/globals.css` (`bg-soft`, `bg-card`, `shadow-warm`, `text-ink/60`, `text-terracota`, `text-bosque`, `border-inputborder`). There is no `tailwind.config.js`.
- Reuse the existing `animate-pulse` skeleton idiom from `HeaderAccount.tsx` — do not introduce a new spinner or library.
- Do not add a dependency. No new packages.

## Acceptance criteria

- Signed-in visitor: no "Iniciar sesión" link anywhere in the comments box, including after a successful publish.
- Signed-out visitor: the link appears only alongside the auth error from the API (`Inicia sesión para comentar.`).
- No session fetch and no layout shift: the link area must not flash.
- `/puntos`: skeletons visible while the rewards request is in flight; balance shows real data afterwards; an API error still surfaces as text.
- `bunx tsc --noEmit` clean.
- `bun run lint` reports only the 1 pre-existing warning at `app/page.tsx:74` (`<img>` vs `next/image`) — no new warnings.

## Verification

- `bunx tsc --noEmit` — required.
- `bun run lint` — required.
- `bun run dev` → check a destination page's comment box signed out, then signed in, and `/puntos`.

There is no test suite and no CI in this repo, so the three commands above are the whole gate.

## Notes

- `COMMENT_POINTS = 25` is hardcoded at `lib/db.ts:6`; the "25" copy in both components mirrors it.
- TDD is **not** enabled for this repo (no runner, no test script, no CI). Verification is the commands above.
