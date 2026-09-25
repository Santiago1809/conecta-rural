# Home UI redesign (design-taste-frontend)

## Objective
Redesign the visual composition of the homepage (`app/page.tsx` and its four private components) using the `design-taste-frontend` skill, in Redesign-Preserve mode, without adding dependencies, changing routes, changing nav labels, or rewriting brand copy.

## Problem
The homepage is the template-driven default the skill exists to eliminate:
- **Centered hero with a 384px carousel stacked ABOVE the `h1`.** The primary CTA (`SearchBar`) sits below the fold on a phone. Violates Hero-fits-viewport and Anti-Center Bias.
- **Two identical 3-column card grids in a row** (destinos, paquetes) plus a 2-column stat card pair. Violates Section-Layout-Repetition.
- **`grid-cols-3` over 4 items** (`DESTINOS.slice(0, 5)` on a 4-element array) leaves an orphan cell.
- **3 equal feature cards labeled "1. / 2. / 3."** in "¿Cómo funciona?". Both patterns are explicitly banned.
- **Two fake-precise statistics** on a public tourism page: `58,8 %` and `75,3 %`. Not sourced from any real data in the repo.

## Why
Design debt is structural at the composition level, but the brand, IA, and content are sound. Levers 1-5 of the skill's Modernisation Ladders (typography, spacing, color, motion, hero recomposition) recover most of the value at a fraction of the risk of a full redesign.

## Constraints
- **No new dependencies.** No `motion`, no GSAP, no icon library. Motion is CSS transitions plus native `animation-timeline: view()`.
- **Spanish copy is preserved.** Only the fake statistics are replaced, and only with real numbers read from `lib/data.ts`.
- **Brand palette is locked.** `--color-bosque` #1e4b37 (deep green) + `--color-terracota` #c85a32 (the single accent). Terracotta is the ONLY accent across the whole page. Greens read as brand darks, not competing accents.
- **Light theme only, app-wide.** `bg-canvas`. One theme lock; no section inverts. Dark mode is an app-wide concern, out of scope for one page.
- **Routes, slugs, nav labels, form field names untouched.**
- **Out of scope:** `components/Header.tsx` and `components/Footer.tsx` render from the root layout, so they affect all 8+ routes. Not touched. Findings recorded as follow-ups.
- **No tests exist and no test runner is configured.** Do not invent one. Verification is `bunx tsc --noEmit`, `bun run lint`, and the page in `bun run dev`.

## Design read and dials
- Page kind: consumer tourism landing. Audience: Colombian travelers, mobile-first, low bandwidth.
- Redesign - Preserve. Existing dial reading `3 / 3 / 5`. Target `DESIGN_VARIANCE 6`, `MOTION_INTENSITY 4`, `VISUAL_DENSITY 4`.
- Rationale: an experimental Awwwards layout mismatches a phone audience in rural Antioquia, but pure centering is the AI default and needs correcting. 6 = offset and asymmetric, not arty. 4 = motion that ships with zero dependencies and honors `prefers-reduced-motion` by construction.
- Design system: Tailwind v4 with the existing `@theme` block in `app/globals.css`. No new system, no official package needed.

## Authorized scope
`app/page.tsx`, `app/globals.css`, `components/DestinationCard.tsx`, `components/TravelPackages.tsx`, `components/SearchBar.tsx`, `components/MunicipalityCarousel.tsx`. One new file under `odd/tasks/`. Nothing else.

## Target composition
Six sections, six distinct layout families. Eyebrow budget is 2 (the hero badge plus the pre-existing `TravelPackages` one); the cap is `ceil(6/3) = 2`. No new eyebrows anywhere.

