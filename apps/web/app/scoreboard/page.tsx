import Link from "next/link";
import { CLASSIC_GAMES } from "../../lib/classics";
import { listScoreboard, type GameRecord } from "../../lib/games";
import { StarButton } from "../../components/StarButton";

export const dynamic = "force-dynamic";

type Row = {
  shortId: string;
  title: string;
  summary: string;
  score: number;
  isClassic: boolean;
};

async function loadRows(): Promise<{ rows: Row[]; usingFallback: boolean }> {
  try {
    const rows = await listScoreboard(50);
    return { rows: rows.map(toRow), usingFallback: false };
  } catch {
    const fallback = CLASSIC_GAMES.map((c) => ({
      shortId: c.shortId,
      title: c.spec.title,
      summary: c.spec.summary,
      score: 0,
      isClassic: true
    }));
    return { rows: fallback, usingFallback: true };
  }
}

function toRow(r: GameRecord): Row {
  return {
    shortId: r.shortId,
    title: r.title,
    summary: r.summary,
    score: r.score,
    isClassic: r.isClassic
  };
}

export default async function ScoreboardPage() {
  const { rows, usingFallback } = await loadRows();

  return (
    <main className="mx-auto max-w-[920px] px-6 py-12">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
        <span
          className="h-2 w-2 rounded-full bg-hot"
          style={{ animation: "brut-pulse 1.6s infinite" }}
        />
        Scoreboard
      </span>

      <h1 className="mt-6 font-display text-[clamp(40px,6vw,68px)] font-extrabold leading-[.95] -tracking-[.03em]">
        Top games <span className="text-hot">⭐</span>
      </h1>

      <p className="mt-4 max-w-[560px] text-[17px] leading-[1.55] text-ink/85">
        Ranked by stars from players. Classic staples are seeded at zero — generated games join the
        board once someone shares them.
      </p>

      {usingFallback && (
        <p className="mt-4 inline-block rounded-[12px] border-2 border-ink bg-lilac px-3.5 py-2 text-[13px] font-semibold shadow-brut-sm">
          Showing classics only — the database isn&apos;t reachable right now.
        </p>
      )}

      <ol className="mt-8 grid gap-3">
        {rows.length === 0 && (
          <li className="rounded-[14px] border-[3px] border-ink bg-paper p-5 text-[15px] shadow-brut-lg">
            No games yet. <Link className="font-bold underline" href="/generate">Make one</Link> to start the board.
          </li>
        )}
        {rows.map((row, i) => (
          <li key={row.shortId}>
            <div className="relative grid grid-cols-[44px_1fr_auto] items-center gap-4 rounded-[14px] border-[3px] border-ink bg-paper p-4 shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] focus-within:-translate-x-0.5 focus-within:-translate-y-0.5">
              <Link
                href={`/g/${row.shortId}`}
                aria-label={`Open ${row.title}`}
                className="absolute inset-0 rounded-[14px] focus:outline-none focus-visible:ring-4 focus-visible:ring-hot"
              />
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-cream font-display text-[18px] font-extrabold shadow-brut-sm">
                {i + 1}
              </span>
              <div className="relative min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[20px] font-extrabold leading-tight -tracking-[.02em]">
                    {row.title}
                  </span>
                  {row.isClassic && (
                    <span className="rounded-full border-2 border-ink bg-butter px-2 py-0.5 text-[11px] font-bold uppercase tracking-[.05em] shadow-brut-sm">
                      Classic
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] leading-[1.45] text-ink/75">
                  {row.summary}
                </p>
                <span className="mt-1.5 inline-block rounded-full border-2 border-ink bg-cream px-2 py-0.5 font-mono text-[11px] font-bold shadow-brut-sm">
                  /g/{row.shortId}
                </span>
              </div>
              {usingFallback ? (
                <span className="relative inline-flex items-center gap-1.5 rounded-xl border-[3px] border-ink bg-hot px-3 py-2 font-display text-[18px] font-extrabold shadow-brut-sm">
                  ⭐ {row.score}
                </span>
              ) : (
                <StarButton shortId={row.shortId} initialScore={row.score} compact />
              )}
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
