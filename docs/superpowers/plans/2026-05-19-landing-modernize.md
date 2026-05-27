# Landing Page Modernization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing pastel landing aesthetic across all three `apps/web` pages with a neo-brutalist confetti system (Bricolage Grotesque + Inter, hard ink borders, offset shadows, candy palette) and move the safety constraints into a footer-triggered modal.

**Architecture:** Add a token layer (Tailwind colors, CSS variables, font-loader, motion keyframes) in `globals.css` + `tailwind.config.ts`. Build shared chrome (`SiteNav`, `SiteFooter` with embedded `SafetyPromiseModal`) into `layout.tsx`. Restyle the three pages and the form components to consume the tokens. Delete `SafetyConstraintsNotice`. All motion is CSS-only and respects `prefers-reduced-motion`.

**Tech Stack:** Next.js 15 App Router (server components), Tailwind 3, `next/font/google` for Bricolage Grotesque + Inter, React 19, Vitest + @testing-library/react for the modal test.

**Source spec:** `docs/superpowers/specs/2026-05-19-landing-modernize-design.md`

---

## File Structure

**New:**
- `apps/web/lib/safety.ts` — typed `safetyPromises` array (single source of truth for promise copy).
- `apps/web/components/SafetyPromiseModal.tsx` — client component, modal box + open/close state + focus trap + ESC.
- `apps/web/components/SiteNav.tsx` — server component, top bar shared by every page.
- `apps/web/components/SiteFooter.tsx` — client component (owns modal open state), bottom bar shared by every page.
- `apps/web/components/__tests__/SafetyPromiseModal.test.tsx` — open/close + ESC + content tests.
- `apps/web/lib/__tests__/safety.test.ts` — exports the four promises with the documented copy.

**Rewritten:**
- `apps/web/app/page.tsx` — new hero, inline form (brutalist), closer band, no safety strip.
- `apps/web/app/generate/page.tsx` — restyled, drops `<SafetyConstraintsNotice />`.
- `apps/web/app/games/preview/page.tsx` — restyled cards, metadata stickers, winner callout.
- `apps/web/app/layout.tsx` — font loaders, body class, `<SiteNav />` and `<SiteFooter />` wrapping `{children}`.
- `apps/web/app/globals.css` — `:root` CSS variables, `prefers-reduced-motion` override, named `@keyframes`.
- `apps/web/tailwind.config.ts` — palette + display/sans font families bound to CSS vars.
- `apps/web/components/PlayerCountInput.tsx` — brutalist number inputs.
- `apps/web/components/CircumstancesInput.tsx` — chip recipe radios.
- `apps/web/components/GameTypeSelector.tsx` — brutalist select.
- `apps/web/components/AvailablePropsSelector.tsx` — brutalist multi-select checkboxes.

**Deleted:**
- `apps/web/components/SafetyConstraintsNotice.tsx` — replaced by the global footer modal.

---

## Task 1: Add color tokens and font-family bindings to Tailwind config

**Files:**
- Modify: `apps/web/tailwind.config.ts`

- [ ] **Step 1: Read current config**

Run: `cat apps/web/tailwind.config.ts`

- [ ] **Step 2: Replace the file with the token-extended version**

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1A1A1A",
        cream: "#FFF8E1",
        paper: "#FFFCF0",
        butter: "#FFE45C",
        hot: "#FF5C8A",
        mint: "#5BE0B0",
        sky: "#8AD7FF",
        lilac: "#C9B6FF"
      },
      fontFamily: {
        sans: ["var(--font-body)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        brut: "4px 4px 0 #1A1A1A",
        "brut-lg": "6px 6px 0 #1A1A1A",
        "brut-xl": "10px 10px 0 #1A1A1A",
        "brut-2xl": "12px 12px 0 #1A1A1A",
        "brut-sm": "3px 3px 0 #1A1A1A",
        "brut-press": "2px 2px 0 #1A1A1A"
      }
    }
  },
  plugins: []
};

export default config;
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS (no TS errors)

- [ ] **Step 4: Commit**

```bash
git add apps/web/tailwind.config.ts
git commit -m "feat(web): add brutalist palette and shadow tokens to tailwind"
```

---

## Task 2: Wire up Bricolage Grotesque + Inter via next/font

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Read current layout**

Run: `cat apps/web/app/layout.tsx`

- [ ] **Step 2: Rewrite layout to load fonts and bind CSS variables**

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Bordon.ai",
  description: "A brand-new party game. Just for tonight."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat(web): load Bricolage Grotesque + Inter via next/font"
