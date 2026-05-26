# Landing Page Modernization — Design Spec

**Date:** 2026-05-19
**Status:** Approved, ready for implementation plan
**Scope:** `apps/web` — homepage redesign + matching visual system propagated to `/generate` and `/games/preview`.

## Goals

Replace the current pastel-cream + pink-CTA + cyan-block landing aesthetic with a **neo-brutalist confetti** system that reads as both modern and cheerful. Keep the existing IA (hero + inline quick-pick form on home; full form on /generate; rendered GameSpec on /games/preview). Move the safety constraints out of an always-visible strip into an on-demand modal so the page feels less heavy.

Non-goal: real auth, persistence, content changes to the generated game body, or new product surfaces.

## Direction

**Neo-brutalist confetti.** Chunky display type, hard offset shadows (no blur), 3px black borders, candy-colored blocks, sticker accents at slight rotations, snappy spring-y motion. Headlines use a heavily-tracked Bricolage Grotesque; everything else uses Inter. Continuous low-amplitude motion gives the page a heartbeat without the user having to interact.

## Visual System

### Color tokens

Add to `apps/web/tailwind.config.ts` as named theme colors (and to `apps/web/app/globals.css` as CSS variables on `:root` so non-Tailwind styles can reach them).

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1A1A1A` | All borders, body text, dark CTA fill, footer divider, modal frame |
| `cream` | `#FFF8E1` | Page background |
| `paper` | `#FFFCF0` | Card surfaces inside cream sections |
| `butter` | `#FFE45C` | Closer-section block, accents, focused chips |
| `hot` | `#FF5C8A` | Primary highlight (headline swipe, submit button, modal close, underline-decoration on links) |
| `mint` | `#5BE0B0` | Live-status dot, "1-click demo" sticker, secondary accents |
| `sky` | `#8AD7FF` | Tertiary accents (proof stickers) |
| `lilac` | `#C9B6FF` | Hero gradient blob |

Retire the old palette (`#fff7d6`, `#251646`, `#4d3f66`, `#ffd166`, `#7bdff2`, `#11836f`, `#b8f2c8`, `#ffedf3`) from `page.tsx`, `generate/page.tsx`, `games/preview/page.tsx`, and all components in `apps/web/components/`. No backwards-compat keepalive.

### Typography

Load **Bricolage Grotesque** (weights 600/700/800) and **Inter** (weights 400/500/600/700) via `next/font/google` in `apps/web/app/layout.tsx`. Expose two CSS variables — `--font-display` and `--font-body` — and bind them in `tailwind.config.ts` via `fontFamily.display` and `fontFamily.sans`. Default `body` to `font-sans`; use `font-display` for any heading rendered with the system's chunky treatment.

Display tracking: `letter-spacing: -0.03em; line-height: 0.92` for headings ≥40px. For smaller display usage (form h2 at 26px, modal h3 at 32px), use `letter-spacing: -0.03em; line-height: 1`. Display is for h1, section h2, and modal h3 only — chip labels, field labels, and form sub-text stay Inter to avoid Bricolage at small sizes.

### Component patterns

All bordered surfaces share one rule: **solid ink border, hard offset shadow (0 blur), no rounded corners above 18px.** Borders never use gradients or alpha. Shadows are always pure ink at integer-pixel offsets — `4px 4px 0`, `6px 6px 0`, `10px 10px 0`, `12px 12px 0` depending on element importance. Major surfaces (cards, buttons, inputs, the modal box) use a 3px ink border; small accents (chips, stickers, proof dots, promise rows, modal close button) use a 2px ink border.

- **Button (primary):** ink fill, cream text, 3px ink border, 6px 6px 0 ink shadow. Hover: translate(-2px, -2px) and grow shadow to 8px. Active: translate(2px, 2px) and shrink shadow to 2px. Same recipe for secondary (paper fill, ink text) and submit (hot fill, ink text, Bricolage display).
- **Card:** paper fill, 3px ink border, 10px 10px 0 ink shadow, radius 18px.
- **Sticker:** small bordered chip, 2px ink border, 3–4px 3–4px 0 ink shadow, rotated 4°–8°. Used for "1-CLICK DEMO" badge, proof stickers, modal-close button.
- **Chip (vibe selector):** 2px ink border, white fill default, butter fill + 3px shadow when active. Hover: translate(-2px, -2px) and reveal the shadow.
- **Input (number/select):** 3px ink border, 3px 3px 0 ink shadow, white fill, Bricolage 800 for number inputs to match the chunky feel.
- **Eyebrow pill:** small paper chip with 2px ink border and 3px ink shadow, leading mint pulse-dot.

