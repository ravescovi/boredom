import Link from "next/link";

const safetyItems = [
  { emoji: "🥤", title: "No drinking games", note: "Fun stays clear-headed." },
  { emoji: "🎲", title: "No gambling", note: "No bets, wagers, or stakes." },
  { emoji: "🛋️", title: "No physical risk", note: "Designed for safe, cozy play." },
  { emoji: "✨", title: "Original rules only", note: "No franchise copycats." }
];

const circumstances = [
  {
    emoji: "🛋️",
    label: "Chill hangout",
    value: "Friends relaxing indoors with paper, pens, and a 20-minute window."
  },
  {
    emoji: "🍕",
    label: "Party table",
    value: "A cheerful group gathered around a table with snacks, phones away, paper, and pens."
  },
  {
    emoji: "🚗",
    label: "Waiting around",
    value: "People waiting together with limited space, low energy, and a need for quick laughs."
  }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fff7d6]">
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:py-16">
        <div>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#11836f]">
            Bordon.ai 🎉
          </p>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight text-[#251646] sm:text-6xl">
            Your favorite party buddy for instant safe games.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4d3f66]">
            Pick the number of players, tap the vibe, choose a game style, and let Bordon.ai whip up
            a structured ruleset that stays safe, original, and ready to play.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/generate"
              className="rounded-md bg-[#ff5c8a] px-5 py-3 font-semibold text-white shadow-sm"
            >
              Start the party
            </Link>
            <Link
              href="/games/preview"
              className="rounded-md border border-[#ffd166] bg-white px-5 py-3 font-semibold text-[#251646]"
            >
              Peek at a game
            </Link>
          </div>
        </div>

        <form
          action="/games/preview"
          className="rounded-md border-2 border-[#ffd166] bg-white p-5 shadow-[0_18px_50px_rgba(255,92,138,0.18)]"
        >
          <h2 className="text-xl font-semibold text-[#251646]">Quick party pick</h2>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#4d3f66]">Number of players</span>
              <div className="grid grid-cols-2 gap-3">
                <input
                  aria-label="Minimum players"
                  name="minPlayers"
                  type="number"
                  min={1}
                  defaultValue={2}
                  className="rounded-md border border-[#ffd166] px-3 py-2"
                />
                <input
                  aria-label="Maximum players"
                  name="maxPlayers"
                  type="number"
                  min={1}
                  defaultValue={6}
                  className="rounded-md border border-[#ffd166] px-3 py-2"
                />
              </div>
            </label>
            <fieldset className="grid gap-2">
              <legend className="text-sm font-medium text-[#4d3f66]">Circumstances</legend>
              <div className="grid gap-2">
                {circumstances.map((item, index) => (
                  <label
                    key={item.label}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-[#ffd166] bg-[#fffdf2] px-3 py-2 text-sm font-medium text-[#251646]"
                  >
                    <input
                      name="circumstances"
                      type="radio"
                      value={item.value}
                      defaultChecked={index === 0}
                    />
                    <span className="text-xl" aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-[#4d3f66]">Game type</span>
              <select name="gameType" className="rounded-md border border-[#ffd166] px-3 py-2">
                <option value="creative">Creative</option>
                <option value="conversation">Conversation</option>
                <option value="puzzle">Puzzle</option>
                <option value="collaborative">Collaborative</option>
              </select>
            </label>
            <input name="props" type="hidden" value="paper" />
            <input name="props" type="hidden" value="pens" />
            <button className="rounded-md bg-[#11836f] px-5 py-3 font-semibold text-white">
              Make me a game 🎈
            </button>
          </div>
        </form>
      </section>

      <section className="border-t border-[#ffd166] bg-[#7bdff2] px-6 py-8">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {safetyItems.map((item) => (
            <div key={item.title} className="rounded-md border border-white bg-white p-4">
              <p className="text-2xl" aria-hidden="true">
                {item.emoji}
              </p>
              <p className="mt-2 font-semibold text-[#251646]">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#4d3f66]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
