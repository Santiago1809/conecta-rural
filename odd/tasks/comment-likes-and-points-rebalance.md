# Comment likes + points rebalance

## Objective

1. Add a like system to comments. **+15 PUNTOS MI RUTA for the comment author per like received.**
2. Raise the points cost of the lodging offers by **50%**.

Follow-up correction to the previous feature: after a successful publish, the comments box linked to `/auth/sign-in`. Reaching that state already required a session, so the action must be `Ver mis puntos` → `/puntos`. That correction is task **T4** here.

## Problem

The points economy only has one earning path (publishing a comment) and no social signal, so engagement past the first comment is unrewarded. Meanwhile the reward catalog is cheap enough to drain in a handful of comments, which devalues the balance.

A real gap the previous feature did not cover: `ensureDatabase()` seeds discounts with `INSERT OR IGNORE`. **Changing the seed numbers alone will not update an already-deployed database** — existing rows keep their old cost. The rebalance needs an explicit, idempotent migration or the deploy silently does nothing.

## Why this design

- **No new `point_transactions` column.** `point_transactions.comment_id` is `UNIQUE` and already claimed by the publish transaction (+25). A like transaction cannot reuse it. Attribution lives in `comment_likes` (who, which comment, when); the ledger row carries only the balance. No migration of the existing table needed.
- **Toggle, not one-way.** Like → `+15` to the author. Unlike → `-15`. Otherwise unliking would leave the ledger permanently inflated and the balance would drift away from reality.
- **No self-likes.** One guard. Without it, likes are a free 15-point loop.
- **The 401 case keeps its sign-in link.** It is the only case where "Iniciar sesión" is actionable. Only the success case changes to `/puntos`.

## Scope

Authorized:

- `comment_likes` table, `LIKE_POINTS = 15`, like/unlike toggle with ledger entries.
- `listComments` returns per-comment `likes` count and `likedByMe`; the GET route stays public.
- `POST /api/comments/[id]/like` toggle endpoint.
- Like button UI in the comments box.
- 50% cost increase on lodging discounts, **with an idempotent migration for existing rows**.
- Copy + `AGENTS.md` + `README.md` updates for the new economy.

Out of scope: `SessionProvider`, auth callbacks, `data/*.json`, any new dependency, refunding already-redeemed discounts.

## Tasks

- [x] **T1** `lib/db.ts` + `db/schema.sql`: add the `comment_likes` table (with `UNIQUE(comment_id, user_id)` and an index) to `schemaStatements` and mirror it in `db/schema.sql`. Add `LIKE_POINTS = 15` next to `COMMENT_POINTS = 25`.
- [x] **T2** `lib/db.ts`: add `toggleCommentLike(userId, commentId)`. Reject self-likes. Write the matching `+15` / `-15` `point_transactions` row to the **comment author's** `user_id` with `reason` in Spanish, `comment_id` left `NULL`. Return the new state.
- [x] **T3** `lib/db.ts`: extend `PublicComment` with `likes: number` and `likedByMe: boolean`; make `listComments` accept an optional `viewerId` and populate both. When `viewerId` is absent, `likedByMe` is `false` and the read must still work unauthenticated.
- [x] **T4** `app/api/comments/route.ts`: pass `session?.user?.id` as `viewerId`. Keep the `resourceType` allowlist and its 10–1000 char validation exactly as they are.
- [x] **T5** New `app/api/comments/[id]/like/route.ts`: `POST` toggles. 401 when signed out, 403 on self-like, 404 when the comment does not exist. Next 16 signature: `context: RouteContext<'/api/comments/[id]/like'>` with `const { id } = await context.params;`.
- [x] **T6** `components/CommentsSection.tsx`: like button per comment with count. Hidden or disabled for the comment author and for signed-out visitors. Optimistic-free — refetch via the existing `loadComments()`. **Also apply the `/puntos` correction:** the success message links to `/puntos` labeled `Ver mis puntos`; the 401 `Inicia sesión para comentar.` case keeps the `/auth/sign-in` link; all other messages stay plain text.
- [x] **T7** `lib/db.ts`: 50% cost increase. Keep the base costs 100 and 75, apply a named `DISCOUNT_COST_MULTIPLIER = 1.5`, round to integer. Add an **idempotent** `migrateDiscountCosts()` next to `migrateCommentsTable()` and call it from `ensureDatabase()`, because `INSERT OR IGNORE` will not update existing rows.
- [x] **T8** Update the copy in `components/CommentsSection.tsx` and `components/RewardsDashboard.tsx` to mention the 15 points per like, and update `README.md` and the `AGENTS.md` points-economy bullet.