1. **Hero - full-bleed autoplaying carousel with a two-column overlay band.** Superseded by the "Hero revision" section below; that section is authoritative for the hero.
2. **Destinos - 2-column grid of 4.** `sm:grid-cols-2`. Four items, four cells, no orphan. Drops the `slice(0, 5)` that was asking for five and getting four.
3. **Paquetes** - keep `TravelPackages` at 3 columns, media unified to `aspect-video`.
4. **Prestador destacado - horizontal split.** Image left, content right, `lg:grid-cols-2`. Isolated between two grids, so the zigzag cap is not approached.
5. **Trust row - real numbers, no cards.** Replace the two invented percentages with the real counts from `lib/data.ts` (4 destinos, 6 prestadores, 10 experiencias, 6 alojamientos) plus the two qualitative claims that are actually true. Big display figures, `divide-y sm:divide-x` hairlines, no card boxes.
6. **Cómo funciona - divided flow row.** Three text blocks in a `divide-y sm:divide-x sm:grid-cols-3` row, no card chrome. Labels become verbs ("Elige", "Conecta", "Arma"), dropping the banned "1. / 2. / 3." numbering.

## Hero revision (user request, supersedes target composition item 1)
The user replaced the asymmetric split with a different hero. Authoritative for the hero:

- **The carousel spans the full available width** instead of sitting in a half-width column.
- **The carousel autoplays.**
- **Two columns over the carousel.** Column one carries the municipality name, bound to the active slide. Column two carries the `h1` and the search field.

Rationale for the design decisions locked here:

- **`nombre === municipio` for all four destinos, and `vereda` is `Centro` for all four.** Verified against `data/destinos.json`. So column one is genuinely just the municipality name, and the old per-slide caption (`d.nombre` plus `municipio · vereda`) is fully redundant with it. The per-slide caption is removed; the overlay band replaces it. The overlay owns the destination label from now on.
- **A new client component `components/HomeHero.tsx` owns the hero.** The overlay text has to react to carousel state, and a server component cannot hold that state or pass a render function across the client boundary. The page passes `SearchBar` as `children`, which is a supported server-to-client child handoff.
- **`components/MunicipalityCarousel.tsx` is deleted.** It is imported by `app/page.tsx` and nothing else, so absorbing its role into `HomeHero` leaves it dead. Deletion over addition.
- **The hand-rolled `.carousel-track` / `.carousel-slide` / `.carousel-btn` rules are deleted** from `globals.css` once the old component is gone. The new track uses Tailwind (`flex` + `min-w-full shrink-0` per slide) instead. `.leaflet-*` z-index rules stay untouched.
- **Full width means full content width, not edge-to-edge past `max-w-7xl`.** Escaping the container needs `-mx-4 sm:-mx-6` to cancel `main`'s `px-4 sm:px-6`. A true viewport-bleed would need `w-[100vw]`, which includes the scrollbar gutter and risks horizontal overflow on a site that currently has none, or moving the hero out of the padded `main` in the root layout, which is a site-wide change and out of scope. The safe version is shipped and the structural option is offered to the user.
- **`VerifiedBadge` leaves the hero.** The user's spec gives column one to the municipality and column two to the `h1` and the search. The trust signal is not lost: it still appears on every destination card and on the featured provider. Hero text-element count stays at 4 (municipality, headline, subtext, CTA), and the page eyebrow budget drops from 2 to 1.
- **The search dropdown must flip upward.** The hero clips its overflow horizontally so the off-screen slides cannot widen the page, and the search field sits in a bottom-anchored band. A dropdown that opens downward is therefore clipped by the hero's bottom edge. Changing it from `top-full mt-1` to `bottom-full mb-1` puts it over the photo, inside the hero bounds.
- **The open-on-page-load dropdown bug gets fixed here.** `SearchBar` initialises `query` to `DESTINOS[0].nombre` and guards on `query && suggestions.length > 0`, so the suggestion list renders unprompted on every page load, and at 375px it covers the date field. Gate it on the field actually having been edited.

## Viajes ya armados section (T9, second user request)
Second redirect. The user asked to improve the UI of the packages section. The hero work above landed in the tree and is type-clean, but is still unverified in a browser; T9 is independent of it.

