"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClassicGame } from "../lib/classics";
import type { CardGameCategory } from "../lib/cardGames";

function GameCard({ game }: { game: ClassicGame }) {
  return (
    <div className="group flex flex-col rounded-[18px] border-[3px] border-ink bg-paper p-5 shadow-brut-lg">
      <div className="flex items-center justify-between">
        <span className="text-[32px]" aria-hidden="true">
          {game.emoji}
        </span>
        <span className="rounded-full border-2 border-ink bg-cream px-2.5 py-1 font-mono text-[12px] font-bold shadow-brut-sm">
          /g/{game.shortId}
        </span>
      </div>
      <Link href={`/g/${game.shortId}`}>
        <h3 className="mt-3 font-display text-[22px] font-extrabold leading-tight -tracking-[.02em] hover:underline">
          {game.spec.title}
        </h3>
      </Link>
      <p className="mt-2 text-[14px] leading-[1.5] text-ink/80">{game.blurb}</p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <div className="flex flex-wrap gap-1.5 text-[11px] font-bold uppercase tracking-[.05em]">
          <span className="rounded-full border-2 border-ink bg-sky px-2 py-0.5">
            {game.spec.playerCount.min}–{game.spec.playerCount.max} players
          </span>
          <span className="rounded-full border-2 border-ink bg-butter px-2 py-0.5">
            {game.spec.durationMinutes} min
          </span>
        </div>
        <Link
          href={`/g/${game.shortId}`}
          className="shrink-0 rounded-lg border-2 border-ink bg-mint px-3 py-1 font-display text-[12px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          Start game →
        </Link>
      </div>
    </div>
  );
}

const HEADER_COLORS = [
  "bg-hot",
  "bg-butter",
  "bg-mint",
  "bg-sky",
  "bg-lilac",
  "bg-butter"
] as const;

export function CardGameCategories({
  categories
}: {
  categories: ReadonlyArray<CardGameCategory>;
}) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {categories.map((category, index) => {
        const isOpen = openIds.has(category.id);
        const headerBg = HEADER_COLORS[index % HEADER_COLORS.length];
        return (
          <div
            key={category.id}
            className="overflow-hidden rounded-[18px] border-[3px] border-ink shadow-brut-lg"
          >
            {/* Header / toggle button */}
            <button
              onClick={() => toggle(category.id)}
              aria-expanded={isOpen}
              className={`flex w-full items-center justify-between gap-6 px-6 py-5 text-left transition-opacity hover:opacity-85 ${headerBg}`}
            >
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full border-2 border-ink bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
                  {category.name}
                </span>
                <h3 className="mt-2 font-display text-[clamp(22px,2.8vw,36px)] font-extrabold leading-[.95] -tracking-[.03em]">
                  {category.tagline}{" "}
                  <span
                    className="inline-block cursor-default select-none transition-transform duration-200 hover:scale-125 hover:rotate-12"
                    aria-hidden="true"
                  >
                    {category.emoji}
                  </span>
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden rounded-full border-2 border-ink bg-paper px-2.5 py-1 font-mono text-[12px] font-bold shadow-brut-sm sm:inline-block">
                  {category.games.length} game{category.games.length !== 1 ? "s" : ""}
                </span>
                {/* Chevron */}
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-ink text-cream shadow-brut-sm transition-transform duration-300"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 4.5L7 9.5L12 4.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </button>

            {/* Expandable game grid */}
            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="grid gap-5 border-t-[3px] border-ink bg-cream p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {category.games.map((game) => (
                    <GameCard key={game.shortId} game={game} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