```

---

## Task 3: Add CSS variables, motion keyframes, and reduced-motion override

**Files:**
- Modify: `apps/web/app/globals.css`

- [ ] **Step 1: Read current globals.css**

Run: `cat apps/web/app/globals.css`

- [ ] **Step 2: Replace globals.css with token + motion layer**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-ink: #1A1A1A;
  --color-cream: #FFF8E1;
  --color-paper: #FFFCF0;
  --color-butter: #FFE45C;
  --color-hot: #FF5C8A;
  --color-mint: #5BE0B0;
  --color-sky: #8AD7FF;
  --color-lilac: #C9B6FF;
}

@keyframes brut-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(1.4); }
}

@keyframes brut-wiggle {
  0%, 100% { transform: rotate(8deg); }
  25% { transform: rotate(-6deg); }
  75% { transform: rotate(16deg); }
}

@keyframes brut-drift-a {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  50% { transform: translate(-20px, 20px) rotate(8deg); }
}

@keyframes brut-drift-b {
  0%, 100% { transform: translate(0, 0) rotate(0); }
  50% { transform: translate(30px, -15px) rotate(-6deg); }
}

@keyframes brut-swipe-pop {
  0%, 100% { box-shadow: 4px 4px 0 var(--color-ink); transform: rotate(-1.8deg); }
  50% { box-shadow: 6px 6px 0 var(--color-ink); transform: rotate(-2.4deg); }
}

@keyframes brut-badge-bob {
  0%, 100% { transform: rotate(4deg) translateY(0); }
  50% { transform: rotate(7deg) translateY(-3px); }
}

@keyframes brut-word-pop {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.06); }
}

@keyframes brut-modal-in {
  0% { opacity: 0; transform: scale(.85) rotate(-2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}

@keyframes brut-backdrop-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Start the dev server to make sure CSS still compiles**

Run: `pnpm --filter @bordom-ai/web dev` in the background, then `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/`
Expected: `200`

(Leave the dev server running for the rest of the plan; it hot-reloads on subsequent changes.)

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/globals.css
git commit -m "feat(web): add brutalist CSS tokens, motion keyframes, reduced-motion override"
```

---

## Task 4: Create the safety promises module

**Files:**
- Create: `apps/web/lib/safety.ts`
- Create: `apps/web/lib/__tests__/safety.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// apps/web/lib/__tests__/safety.test.ts
import { describe, expect, it } from "vitest";
import { safetyPromises } from "../safety";

describe("safetyPromises", () => {
  it("exposes the four hard rules in order", () => {
    expect(safetyPromises.map((p) => p.id)).toEqual([
      "drinking",
      "gambling",
      "physical",
      "original"
    ]);
  });

  it("each promise carries an emoji, title, and note", () => {
    for (const promise of safetyPromises) {
      expect(promise.emoji.length).toBeGreaterThan(0);
      expect(promise.title.length).toBeGreaterThan(0);
      expect(promise.note.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @bordom-ai/web test -- lib/__tests__/safety.test.ts`
Expected: FAIL (module not found)

- [ ] **Step 3: Create the module**

```ts
// apps/web/lib/safety.ts
export type SafetyPromise = {
  id: "drinking" | "gambling" | "physical" | "original";
  emoji: string;
  title: string;
  note: string;
};

export const safetyPromises: readonly SafetyPromise[] = [
  {
    id: "drinking",
    emoji: "🥤",
    title: "No drinking games.",
    note: "Fun stays clear-headed."
  },
  {
    id: "gambling",
    emoji: "🎲",
    title: "No gambling.",
    note: "No bets, wagers, or financial stakes."
  },
  {
    id: "physical",
    emoji: "🛋️",
    title: "No physical risk.",
    note: "Designed for safe, seated, cozy play."
  },
  {
    id: "original",
    emoji: "✨",
    title: "Original only.",
    note: "No franchise copycats. No commercialization."
  }
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @bordom-ai/web test -- lib/__tests__/safety.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/lib/safety.ts apps/web/lib/__tests__/safety.test.ts
git commit -m "feat(web): add safetyPromises module"
```

---

## Task 5: Build the SafetyPromiseModal component

**Files:**
- Create: `apps/web/components/SafetyPromiseModal.tsx`
- Create: `apps/web/components/__tests__/SafetyPromiseModal.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// apps/web/components/__tests__/SafetyPromiseModal.test.tsx
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SafetyPromiseModal } from "../SafetyPromiseModal";

describe("SafetyPromiseModal", () => {
  it("renders nothing when closed", () => {
    render(<SafetyPromiseModal open={false} onClose={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders the four promises when open", () => {
    render(<SafetyPromiseModal open={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getByText("No drinking games.")).toBeDefined();
    expect(screen.getByText("No gambling.")).toBeDefined();
    expect(screen.getByText("No physical risk.")).toBeDefined();
    expect(screen.getByText("Original only.")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    let closed = false;
    render(<SafetyPromiseModal open={true} onClose={() => { closed = true; }} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(closed).toBe(true);
  });

  it("calls onClose when Escape is pressed", () => {
    let closed = false;
    render(<SafetyPromiseModal open={true} onClose={() => { closed = true; }} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(closed).toBe(true);
  });

  it("traps Tab on the close button while open", () => {
    render(<SafetyPromiseModal open={true} onClose={() => {}} />);
    const close = screen.getByLabelText("Close");
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(close);
  });
});
```