The defect is structural, not cosmetic. `CommentsSection` is a complete `<section>` carrying its own `<h2>`, its own "Experiencias reales" eyebrow, its own `rounded-2xl bg-card shadow-warm` chrome, a comment list, a textarea and a points explainer. It is nested inside each package card, which is itself `rounded-2xl bg-card shadow-warm` with an `h3`. Three consequences:
- card inside card, with identical chrome, three times over
- an `h2` nested inside an `article` whose own heading is an `h3`
- three comment forms and three fetch requests on homepage load

Locked decisions:

- **Comments move behind a per-card disclosure, mounted lazily.** Only one package's thread is open at a time, via a single `openSlug: string | null` state rather than three booleans. Because `CommentsSection` mounts only when opened, it stops fetching on page load. The feature is preserved intact; nothing is removed.
- **`CommentsSection` gains an optional `variant?: "card" | "embedded"` defaulting to `"card"`.** The other five call sites keep their current rendering byte-for-byte. `embedded` drops the `<section>` wrapper, the eyebrow and the `h2`, and the card chrome. That removes the nested-heading problem and the contrast-failing eyebrow from this section.
- **The "El más elegido" ribbon leaves the image.** A pill overlaid on a photo is a banned pattern, and `index === 0` is positional, so the badge can silently claim the wrong package if the data order changes. It becomes a data-driven label above the `h3`, derived from the maximum `elegidoPorcentaje`.
- **The price stops being an afterthought.** It is currently buried in a 12px uppercase line with `text-ink/50`, which is 3.2:1 and fails AA. It becomes its own `text-base font-semibold text-bosque` line, matching the featured-provider card on the same page.
- **The `min-h-12` title-row hack disappears** along with the corner percentage badge. The percentage folds into the metadata line as `3 días · Elegido por el 64%`.
- **The CTA moves from `bg-bosque` to `bg-terracota-hover`.** The hero search and the header "Reservar" are already terracotta, so three different primary-CTA colours is a Color Consistency Lock failure.
- **The CTA gets a pending state** so a double click cannot re-upsert the same itinerary items before navigation lands.
- **`CommentsSection`'s failing terracotta text is corrected** across all its call sites: `text-terracota` on `bg-card` is 4.02:1, below AA. This is a disclosed a11y fix, not scope creep.

## Header and /prestadores (T10 and T11, third user request)
Third redirect. The user authorised both, which reverses the earlier out-of-scope decision on the header. Both were previously recorded as findings; these are the decisions that close them.

### T10 header
- **The mobile overflow is a measured bug, not a preference.** Six nav links always render. The row measures 587px and at 375px `documentElement.scrollWidth` was 603. A hamburger disclosure below `md` is the fix, not a narrower font.
- **`HeaderAccount` renders exactly once.** Putting it in both the desktop row and the mobile panel would mount two instances, and `useSessionUser` fetches `/api/auth/session` per instance, so that is a second network request. It stays in the header row at every breakpoint, and the mobile panel carries only the six nav links. The logo shrinks to `h-8` on mobile to make the row fit: 32px tall at the 20:7 intrinsic ratio is roughly 91px wide, so logo plus hamburger plus the 110px sign-in control clears a 343px content box.
- **Bar height drops.** `h-16` mobile, `md:h-[72px]` desktop. Both are under the 80px nav cap. The logo goes from `h-16 sm:h-20` to `h-8 md:h-11`, because a logo at 100% of bar height leaves the bar no breathing room.
- **`bg-[#F2F6E2]` is replaced by a token.** It is an off-token hex with no `@theme` entry, and its green tint does not match the `bg-canvas` body. `bg-canvas/90 backdrop-blur` with the existing `border-b border-inputborder/60` reads as the same surface lifted above the content, and it is sticky-translucent already.
- **Active route indication via `usePathname`,** with `aria-current="page"`. This is what makes the existing `"use client"` directive load-bearing; the component currently declares it without a single hook. `/` must compare by exact equality, because a prefix match on `/` matches every route.
- **The redundant "Reservar" button is removed.** It points at `/oferta`, and the nav item "Explora" points at `/oferta`. Two labels, one destination, one of them styled as a button, which the duplicate-CTA-intent rule bans. This is a change to site chrome and is flagged for explicit review rather than slipped in.
- **`Inicio` moves to the front.** It currently sits after "Hubs sostenibles". Labels, slugs, and the relative order of the other five are untouched.

