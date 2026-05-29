import { CardTable } from "../../components/CardTable";

export default function PlayPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sky px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
          🃏 Card Table
        </span>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
          Deal the cards.
          <br />
          <span className="inline-block border-[3px] border-ink bg-sky px-3 shadow-brut">
            Play your hand.
          </span>
        </h1>
        <p className="mt-4 max-w-[480px] text-[16px] leading-[1.55] text-ink/80">
          Pick a game, deal your cards, drag to rearrange. Draw from the pile, pull from the discard, or lay cards on the table.
        </p>
      </div>
      <CardTable />
    </main>
  );
}