- [ ] **Step 2: Configure Vitest for jsdom (one-time setup)**

Read `apps/web/package.json`. If no `vitest.config.ts` exists, create one:

```ts
// apps/web/vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true
  }
});
```

If `@testing-library/react` is already a devDependency (confirmed via `cat apps/web/package.json`), no install is needed. Otherwise: `pnpm --filter @bordom-ai/web add -D @testing-library/react jsdom`.

Also add `jsdom` if missing: `pnpm --filter @bordom-ai/web add -D jsdom`.

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @bordom-ai/web test -- components/__tests__/SafetyPromiseModal.test.tsx`
Expected: FAIL (module not found)

- [ ] **Step 4: Create the component**

```tsx
// apps/web/components/SafetyPromiseModal.tsx
"use client";

import { useEffect, useRef } from "react";
import { safetyPromises } from "../lib/safety";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SafetyPromiseModal({ open, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "Tab") {
        // Modal has a single interactive element (close button); trap focus on it.
        event.preventDefault();
        closeRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-5 backdrop-blur-sm"
      style={{ animation: "brut-backdrop-in .18s ease-out" }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-promise-title"
        className="relative w-full max-w-[540px] rounded-[18px] border-[3px] border-ink bg-cream p-7 shadow-brut-2xl"
        style={{ animation: "brut-modal-in .25s cubic-bezier(.34, 1.56, .64, 1)" }}
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute -right-4 -top-4 grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-hot text-lg font-extrabold shadow-brut"
        >
          ✕
        </button>
        <div className="text-[11px] font-bold uppercase tracking-[.1em] text-hot">
          ★ Hard rules we never break ★
        </div>
        <h3
          id="safety-promise-title"
          className="mt-1.5 font-display text-[32px] font-extrabold leading-none -tracking-[.03em]"
        >
          Our safety promise
        </h3>
        <p className="mt-2 text-sm leading-[1.5] text-ink/80">
          Every game we generate is checked against these rules. If it can&apos;t pass, we don&apos;t ship it.
        </p>
        <ul className="mt-5 grid gap-2.5">
          {safetyPromises.map((promise) => (
            <li
              key={promise.id}
              className="flex items-start gap-3 rounded-[10px] border-2 border-ink bg-paper px-3.5 py-3 shadow-brut-sm"
            >
              <span className="text-[22px] leading-[1.1]" aria-hidden="true">
                {promise.emoji}
              </span>
              <div className="text-sm leading-[1.4]">
                <b className="mb-0.5 block font-bold">{promise.title}</b>
                {promise.note}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-ink/70">
          Built into the schema. Validated server-side before any game is shown.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @bordom-ai/web test -- components/__tests__/SafetyPromiseModal.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/web/components/SafetyPromiseModal.tsx apps/web/components/__tests__/SafetyPromiseModal.test.tsx apps/web/vitest.config.ts apps/web/package.json
git commit -m "feat(web): add SafetyPromiseModal with focus + ESC + click-outside"
```

---

## Task 6: Build SiteNav

**Files:**
- Create: `apps/web/components/SiteNav.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/SiteNav.tsx
import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5">
      <Link
        href="/"
        className="font-display text-[22px] font-extrabold -tracking-[.04em] text-ink"
      >
        bordon<span className="text-hot">.</span>ai
      </Link>
      <Link
        href="/games/preview"
        className="rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-[13px] font-bold text-cream shadow-brut"
      >
        Peek at a game →
      </Link>
    </nav>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/SiteNav.tsx
git commit -m "feat(web): add SiteNav"
```

---

## Task 7: Build SiteFooter with embedded modal trigger

**Files:**
- Create: `apps/web/components/SiteFooter.tsx`

- [ ] **Step 1: Create the component**

```tsx
// apps/web/components/SiteFooter.tsx
"use client";

import { useState } from "react";
import { SafetyPromiseModal } from "./SafetyPromiseModal";

export function SiteFooter() {
  const [open, setOpen] = useState(false);

  return (
    <footer className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-ink/70">
      <span>© 2026 Bordon.ai · JSON in, fun out.</span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="font-semibold text-ink underline decoration-hot decoration-2 underline-offset-4"
      >
        Our safety promise
      </button>
      <SafetyPromiseModal open={open} onClose={() => setOpen(false)} />
    </footer>
  );
}
```

- [ ] **Step 2: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/SiteFooter.tsx
git commit -m "feat(web): add SiteFooter with safety-promise modal trigger"
```

---

## Task 8: Wire nav + footer into the root layout

**Files:**
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Add SiteNav + SiteFooter to layout (preserving the font wiring from Task 2)**

```tsx
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { SiteFooter } from "../components/SiteFooter";
import { SiteNav } from "../components/SiteNav";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Bordon.ai",
  description: "A brand-new party game. Just for tonight."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${inter.variable}`}>
      <body className="bg-cream font-sans text-ink antialiased">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Verify all three routes still respond**

Run: `for p in / /generate /games/preview; do curl -s -o /dev/null -w "$p %{http_code}\n" http://localhost:3000$p; done`
Expected: `/ 200`, `/generate 200`, `/games/preview 200`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/layout.tsx
git commit -m "feat(web): wire SiteNav + SiteFooter into root layout"
```

---

## Task 9: Rewrite the home page

**Files:**
- Modify: `apps/web/app/page.tsx`

- [ ] **Step 1: Replace home page with the brutalist rewrite**

```tsx
// apps/web/app/page.tsx
import Link from "next/link";

const circumstances = [
  {
    emoji: "🛋️",
    label: "Chill",
    value: "Friends relaxing indoors with paper, pens, and a 20-minute window."
  },
  {
    emoji: "🍕",
    label: "Party",
    value: "A cheerful group gathered around a table with snacks, phones away, paper, and pens."
  },
  {
    emoji: "🚗",
    label: "Waiting",
    value: "People waiting together with limited space, low energy, and a need for quick laughs."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden py-6 pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10%] -top-[10%] h-[520px] w-[520px] rounded-full opacity-60"
          style={{
            background: "radial-gradient(circle, var(--color-butter) 0%, transparent 65%)",
            animation: "brut-drift-a 14s ease-in-out infinite"
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[20%] -left-[10%] h-[420px] w-[420px] rounded-full opacity-55"
          style={{
            background: "radial-gradient(circle, var(--color-lilac) 0%, transparent 65%)",
            animation: "brut-drift-b 16s ease-in-out infinite"
          }}
        />

        <div className="container relative mx-auto grid max-w-[1180px] gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
              <span
                className="h-2 w-2 rounded-full bg-mint"
                style={{ animation: "brut-pulse 1.6s infinite" }}
              />
              Fresh games, on demand
            </span>

            <h1 className="mt-6 font-display text-[clamp(48px,7vw,96px)] font-extrabold leading-[.92] -tracking-[.03em]">
              A brand-new
              <br />
              party game.
              <br />
              <span
                className="inline-block border-[3px] border-ink bg-hot px-3 shadow-brut"
                style={{ animation: "brut-swipe-pop 3.4s ease-in-out infinite" }}
              >
                Just for tonight.
              </span>{" "}
              <span
                className="inline-block origin-[50%_70%]"
                style={{ animation: "brut-wiggle 2.2s ease-in-out infinite" }}
              >
                🎉
              </span>
            </h1>

            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-ink/85">
              Tell us how many friends, what&apos;s around, and the vibe — we&apos;ll invent a game in
              10 seconds. Original, easy to learn, ready to play.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-ink px-5 py-3.5 font-bold text-cream shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
              >
                Start the party 🎉
              </Link>
              <Link
                href="/games/preview"
                className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-paper px-5 py-3.5 font-bold text-ink shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
              >
                Peek at a game
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-3.5">
              <div className="flex">
                <Sticker bg="bg-butter">🪩</Sticker>
                <Sticker bg="bg-mint">🎲</Sticker>
                <Sticker bg="bg-sky" rotate>
                  🧩
                </Sticker>
                <Sticker bg="bg-hot">💬</Sticker>
              </div>
              <p className="text-[13px] font-medium leading-tight">
                <b className="font-bold">4 styles</b> · creative · conversation · puzzle · collab
              </p>
            </div>
          </div>

          <form
            action="/games/preview"
            className="relative rounded-[18px] border-[3px] border-ink bg-paper px-6 py-6 shadow-brut-xl"
          >
            <span
              className="absolute -top-4 right-5 rounded-full border-2 border-ink bg-mint px-3 py-1.5 text-[11px] font-extrabold shadow-brut-sm"
              style={{ animation: "brut-badge-bob 2.4s ease-in-out infinite" }}
            >
              ⚡ 1-CLICK DEMO
            </span>

            <h2 className="font-display text-[26px] font-extrabold leading-none -tracking-[.03em]">
              Quick party pick
            </h2>
            <p className="mt-1 text-[13px] text-ink/70">Skip the setup — get a game in one tap.</p>

            <div className="mt-5 grid gap-4">
              <Field label="How many of you">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                  <input
                    aria-label="Minimum players"
                    name="minPlayers"
                    type="number"
                    min={1}
                    defaultValue={2}
                    className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
                  />
                  <span className="text-xl font-extrabold text-ink/30">→</span>
                  <input
                    aria-label="Maximum players"
                    name="maxPlayers"
                    type="number"
                    min={1}
                    defaultValue={6}
                    className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
                  />
                </div>
              </Field>

              <Field label="The vibe">
                <div className="grid grid-cols-3 gap-2">
                  {circumstances.map((item, index) => (
                    <label
                      key={item.label}
                      className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 border-ink bg-white px-1.5 py-2.5 text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm has-[:checked]:bg-butter has-[:checked]:shadow-brut-sm"
                    >
                      <input
                        name="circumstances"
                        type="radio"
                        value={item.value}
                        defaultChecked={index === 0}
                        className="sr-only"
                      />
                      <span className="text-[22px] leading-none" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Game style">
                <select
                  name="gameType"
                  className="w-full appearance-none rounded-[10px] border-[3px] border-ink bg-white px-3.5 py-3 pr-9 text-sm font-semibold shadow-brut-sm"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231A1A1A' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center"
                  }}
                >
                  <option value="creative">Creative</option>
                  <option value="conversation">Conversation</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="collaborative">Collaborative</option>
                </select>
              </Field>

              <input name="props" type="hidden" value="paper" />
              <input name="props" type="hidden" value="pens" />

              <button
                type="submit"
                className="mt-2 w-full rounded-xl border-[3px] border-ink bg-hot py-4 font-display text-[20px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
              >
                Make me a game 🎈
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-y-[3px] border-ink bg-butter py-16 text-center">
        <div className="mx-auto max-w-[1180px] px-6">
          <h2 className="font-display text-[clamp(40px,5vw,64px)] font-extrabold leading-[.92] -tracking-[.03em]">
            Ready when you are.{" "}
            <span
              className="inline-block text-hot"
              style={{ animation: "brut-word-pop 1.8s ease-in-out infinite" }}
            >
              Now-ish?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-base leading-[1.5]">
            A new game appears in seconds. If it&apos;s not the vibe, regenerate. Nothing to install.
          </p>
          <Link
            href="/generate"
            className="mt-7 inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-ink px-5 py-3.5 font-bold text-cream shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
          >
            Start the party →
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="text-[12px] font-bold uppercase tracking-[.03em]">{label}</div>
      {children}
    </div>
  );
}

function Sticker({
  children,
  bg,
  rotate = false
}: {
  children: React.ReactNode;
  bg: string;
  rotate?: boolean;
}) {
  return (
    <div
      className={`-mr-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-ink text-[18px] shadow-brut-press ${bg} ${
        rotate ? "rotate-[8deg]" : ""
      }`}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Verify the page renders 200 and contains the new headline**

Run: `curl -s http://localhost:3000/ | grep -oE 'Just for tonight'`
Expected: `Just for tonight`

- [ ] **Step 3: Visual check (Chrome DevTools MCP or browser)**

Open `http://localhost:3000/` in a browser. Confirm:
- Bricolage Grotesque renders the headline
- Hot-pink swipe is visible on "Just for tonight."
- Form card has the chunky shadow and 1-CLICK DEMO sticker
- Closer band (butter background) is visible above the footer
- Footer shows the "Our safety promise" link
- Clicking the link opens the modal; clicking ✕, the backdrop, or pressing Esc closes it

- [ ] **Step 4: Commit**

```bash
git add apps/web/app/page.tsx
git commit -m "feat(web): rewrite home page in brutalist system, drop safety strip"
```

---

## Task 10: Restyle PlayerCountInput

**Files:**
- Modify: `apps/web/components/PlayerCountInput.tsx`

- [ ] **Step 1: Read current component**

Run: `cat apps/web/components/PlayerCountInput.tsx`

- [ ] **Step 2: Rewrite with brutalist treatment (preserve input `name` attributes)**

```tsx
// apps/web/components/PlayerCountInput.tsx
export function PlayerCountInput() {
  return (
    <div className="grid gap-2">
      <div className="text-[12px] font-bold uppercase tracking-[.03em]">How many of you</div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
        <input
          aria-label="Minimum players"
          name="minPlayers"
          type="number"
          min={1}
          defaultValue={2}
          className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
        />
        <span className="text-xl font-extrabold text-ink/30">→</span>
        <input
          aria-label="Maximum players"
          name="maxPlayers"
          type="number"
          min={1}
          defaultValue={6}
          className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
        />
      </div>
    </div>
  );
}
```

If the existing component is a default export, preserve that. Otherwise keep the named export — adjust whichever way `generate/page.tsx` imports it.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/PlayerCountInput.tsx
git commit -m "feat(web): restyle PlayerCountInput in brutalist system"
```

---

## Task 11: Restyle CircumstancesInput as chip recipe

**Files:**
- Modify: `apps/web/components/CircumstancesInput.tsx`

- [ ] **Step 1: Read current component**

Run: `cat apps/web/components/CircumstancesInput.tsx`

- [ ] **Step 2: Rewrite with chip recipe**

```tsx
// apps/web/components/CircumstancesInput.tsx
const circumstances = [
  {
    emoji: "🛋️",
    label: "Chill",
    value: "Friends relaxing indoors with paper, pens, and a 20-minute window."
  },
  {
    emoji: "🍕",
    label: "Party",
    value: "A cheerful group gathered around a table with snacks, phones away, paper, and pens."
  },
  {
    emoji: "🚗",
    label: "Waiting",
    value: "People waiting together with limited space, low energy, and a need for quick laughs."
  }
];

export function CircumstancesInput() {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-[12px] font-bold uppercase tracking-[.03em]">The vibe</legend>
      <div className="grid grid-cols-3 gap-2">
        {circumstances.map((item, index) => (
          <label
            key={item.label}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 border-ink bg-white px-1.5 py-2.5 text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm has-[:checked]:bg-butter has-[:checked]:shadow-brut-sm"
          >
            <input
              name="circumstances"
              type="radio"
              value={item.value}
              defaultChecked={index === 0}
              className="sr-only"
            />
            <span className="text-[22px] leading-none" aria-hidden="true">
              {item.emoji}
            </span>
            <span>{item.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
```

Preserve the export shape used by `generate/page.tsx`.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/CircumstancesInput.tsx
git commit -m "feat(web): restyle CircumstancesInput as brutalist chip selector"
```

---

## Task 12: Restyle GameTypeSelector

**Files:**
- Modify: `apps/web/components/GameTypeSelector.tsx`

- [ ] **Step 1: Read current component**

Run: `cat apps/web/components/GameTypeSelector.tsx`

- [ ] **Step 2: Rewrite as brutalist select**

```tsx
// apps/web/components/GameTypeSelector.tsx
export function GameTypeSelector() {
  return (
    <div className="grid gap-2">
      <label htmlFor="gameType" className="text-[12px] font-bold uppercase tracking-[.03em]">
        Game style
      </label>
      <select
        id="gameType"
        name="gameType"
        className="w-full appearance-none rounded-[10px] border-[3px] border-ink bg-white px-3.5 py-3 pr-9 text-sm font-semibold shadow-brut-sm"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231A1A1A' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 14px center"
        }}
      >
        <option value="creative">Creative</option>
        <option value="conversation">Conversation</option>
        <option value="puzzle">Puzzle</option>
        <option value="collaborative">Collaborative</option>
      </select>
    </div>
  );
}
```

Preserve the export shape used by `generate/page.tsx`.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/GameTypeSelector.tsx
git commit -m "feat(web): restyle GameTypeSelector in brutalist system"
```

---

## Task 13: Restyle AvailablePropsSelector

**Files:**
- Modify: `apps/web/components/AvailablePropsSelector.tsx`

- [ ] **Step 1: Read current component**

Run: `cat apps/web/components/AvailablePropsSelector.tsx`

- [ ] **Step 2: Rewrite preserving its current prop options + `name="props"` checkboxes**

Look at the existing options array in the current component; reuse the same option list and the same `name="props"` attribute so submission to `/games/preview` still works. The visual recipe is brutalist multi-select chips:

```tsx
// apps/web/components/AvailablePropsSelector.tsx
const props = [
  { value: "paper", emoji: "📄", label: "Paper" },
  { value: "pens", emoji: "✏️", label: "Pens" },
  { value: "timer", emoji: "⏱️", label: "Timer" },
  { value: "cards", emoji: "🃏", label: "Cards" },
  { value: "dice", emoji: "🎲", label: "Dice" },
  { value: "phone", emoji: "📱", label: "Phone" }
];

export function AvailablePropsSelector() {
  return (
    <fieldset className="grid gap-2">
      <legend className="text-[12px] font-bold uppercase tracking-[.03em]">Available props</legend>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {props.map((prop) => (
          <label
            key={prop.value}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 border-ink bg-white px-1.5 py-2.5 text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm has-[:checked]:bg-butter has-[:checked]:shadow-brut-sm"
          >
            <input
              name="props"
              type="checkbox"
              value={prop.value}
              defaultChecked={prop.value === "paper" || prop.value === "pens"}
              className="sr-only"
            />
            <span className="text-[22px] leading-none" aria-hidden="true">
              {prop.emoji}
            </span>
            <span>{prop.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
```

**Important:** If the current file's `props` list differs (different values or labels), use the current values — don't change the form submission contract. Only change the visual treatment and label texts cosmetically.

- [ ] **Step 3: Run typecheck**

Run: `pnpm --filter @bordom-ai/web typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/AvailablePropsSelector.tsx
git commit -m "feat(web): restyle AvailablePropsSelector as brutalist multi-select"
```

---

## Task 14: Restyle /generate and drop SafetyConstraintsNotice usage

**Files:**
- Modify: `apps/web/app/generate/page.tsx`

- [ ] **Step 1: Rewrite the page**

```tsx
// apps/web/app/generate/page.tsx
import { AvailablePropsSelector } from "../../components/AvailablePropsSelector";
import { CircumstancesInput } from "../../components/CircumstancesInput";
import { GameTypeSelector } from "../../components/GameTypeSelector";
import { PlayerCountInput } from "../../components/PlayerCountInput";

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
        <span
          className="h-2 w-2 rounded-full bg-mint"
          style={{ animation: "brut-pulse 1.6s infinite" }}
        />
        Set up
      </span>

      <h1 className="mt-6 font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
        Set up your party{" "}
        <span className="relative inline-block">
          <span className="relative z-10">buddy</span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-[-2%] right-[-2%] z-0 h-3.5 -skew-x-[8deg] bg-mint"
          />
        </span>
        .
      </h1>

      <p className="mt-5 max-w-[560px] text-[17px] leading-[1.55] text-ink/85">
        Pick the number of players, the vibe, and the props. The mock generator will turn it into a
        safe structured game preview.
      </p>

      <form
        action="/games/preview"
        className="mt-8 grid gap-6 rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl"
      >
        <PlayerCountInput />
        <CircumstancesInput />
        <GameTypeSelector />
        <AvailablePropsSelector />
        <button
          type="submit"
          className="mt-2 w-full rounded-xl border-[3px] border-ink bg-hot py-4 font-display text-[20px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Generate preview 🎲
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/generate`
Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/generate/page.tsx
git commit -m "feat(web): restyle /generate, drop SafetyConstraintsNotice"
```

---

## Task 15: Restyle /games/preview

**Files:**
- Modify: `apps/web/app/games/preview/page.tsx`

- [ ] **Step 1: Replace the page**

```tsx
// apps/web/app/games/preview/page.tsx
import { mockGenerateGame } from "@bordom-ai/ai";

type PreviewSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined, fallback: string) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected && selected.trim().length > 0 ? selected : fallback;
}

function all(value: string | string[] | undefined, fallback: string[]) {
  if (Array.isArray(value)) return value.length > 0 ? value : fallback;
  return value ? [value] : fallback;
}

function parsePositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(first(value, String(fallback)), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function GameSection({
  emoji,
  title,
  children
}: Readonly<{
  emoji: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl">
      <h2 className="flex items-center gap-3 font-display text-[24px] font-extrabold -tracking-[.02em]">
        <span
          className="grid h-10 w-10 place-items-center rounded-[10px] border-2 border-ink bg-white text-[22px] shadow-brut-sm"
          aria-hidden="true"
        >
          {emoji}
        </span>
        {title}
      </h2>
      <div className="mt-4 text-ink/85">{children}</div>
    </section>
  );
}

function FriendlyList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-[10px] border-2 border-ink bg-white px-3.5 py-2.5 text-[15px] leading-[1.5] shadow-brut-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Pill({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-sm font-bold shadow-brut-sm ${bg}`}
    >
      {children}
    </span>
  );
}

export default async function GeneratedGamePreviewPage({
  searchParams
}: {
  searchParams: Promise<PreviewSearchParams>;
}) {
  const params = await searchParams;
  const minPlayers = parsePositiveInt(params.minPlayers, 2);
  const maxPlayers = Math.max(parsePositiveInt(params.maxPlayers, 6), minPlayers);

  const game = mockGenerateGame({
    playerCount: { min: minPlayers, max: maxPlayers },
    circumstances: first(
      params.circumstances,
      "A relaxed group waiting indoors with paper and pens."
    ),
    gameType: first(params.gameType, "creative"),
    availableProps: all(params.props, ["paper", "pens", "timer"])
  });

  return (
    <main className="mx-auto max-w-[960px] px-6 py-10">
      <p className="text-[12px] font-bold uppercase tracking-[.08em] text-hot">
        Your party buddy cooked this up
      </p>
      <h1 className="mt-2 font-display text-[clamp(48px,7vw,80px)] font-extrabold leading-[.92] -tracking-[.03em]">
        {game.title}{" "}
        <span
          className="inline-block"
          style={{ animation: "brut-wiggle 2.2s ease-in-out infinite" }}
        >
          🎉
        </span>
      </h1>
      <p className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-ink/85">{game.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Pill bg="bg-sky">
          👥 {game.playerCount.min}-{game.playerCount.max} players
        </Pill>
        <Pill bg="bg-butter">⏱️ {game.durationMinutes} minutes</Pill>
        <Pill bg="bg-mint">🌱 Ages {game.ageRating}</Pill>
      </div>

      <div className="mt-8 grid gap-5">
        <GameSection emoji="🧰" title="Grab these">
          <FriendlyList items={game.requiredMaterials} />
        </GameSection>

        <GameSection emoji="🚀" title="Set it up">
          <FriendlyList items={game.setup} />
        </GameSection>

        <GameSection emoji="📜" title="Tiny rulebook, big fun">
          <FriendlyList items={game.rules} />
        </GameSection>

        <GameSection emoji="🔁" title="How a round flows">
          <FriendlyList items={game.gameplayLoop} />
        </GameSection>

        <GameSection emoji="🏆" title="Scoring and victory">
          <div className="grid gap-3">
            <FriendlyList items={game.scoring} />
            <p className="rounded-[12px] border-[3px] border-ink bg-hot px-4 py-3.5 font-display text-[18px] font-extrabold -tracking-[.02em] shadow-brut-lg">
              Winner moment: {game.winCondition}
            </p>
          </div>
        </GameSection>

        <GameSection emoji="🛟" title="Keep it comfy">
          <FriendlyList items={game.safetyNotes} />
        </GameSection>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify page renders**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/games/preview`
Expected: `200`

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/games/preview/page.tsx
git commit -m "feat(web): restyle /games/preview cards and pills in brutalist system"
```

---

## Task 16: Delete SafetyConstraintsNotice

**Files:**
- Delete: `apps/web/components/SafetyConstraintsNotice.tsx`

- [ ] **Step 1: Confirm nothing else imports it**

Run: `grep -rn "SafetyConstraintsNotice" apps/web --include='*.ts' --include='*.tsx'`
Expected: no matches (it should have been removed from `/generate` in Task 14)

- [ ] **Step 2: Delete the file**

Run: `rm apps/web/components/SafetyConstraintsNotice.tsx`

- [ ] **Step 3: Run typecheck + tests**

Run: `pnpm --filter @bordom-ai/web typecheck && pnpm --filter @bordom-ai/web test`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -u apps/web/components/SafetyConstraintsNotice.tsx
git commit -m "chore(web): drop SafetyConstraintsNotice; modal is now the only safety surface"
```

---

## Task 17: Full verification pass

- [ ] **Step 1: Repo-wide typecheck**

Run: `pnpm typecheck`
Expected: PASS across all workspaces

- [ ] **Step 2: Repo-wide lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Repo-wide tests**

Run: `pnpm test`
Expected: PASS (shared + ai existing tests; web's new safety + modal tests)

- [ ] **Step 4: Smoke test all three routes via curl**

Run: `for p in / /generate /games/preview; do curl -s -o /dev/null -w "$p %{http_code}\n" http://localhost:3000$p; done`
Expected: every route returns `200`

- [ ] **Step 5: Visual + interaction check in a browser**

Open `http://localhost:3000/` and verify:
- Bricolage Grotesque is loaded (no FOUT fallback after a moment)
- Hero blobs drift slowly
- Headline swipe + emoji animate
- Form chips toggle butter background + shadow when selected
- "Start the party" CTA has hover lift + active press effect
- Closer band shows "Now-ish?" pulsing
- Footer "Our safety promise" link opens the modal; ✕, backdrop click, and Esc all close it
- Tab into the modal: focus is trapped on the close button at minimum, returns to the trigger on close
- `/generate` and `/games/preview` use the same shared nav/footer and the brutalist treatment

Toggle OS-level "reduce motion" preference and confirm animations stop.

- [ ] **Step 6: Final commit (only if any verification step required a fix)**

If any of steps 1–5 surfaced a defect, fix it inline and commit. Otherwise no commit is needed; the prior task commits are the final state.