### T11 /prestadores
- **Same comment-disclosure fix as T9, now proven.** `CommentsSection` is nested in all six cards, so the page renders six `<h2>Comentarios` inside six articles, six eyebrows, six card-in-card shells, and fires six comment fetches on load. It moves behind a per-card disclosure, lazily mounted, `variant="embedded"`, one open at a time.
- **The municipality is printed twice per card and that is a data fact, not a guess.** Verified across all six records: `p.municipio` equals `getDestino(p.destino_slug).nombre` every time, so `Zona: {destino.nombre}` repeats the name already shown in the metadata line. The redundant half is dropped and the travel time, which is the useful datum, is kept as `Tiempo de viaje: {destino.tiempo_aprox}`.
- **The two middle-dots on one line are split** by stacking `{p.tipo}` and `{p.vereda}, {p.municipio}` on separate lines.
- **`text-terracota` becomes `text-terracota-hover`** on the metadata line: 4.02:1 on white fails AA.
- **The raw phone number leaves the button label.** `Llamar +574441234568` is a 12-character label on a secondary action. It becomes `Llamar`, consistent with the featured-provider card on the homepage.
- **No filter UI is built.** All six `tipo` values are unique, so there is no category to group or filter by, and six records do not justify it.
- **The page becomes a client component** because the disclosure state lives with the grid. It is already prerendered, and `data/prestadores.json` is six records, so the cost is a few kilobytes of RSC payload.
- **`key={p.nombre}` must survive.** It is also the `CommentsSection` `resourceId`, so renaming a provider orphans its comments.

### T12 header revision (fourth user request)
The user rejected two of the T10 decisions and asked for the logo 40% bigger. Both reversals are recorded here rather than silently applied.

- **The header surface goes back to `#F2F6E2`.** T10 replaced it with `bg-canvas/90` on the grounds that the green tint did not match the cream body. The user is the owner of that call and overrode it. It now lives in `@theme` as `--color-header: #f2f6e2`, so the rendered colour is byte-identical to the original `bg-[#F2F6E2]` while no longer being a raw hex in a component. The bar is opaque, as it was originally; the `/90` translucency is gone, because a translucent token over `bg-canvas` is not the same colour as the opaque one.
- **The logo scales 1.4x.** `h-8` 32px to `h-[2.8rem]` 44.8px, and `md:h-11` 44px to `md:h-[3.85rem]` 61.6px. At the 20:7 intrinsic ratio that is 128px and 176px wide.
  - Logo-to-bar ratio lands at 70% mobile and 85.6% desktop, against the original 80% and 100%. So the growth is visible but does not recreate the original defect, which was a logo at 100% of bar height.
- **The desktop nav breakpoint moves from `md` to `lg`,** and this one was not requested. Enlarging the logo exposed a latent defect: six links plus a 176px logo need about 894px, and the 768px content box is only 720px, so the nav would have wrapped to two lines at tablet width. `whitespace-nowrap` is added to the nav links so a two-line nav becomes impossible rather than silent, and `lg` is where the row genuinely fits. Between 768 and 1023 the hamburger carries the links. Flagged because it slightly changes the tablet experience.