### Motion

All motion respects `prefers-reduced-motion: reduce` via a global `*` selector in `globals.css` that disables `animation` and `transition`.

| Element | Motion |
|---|---|
| Hero gradient blobs | Slow drift, 14s and 16s ease-in-out infinite loops, mirrored directions |
| Eyebrow status dot | Pulse + scale, 1.6s loop |
| Headline pink swipe | Subtle shadow + tilt pop every 3.4s |
| Headline accent emoji (🎉) | Continuous wiggle, 2.2s loop |
| "1-CLICK DEMO" sticker | Vertical bob + rotation, 2.4s loop |
| Vibe chips | Hover-only: 120ms translate + shadow reveal |
| All buttons | Hover-only: 120ms translate + shadow grow; active: press-down |
| Closer h2 accent ("Now-ish?") | Continuous scale-breathe, 1.8s loop |
| Modal open | Backdrop fade 180ms; modal scale-in with cubic-bezier(.34, 1.56, .64, 1) overshoot, 250ms |

Cap continuous motion to elements with deliberate accent roles (status dot, sticker, swipe, emoji, closer pop). Body text, form inputs, and the form card itself stay still — too much movement around input fields hurts usability.

## Page-by-page

### Home — `apps/web/app/page.tsx`

Three sections inside a single `<main>` with `bg-cream`:

1. **Nav** (new) — left: `bordom.ai` wordmark in display font, hot dot. Right: pill-style "Peek at a game →" link (ink fill).
2. **Hero** — two-column grid (`minmax(0,1fr) 420px`, collapses to single column under 980px). Left column: eyebrow pill, h1, lede, two CTAs, proof-sticker row. Right column: form card.
   - **Headline copy:** `"A brand-new party game. Just for tonight. 🎉"` rendered across three lines. "Just for tonight." wrapped in `<span className="swipe">`; trailing emoji wrapped in `<span className="wink">`.
   - Two radial-gradient blobs (butter + lilac) sit behind the hero via `::before` / `::after` pseudo-elements and run the drift animation.
   - Proof row: 4 overlapping circular stickers (🪩 🎲 🧩 💬) + caption "4 styles · creative · conversation · puzzle · collab".
3. **Form card** — the "Quick party pick" form, rebuilt in the brutalist system:
   - Header: "Quick party pick" (display 800, -0.03em), subtitle "Skip the setup — get a game in one tap."
   - **Players:** two big number inputs separated by a `→` arrow.
   - **Vibe:** 3 chip buttons (Chill / Party / Waiting), each a column of emoji + label. Active state = butter fill + shadow.
   - **Game style:** styled `<select>` with custom dropdown caret.
   - **Submit:** full-width hot-pink button, display font, "Make me a game 🎈".
   - Hidden inputs for `props` (paper, pens) preserved.
   - Submit posts to `/games/preview` as today.
4. **Closer** — full-bleed butter band with ink top/bottom borders. h2 "Ready when you are. Now-ish?" (the "Now-ish?" word in hot, breathing). Sub copy + primary CTA back to /generate.
5. **Footer** — single row: copyright + "Our safety promise" button (renders the modal).

**Remove:** the cyan safety badges strip currently between hero and bottom of page.

### Generate — `apps/web/app/generate/page.tsx`

Same nav + footer. Single-column main:
- Eyebrow + h1 "Set up your party buddy" (display, hot swipe under "buddy") + lede.
- Form rebuilt with brutalist field components (see Component patterns).
- Submit "Generate preview 🎲" — submit button recipe.
- `SafetyConstraintsNotice` component is **removed from this page** in favor of the global modal link in the footer.

### Games preview — `apps/web/app/games/preview/page.tsx`

Same nav + footer. Single-column article with:
- Display h1 for the generated game title, with party-popper accent.
- Metadata pill row (players / duration / age) rebuilt as 3 stickers (butter, mint, sky) with 2px ink border and 3px shadow.
- Each `GameSection` becomes a card: paper fill, 3px ink border, 10px 10px 0 shadow, display font h2 with framed emoji badge. Inner list items become small paper rows with 2px ink border.
- "Winner moment" emphasis row → hot-pink filled callout inside the Scoring card: 3px ink border, 6px 6px 0 ink shadow, display font, padded 14×18.

