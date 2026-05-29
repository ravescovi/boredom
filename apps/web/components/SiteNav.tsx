import Link from "next/link";

export function SiteNav() {
  return (
    <nav className="mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-6 py-5">
      <Link
        href="/"
        className="font-display text-[22px] font-extrabold -tracking-[.04em] text-ink"
      >
        bordom<span className="text-hot">.</span>ai
      </Link>
      <div className="flex items-center gap-3">
        <Link
          href="/talk"
          className="rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-brut-sm"
        >
          💬 Talk
        </Link>
        <Link
          href="/draw"
          className="rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-brut-sm"
        >
          🎨 Draw
        </Link>
        <Link
          href="/dice"
          className="rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-brut-sm"
        >
          🎲 Dice
        </Link>
        <Link
          href="/board"
          className="rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-brut-sm"
        >
          🎯 Board
        </Link>
        <Link
          href="/scoreboard"
          className="rounded-full border-2 border-ink bg-paper px-4 py-2.5 text-[13px] font-bold text-ink shadow-brut-sm"
        >
          🏆 Scoreboard
        </Link>
        <Link
          href="/generate"
          className="rounded-full border-2 border-ink bg-ink px-4 py-2.5 text-[13px] font-bold text-cream shadow-brut"
        >
          Make a game →
        </Link>
      </div>
    </nav>
  );
}