## Data decisions

The catalog was repriced **twice**, both at maintainer request. Each rebalance applies to the previous rebalance's *output*, never to the original base.

| Generation | Rule | first (10%) | rest (8%) |
| --- | --- | --- | --- |
| seed | — | 100 | 75 |
| 1st rebalance | `× 1.5` | 150 | 113 (from 112.5, `points_cost` is `INTEGER`) |
| 2nd rebalance | `current / (1 - 0.5)` | **300** | **226** |

The 2nd rebalance is `amount / (1 - %)` as the maintainer specified, so it is applied to the **current** value, not the base: `113 / 0.5 = 226`. Recomputing from the base would give `75 × 3 = 225`, which is **wrong** and drift by 1 per rebalance.

`DISCOUNT_COSTS` in `lib/db.ts` therefore lists the superseded values per entry rather than a base plus a multiplier, so the seed and the migration cannot disagree:

```ts
const DISCOUNT_COSTS = {
  first: { superseded: [100, 150], cost: 300 },
  rest: { superseded: [75, 113], cost: 226 },
} as const;
```

```sql
UPDATE lodging_discounts SET points_cost = 300 WHERE points_cost IN (100, 150);
UPDATE lodging_discounts SET points_cost = 226 WHERE points_cost IN (75, 113);
```

Each statement sets a constant and matches every shipped cost, so a row converges in one call from any past generation and later calls match nothing. Verified against SQLite: base, 1st-generation, final, and mixed seeds all converge to `(300, 226, 226)` in call #1 and stay stable through call #5.

Already-redeemed discounts are historical records. Do not refund or reprice them.

## Constraints

- **All new user-facing copy is Spanish.** Identifiers and code comments English.
- Tailwind v4, no `tailwind.config.js`. Only tokens from the `@theme` block in `app/globals.css`.
- No new dependencies. No test files — this repo has no runner and no CI.
- Mirror every schema change in **both** `lib/db.ts` and `db/schema.sql`. `db/schema.sql` is a reference copy that nothing executes, and `AGENTS.md` records this trap.
- Next 16 has breaking changes. Read `node_modules/next/dist/docs/` if unsure; `params` is a `Promise` in this version.

## Acceptance criteria

- A signed-in visitor can like a comment; the author of that comment gains exactly 15 points, visible in `/puntos`.
- Liking is idempotent per `(comment, user)`: a second like is a no-op, not a second award.
- Unliking removes exactly 15 points.
- The comment author cannot like their own comment, and gets a 403 if they try.
- Signed-out visitors can still read all comments and see like counts; the like control is not usable.
- Every discount shows the new cost (150 and 113) on an already-seeded database, not just on a fresh one.
- After a successful publish, the comments box offers `Ver mis puntos` → `/puntos` and no longer offers "Iniciar sesión".
- A 401 on publish still offers `Iniciar sesión` → `/auth/sign-in`.
- `bunx tsc --noEmit` clean.
- `bun run lint` reports only the 1 pre-existing warning at `app/page.tsx:74`.

## Verification

- `bunx tsc --noEmit` — required.
- `bun run lint` — required.
- `bun run dev` with live Turso keys: publish a comment, like it from a second account, confirm the author's balance rose by 15; un-like and confirm it fell back; check `/puntos` shows 150 and 113.

There is no test suite and no CI in this repo, so those are the whole gate.

## Delivery note

This feature is forecast at roughly 500+ authored changed lines, above the usual ~400 review-budget heuristic. It is **not** being split, for two verifiable reasons: the repo has a single `main` branch with no PR or CI automation configured, so there is no chain to stack onto; and every intermediate slice (likes without the rebalance, or the rebalance without the likes economy) would be a visibly broken or unfair state for real users. Splitting would add ceremony without producing a shippable commit.

## Notes

- `COMMENT_POINTS = 25` lives at `lib/db.ts:6`; `LIKE_POINTS` goes next to it. Both are restated in `README.md` and in the UI copy.
- The 401 string `"Inicia sesión para comentar."` is duplicated across the network boundary (server route + a client const in `CommentsSection`). `AGENTS.md` already flags this class of coupling; keep the client const pointing at `app/api/comments/route.ts` in a comment.
- TDD is **not** enabled for this repo.
