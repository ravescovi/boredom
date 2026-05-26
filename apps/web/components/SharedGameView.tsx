"use client";

import Link from "next/link";
import { useState } from "react";
import type { GameSpec } from "@bordom-ai/shared";
import { GameRunner } from "./GameRunner";
import { GeneratedGameView } from "./GeneratedGameView";
import { ShareGameButton } from "./ShareGameButton";
import { StarButton } from "./StarButton";

type Props = {
  spec: GameSpec;
  shortId?: string;
  score?: number;
};

export function SharedGameView({ spec, shortId, score }: Props) {
  const [showRunner, setShowRunner] = useState(false);

  return (
    <>
      <GeneratedGameView game={spec} onStartGame={() => setShowRunner(true)} />

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setShowRunner(true)}
          className="rounded-xl border-[3px] border-ink bg-mint px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Start game 🎮
        </button>
        <Link
          href="/generate"
          className="rounded-xl border-[3px] border-ink bg-hot px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Make your own 🎲
        </Link>
        {shortId && score !== undefined && (
          <StarButton shortId={shortId} initialScore={score} />
        )}
        <ShareGameButton game={spec} initialShortId={shortId} />
      </div>

      {showRunner && <GameRunner game={spec} onClose={() => setShowRunner(false)} />}
    </>
  );
}
