import { BoardGame } from "../../components/BoardGame";

export default function BoardPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-lilac px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
          🎲 Board Game
        </span>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
          Build your board.
          <br />
          <span className="inline-block border-[3px] border-ink bg-hot px-3 text-paper shadow-brut">
            Roll &amp; play.
          </span>
        </h1>
        <p className="mt-4 max-w-[480px] text-[16px] leading-[1.55] text-ink/80">
          Generate a custom RPG board game. Pick your layout, add players, label your spaces — or let us fill them in.
        </p>
      </div>
      <BoardGame />
    </main>
  );
}
