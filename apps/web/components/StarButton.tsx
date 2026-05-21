"use client";

import { useState } from "react";

type Props = {
  shortId: string;
  initialScore: number;
};

export function StarButton({ shortId, initialScore }: Props) {
  const [score, setScore] = useState(initialScore);
  const [pending, setPending] = useState(false);
  const [starred, setStarred] = useState(false);

  async function handleStar() {
    if (pending || starred) return;
    setPending(true);
    try {
      const res = await fetch(`/api/games/${shortId}/star`, { method: "POST" });
      if (!res.ok) return;
      const data = (await res.json()) as { score: number; alreadyStarred?: boolean };
      setScore(data.score);
      setStarred(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleStar}
      disabled={pending || starred}
      aria-pressed={starred}
      className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-butter px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] disabled:opacity-80"
    >
      <span aria-hidden="true">{starred ? "⭐" : "☆"}</span>
      {starred ? "Starred" : "Star this game"}
      <span className="rounded-full border-2 border-ink bg-paper px-2 py-0.5 text-[13px] shadow-brut-sm">
        {score}
      </span>
    </button>
  );
}