## Bug fixes in scope
- `components/TravelPackages.tsx:89` - `showToast("El paquete se añadió a tu itinerario.")` sits at module scope outside the component. It fires on every client load. Move the call into the `customize` handler, where it belongs.
- `components/DestinationCard.tsx` - renders "1 opciones de transporte" for every card today, because the plural is hardcoded and every `transporte` array has length 1. Add singular/plural handling.
- `app/globals.css` - CTA contrast. `bg-terracota` #c85a32 with white text is 4.23:1, below WCAG AA 4.5:1 for 14px text. `text-terracota` on `bg-canvas` is 4.02:1, also failing. Solid fills and small accent text move to `terracota-hover` #b24f2c (5.19:1). Add `--color-terracota-deep` #9c4425 (6.43:1) for the hover state, one line in the `@theme` block.
- `components/TravelPackages.tsx` - `aspect-[4/3]` unified to `aspect-video` so both card families match.

## Shape consistency lock
The codebase already runs a documented radius rule. Keep it, and document it in `globals.css`:
- panels `rounded-3xl` (24px)
- cards `rounded-2xl` (16px)
- interactive controls `rounded-[10px]`
- pills and badges `rounded-full`

## Typography
Unchanged stack: `Plus Jakarta Sans` for display, `Inter` for body, both via `next/font` in `app/layout.tsx`. Inter stays as the body face because the site is Spanish-language public tourism content where legibility on a low-end phone beats typographic novelty. Display type gets tighter tracking (`tracking-tight`) and the hero gets explicit `leading-[1.05]`.

## Motion
`MOTION_INTENSITY 4`, zero dependencies:
- hover and active states on cards, buttons, and links (`transform` and `opacity` only, `active:translate-y-[1px]` for tactile feedback)
- section headings reveal on scroll via native CSS `animation-timeline: view()`, inside `@media (prefers-reduced-motion: no-preference)`
- no `window.addEventListener("scroll")`, no motion library, no GSAP

## Acceptance criteria
- [ ] Hero fits the initial viewport at 375px and 1440px; the `SearchBar` CTA is visible without scrolling
- [ ] `h1` is 2 lines max at desktop; subtext is 18 words
- [ ] Hero contains exactly 4 text elements: badge, headline, subtext, CTA
- [ ] No 3-equal-card section and no "1. / 2. / 3." step numbering
- [ ] Every grid has an exact cell count; no orphan or empty cell
- [ ] Every solid CTA passes WCAG AA against its own background
- [ ] Middle-dot separators: max 1 per line
- [ ] Zero em-dashes in any visible string
- [ ] One accent color (terracota family) across all six sections
- [ ] `MunicipalityCarousel` still cycles: `.carousel-slide { min-width: 100% }` must survive in `globals.css`
- [ ] All routes, nav labels, and form field names unchanged
- [ ] `bunx tsc --noEmit` clean
- [ ] `bun run lint` reports only the pre-existing `app/page.tsx:74` `<img>` vs `next/image` warning, or fewer

## Checks
- `bunx tsc --noEmit` (the typecheck; there is no `typecheck` script)
- `bun run lint`
- `bun run dev`, then the homepage in the browser at 375px and 1440px

## TDD mode
**Off.** Source: project configuration. `AGENTS.md` states there are no tests, no test runner, and no CI, and instructs against inventing one. Runner: none. Functional checks above are the verification of record.

## Delivery
`ask-on-risk` strategy. Forecast is 300-380 authored changed lines across 6 files, under the 400-line budget, so no chained PR is expected. Work-unit commits on a feature branch, branched off `main` before the first source write. Push and PR remain the user's decision.

## Tasks

### T1 - Palette contrast correction
Route: inline (one line in an existing token block, already understood).
Add `--color-terracota-deep: #9c4425` to the `@theme` block and a one-line comment documenting the radius rule.
Check: `globals.css` parses; Tailwind generates `bg-terracota-deep`.

### T2 - Fix the three component defects
Route: delegated writer (3 non-trivial files, needs the design context).
Move the stray `showToast` into `TravelPackages.customize`, unify its media to `aspect-video`, and add singular/plural handling to the `DestinationCard` transport count.
Check: `bunx tsc --noEmit`; grep confirms no module-scope `showToast` remains.