## Modal — Safety promise

New component: `apps/web/components/SafetyPromiseModal.tsx` (client component — needs open state).

- Triggered by a button anywhere; for v1 the trigger lives in the global footer.
- Backdrop: fixed inset 0, ink @ 70% with 4px blur. Click-outside closes.
- Modal box: cream fill, 3px ink border, 12px 12px 0 ink shadow, radius 18px, max-width 540px, padded 28/28/24.
- Header: small hot label "★ HARD RULES WE NEVER BREAK ★", display h3 "Our safety promise", lede.
- Body: 4-item promise list. Each item: paper row with 2px ink border, 3px shadow, leading emoji column, **bold rule** + plain consequence.
  1. 🥤 **No drinking games.** Fun stays clear-headed.
  2. 🎲 **No gambling.** No bets, wagers, or financial stakes.
  3. 🛋️ **No physical risk.** Designed for safe, seated, cozy play.
  4. ✨ **Original only.** No franchise copycats. No commercialization.
- Footer line: "Built into the schema. Validated server-side before any game is shown."
- Close: 40×40 hot-pink circle with ink border at top-right (offset out of box). Bouncy scale-in animation on open.

Content of the modal mirrors the four `safetyItems` currently inlined in `page.tsx`. Lift the list to a shared module — `apps/web/lib/safety.ts` — exporting a typed `safetyPromises` array. The modal imports it; the inline copy in `page.tsx` is deleted along with the safety strip.

**Accessibility:**
- Modal is a client component using a `useState` open/closed; backdrop click + ESC close it.
- When open: `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the h3.
- Focus moves to the close button on open; on close, focus returns to the trigger.
- Trap focus within the modal while open (Tab and Shift+Tab cycle within).

## Shared layout

`apps/web/app/layout.tsx` gets:
- The `next/font/google` font loaders for Bricolage Grotesque and Inter, exposing `--font-display` and `--font-body` on `<html>`.
- A `<SiteNav />` server component above `{children}`.
- A `<SiteFooter />` client component below `{children}` (client because it owns the modal trigger state).
- `body` defaults to `font-sans bg-cream text-ink`.

New components:
- `apps/web/components/SiteNav.tsx`
- `apps/web/components/SiteFooter.tsx`
- `apps/web/components/SafetyPromiseModal.tsx`
- `apps/web/lib/safety.ts`

Components folder gets cleaned: `SafetyConstraintsNotice.tsx` is removed (replaced by the modal). The remaining form components — `PlayerCountInput`, `CircumstancesInput`, `GameTypeSelector`, `AvailablePropsSelector` — each get re-styled to the brutalist component recipes above but keep their existing prop / form-name contracts (the inputs still have the same `name` attributes so submission to `/games/preview` continues to work without server changes).

## File touch list

**Modified:**
- `apps/web/tailwind.config.ts` — add color tokens, font family bindings.
- `apps/web/app/globals.css` — add `:root` CSS variables, reduced-motion override, motion keyframes used by multiple pages (drift-a, drift-b, wiggle, swipe-pop, badge-bob, word-pop, pulse, modal-in, backdrop-in).
- `apps/web/app/layout.tsx` — fonts, nav, footer wrap.
- `apps/web/app/page.tsx` — full rewrite; remove safety strip; new hero, form, closer; uses shared nav/footer.
- `apps/web/app/generate/page.tsx` — restyle; remove inline SafetyConstraintsNotice.
- `apps/web/app/games/preview/page.tsx` — restyle.
- `apps/web/components/PlayerCountInput.tsx` — restyle.
- `apps/web/components/CircumstancesInput.tsx` — restyle (chip recipe).
- `apps/web/components/GameTypeSelector.tsx` — restyle.
- `apps/web/components/AvailablePropsSelector.tsx` — restyle.

**Added:**
- `apps/web/components/SiteNav.tsx`
- `apps/web/components/SiteFooter.tsx`
- `apps/web/components/SafetyPromiseModal.tsx`
- `apps/web/lib/safety.ts`

**Removed:**
- `apps/web/components/SafetyConstraintsNotice.tsx`

## Out of scope

- Real `useReducer`/server-action form handling (form keeps GET posting to `/games/preview` as today).
- Adding a real safety doc page; the modal is the only safety surface.
- Mobile breakpoint design beyond the existing single-column collapse at 980px.
- Animation tooling (Framer Motion etc.) — all motion is CSS-only.
- Dark mode.
