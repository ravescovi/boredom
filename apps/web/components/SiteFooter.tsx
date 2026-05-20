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