### T3 - Recompose the hero
Route: delegated writer (same writer as T2 and T4, one writer for the whole feature).
Rebuild the hero as an asymmetric split per the target composition. Adjust `MunicipalityCarousel` heights for the new column. Verify `SearchBar` still reads correctly at the new width.
Check: hero fits 375px and 1440px; carousel arrows and dots remain reachable; SearchBar dropdown still overlays correctly.

### T4 - Recompose sections 2, 4, 5, 6
Route: delegated writer (same writer).
2-column destino grid, horizontal prestador split, real-number trust row, divided flow row for "¿Cómo funciona?".
Check: no orphan cells; every visible string re-read for the copy self-audit; no em-dashes.

### T5 - Motion layer
Route: delegated writer (same writer).
Scroll-reveal on section headings via `animation-timeline: view()` inside the reduced-motion guard.
Check: reveal is absent under `prefers-reduced-motion: reduce`.

### T6 - Verification
Route: inline (state commands).
Run `bunx tsc --noEmit` and `bun run lint`. Report actual output.
Check: both clean, lint shows only the pre-existing warning.

### T7 - Pre-Flight Check
Route: inline (I own this, it is the design gate).
Walk the skill's Section 14 matrix against the rendered page and record the result here.

## Progress

| Task | Status | Evidence |
| --- | --- | --- |
| T1 | done | `--color-terracota-deep` and the radius rule comment in `app/globals.css`. |
| T2 | done | `TravelPackages` toast moved into `customize`, media to `aspect-video`, `DestinationCard` pluralisation. No module-scope `showToast` remains. |
| T3 | done | `HomeHero` owns the split hero, autoplay, pause on hover and focus, reduced-motion guard. |
| T4 | done | 2-col destino grid, real-number trust row, divided flow row, 16:9 everywhere. |
| T5 | done | `.reveal-up` and `.slide-name-in` under `@media (prefers-reduced-motion: no-preference)`. No scroll handler anywhere. |
| T6 | done | `bunx tsc --noEmit` exit 0. `bun run lint` 1 warning, the pre-existing `<img>` one, now at line 93. |
| T7 | partial | Run for the sections actually shipped. Full matrix needs a browser, which the user ruled out. |
| T8 | done | Full-bleed `w-[100vw]` hero, autoplaying, two-column overlay, municipality bound to the active slide. |
| T9 | done | Comments behind a lazy disclosure, data-driven "El más elegido", price promoted, CTA terracotta. |
| T10 | done | Mobile menu, `usePathname` + `aria-current`, `h-16 md:h-[72px]`, `bg-header`, Reservar removed. |
| T11 | done | Same disclosure on all six cards, duplicate municipality removed, `Llamar` label, `max-w-2xl` intro. |
| T12 | done | Header colour restored as `--color-header`, logo scaled 1.4x, nav breakpoint moved to `lg`. |

## Out-of-scope findings (recorded, not fixed)
- `components/Header.tsx` - `h-20` bar with a `h-20` logo, six nav links, and no mobile menu. The links stay visible at 375px. Site-wide, root layout.
- `components/Header.tsx:17` - `bg-[#F2F6E2]` is an off-token hex with no `@theme` entry behind it.
- `components/Header.tsx` - no active-route indication, no `usePathname`.
- `components/Header.tsx` - the "Reservar" CTA and the "Explora" nav link point at the same `/oferta` destination under two different labels. Duplicate CTA intent.
- App-wide dark mode. The skill requires dual mode for consumer pages, but the token layer is shared by every route, so it is its own change.
- `components/VerifiedBadge.tsx` - hardcoded `#1E4B37` in the SVG bypasses the token layer. Five importers, so a re-theme would leave the icon behind.
- `app/globals.css` lacks a documented z-index scale.

## Next step
T1 and T2 through T5 in one delegated writer pass, then T6 and T7.
