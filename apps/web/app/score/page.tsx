import { ScoreKeeper } from "../../components/ScoreKeeper";

export default function ScorePage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-10">
      <div className="mb-8">
        <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-hot/20 px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
          🏅 Score Keeper
        </span>
        <h1 className="mt-4 font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
          Keep score.
          <br />
          <span className="inline-block border-[3px] border-ink bg-hot px-3 text-white shadow-brut">
            Stay honest.
          </span>
        </h1>
        <p className="mt-4 max-w-[480px] text-[16px] leading-[1.55] text-ink/80">
          Set your players, enter scores round by round. Your progress is saved automatically.
        </p>
      </div>
      <ScoreKeeper />
    </main>
  );
}
