"use client";

import { useState } from "react";
import type { GameSpec } from "@bordon-ai/shared";
import { encodeGameForUrl } from "../lib/shareUrl";

type Props = {
  game: GameSpec;
  initialShortId?: string;
};

export function ShareGameButton({ game, initialShortId }: Props) {
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState(false);
  const [shortId, setShortId] = useState<string | undefined>(initialShortId);

  async function resolveShortId(): Promise<string> {
    if (shortId) return shortId;
    const res = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec: game })
    });
    if (!res.ok) {
      throw new Error("Failed to create short link");
    }
    const data = (await res.json()) as { shortId: string };
    setShortId(data.shortId);
    return data.shortId;
  }

  async function buildUrl(): Promise<string> {
    const origin = window.location.origin;
    try {
      const id = await resolveShortId();
      return `${origin}/g/${id}`;
    } catch {
      // Fall back to the long base64 URL if the API is unavailable.
      return `${origin}/g/${encodeGameForUrl(game)}`;
    }
  }

  async function handleShare() {
    if (pending) return;
    setPending(true);
    try {
      const url = await buildUrl();
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
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={pending}
      className="rounded-xl border-[3px] border-ink bg-sky px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] disabled:opacity-80"
    >
      {pending ? "Preparing…" : copied ? "Link copied ✓" : "Share game 🔗"}
    </button>
  );
}
