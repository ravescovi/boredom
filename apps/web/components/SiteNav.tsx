"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Single source of truth for both the desktop pill row and the mobile drawer.
const NAV_LINKS = [
  { href: "/talk", label: "💬 Talk" },
  { href: "/draw", label: "🎨 Draw" },
  { href: "/dice", label: "🎲 Dice" },
  { href: "/board", label: "🎯 Board" },
  { href: "/score", label: "🏅 Score" },
  { href: "/scoreboard", label: "🏆 Scoreboard" },
] as const;

const CTA = { href: "/generate", label: "Make a game →" } as const;

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-5">
      <Link
        href="/"
        className="font-display text-[22px] font-extrabold -tracking-[.04em] text-ink"
      >
        bordom<span className="text-hot">.</span>ai
      </Link>

      {/* Desktop: full pill row (unchanged from before). */}
      <div className="hidden items-center gap-3 md:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-brut-sm"
          >
            {link.label}
          </Link>
        ))}
        <Link
          href={CTA.href}
          className="rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-[13px] font-bold text-cream shadow-brut"
        >
          {CTA.label}
        </Link>
      </div>

      {/* Mobile: hamburger toggle. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink bg-paper shadow-brut-sm transition-transform active:translate-y-0.5 md:hidden"
      >
        <span className="relative block h-[14px] w-[20px]" aria-hidden="true">
          <span
            className="absolute left-0 block h-[2.5px] w-full rounded-full bg-ink transition-all duration-200"
            style={{ top: open ? 6 : 0, transform: open ? "rotate(45deg)" : "none" }}
          />
          <span
            className="absolute left-0 top-[6px] block h-[2.5px] w-full rounded-full bg-ink transition-all duration-200"
            style={{ opacity: open ? 0 : 1 }}
          />
          <span
            className="absolute left-0 block h-[2.5px] w-full rounded-full bg-ink transition-all duration-200"
            style={{ top: open ? 6 : 12, transform: open ? "rotate(-45deg)" : "none" }}
          />
        </span>
      </button>

      {/* Mobile drawer overlay. Sits above page content (modals use z-50). */}
      {open && (
        <div
          className="fixed inset-0 z-[60] md:hidden"
          role="dialog"
          aria-modal="true"
          id="mobile-menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-ink/40 backdrop-blur-sm"
            style={{ animation: "brut-backdrop-in 0.2s ease forwards" }}
          />
          <div
            className="absolute inset-x-0 top-0 border-b-[3px] border-ink bg-cream px-6 pb-6 shadow-brut-xl"
            style={{
              paddingTop: "calc(env(safe-area-inset-top) + 1.25rem)",
              animation: "brut-modal-in 0.22s cubic-bezier(.22,1,.36,1) forwards",
            }}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-[20px] font-extrabold -tracking-[.04em] text-ink">
                bordom<span className="text-hot">.</span>ai
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-paper text-[18px] font-bold shadow-brut-sm"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-2xl border-2 border-ink px-5 py-3.5 text-[16px] font-bold text-ink shadow-brut-sm ${
                      active ? "bg-butter" : "bg-paper"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href={CTA.href}
                onClick={() => setOpen(false)}
                className="mt-1 rounded-2xl border-2 border-ink bg-ink px-5 py-3.5 text-center text-[16px] font-bold text-cream shadow-brut"
              >
                {CTA.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
