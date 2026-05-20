"use client";

import { useState } from "react";
import type { GameSpec } from "@bordon-ai/shared";
import { encodeGameForUrl } from "../lib/shareUrl";

type Props = {
  game: GameSpec;
};

export function ShareGameButton({ game }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/g/${encodeGameForUrl(game)}`;
    const shareData = { title: `Bordon.ai — ${game.title}`, url };

    const canNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare(shareData);

    if (canNativeShare) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this share link:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-xl border-[3px] border-ink bg-sky px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
    >
      {copied ? "Link copied ✓" : "Share game 🔗"}
    </button>
  );
}
