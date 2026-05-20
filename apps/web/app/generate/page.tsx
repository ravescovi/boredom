// apps/web/app/generate/page.tsx
import { AvailablePropsSelector } from "../../components/AvailablePropsSelector";
import { CircumstancesInput } from "../../components/CircumstancesInput";
import { GameTypeSelector } from "../../components/GameTypeSelector";
import { PlayerCountInput } from "../../components/PlayerCountInput";

export default function GeneratePage() {
  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
        <span
          className="h-2 w-2 rounded-full bg-mint"
          style={{ animation: "brut-pulse 1.6s infinite" }}
        />
        Set up
      </span>

      <h1 className="mt-6 font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
        Set up your party{" "}
        <span className="relative inline-block">
          <span className="relative z-10">buddy</span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-[-2%] right-[-2%] z-0 h-3.5 -skew-x-[8deg] bg-mint"
          />
        </span>
        .
      </h1>

      <p className="mt-5 max-w-[560px] text-[17px] leading-[1.55] text-ink/85">
        Pick the number of players, the vibe, and the props. The mock generator will turn it into a
        safe structured game preview.
      </p>

      <form
        action="/games/preview"
        className="mt-8 grid gap-6 rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl"
      >
        <PlayerCountInput />
        <CircumstancesInput />
        <GameTypeSelector />
        <AvailablePropsSelector />
        <button
          type="submit"
          className="mt-2 w-full rounded-xl border-[3px] border-ink bg-hot py-4 font-display text-[20px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Generate preview 🎲
        </button>
      </form>
    </main>
  );
}
