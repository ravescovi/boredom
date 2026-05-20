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
