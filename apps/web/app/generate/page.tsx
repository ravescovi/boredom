import { AvailablePropsSelector } from "../../components/AvailablePropsSelector";
import { CircumstancesInput } from "../../components/CircumstancesInput";
import { GameTypeSelector } from "../../components/GameTypeSelector";
import { PlayerCountInput } from "../../components/PlayerCountInput";
import { SafetyConstraintsNotice } from "../../components/SafetyConstraintsNotice";

export default function GeneratePage() {
  return (
    <main className="min-h-screen bg-[#fff7d6] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          <h1 className="text-4xl font-bold text-[#251646]">Set up your party buddy</h1>
          <p className="mt-3 max-w-2xl text-[#4d3f66]">
            Pick the number of players, the vibe, and the props. The mock generator will turn it
            into a safe structured game preview.
          </p>

          <form action="/games/preview" className="mt-8 grid gap-6">
            <PlayerCountInput />
            <CircumstancesInput />
            <GameTypeSelector />
            <AvailablePropsSelector />
            <button className="w-fit rounded-md bg-[#ff5c8a] px-5 py-3 font-semibold text-white">
              Generate preview 🎲
            </button>
          </form>
        </section>

        <SafetyConstraintsNotice />
      </div>
    </main>
  );
}
