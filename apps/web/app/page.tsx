import Link from "next/link";

const circumstances = [
  {
    emoji: "🛋️",
    label: "Chill",
    value: "Friends relaxing indoors with paper, pens, and a 20-minute window."
  },
  {
    emoji: "🍕",
    label: "Party",
    value: "A cheerful group gathered around a table with snacks, phones away, paper, and pens."
  },
  {
    emoji: "🚗",
    label: "Waiting",
    value: "People waiting together with limited space, low energy, and a need for quick laughs."
  }
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden py-6 pb-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-[10%] -top-[10%] h-[520px] w-[520px] rounded-full opacity-60"
          style={{
            background: "radial-gradient(circle, var(--color-butter) 0%, transparent 65%)",
            animation: "brut-drift-a 14s ease-in-out infinite"
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[20%] -left-[10%] h-[420px] w-[420px] rounded-full opacity-55"
          style={{
            background: "radial-gradient(circle, var(--color-lilac) 0%, transparent 65%)",
            animation: "brut-drift-b 16s ease-in-out infinite"
          }}
        />

        <div className="container relative mx-auto grid max-w-[1180px] gap-14 px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
              <span
                className="h-2 w-2 rounded-full bg-mint"
                style={{ animation: "brut-pulse 1.6s infinite" }}
              />
              Fresh games, on demand
            </span>

            <h1 className="mt-6 font-display text-[clamp(48px,7vw,96px)] font-extrabold leading-[.92] -tracking-[.03em]">
              A brand-new
              <br />
              party game.
              <br />
              <span
                className="inline-block border-[3px] border-ink bg-hot px-3 shadow-brut"
                style={{ animation: "brut-swipe-pop 3.4s ease-in-out infinite" }}
              >
                Just for tonight.
              </span>{" "}
              <span
                className="inline-block origin-[50%_70%]"
                style={{ animation: "brut-wiggle 2.2s ease-in-out infinite" }}
              >
                🎉
              </span>
            </h1>

            <p className="mt-7 max-w-[520px] text-[18px] leading-[1.55] text-ink/85">
              Tell us how many friends, what&apos;s around, and the vibe — we&apos;ll invent a game in
              10 seconds. Original, easy to learn, ready to play.
            </p>

            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-ink px-5 py-3.5 font-bold text-cream shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
              >
                Start the party 🎉
              </Link>
              <Link
                href="/games/preview"
                className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-paper px-5 py-3.5 font-bold text-ink shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
              >
                Peek at a game
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-3.5">
              <div className="flex">
                <Sticker bg="bg-butter">🪩</Sticker>
                <Sticker bg="bg-mint">🎲</Sticker>
                <Sticker bg="bg-sky" rotate>
                  🧩
                </Sticker>
                <Sticker bg="bg-hot">💬</Sticker>
              </div>
              <p className="text-[13px] font-medium leading-tight">
                <b className="font-bold">4 styles</b> · creative · conversation · puzzle · collab
              </p>
            </div>
          </div>

          <form
            action="/games/preview"
            className="relative rounded-[18px] border-[3px] border-ink bg-paper px-6 py-6 shadow-brut-xl"
          >
            <span
              className="absolute -top-4 right-5 rounded-full border-2 border-ink bg-mint px-3 py-1.5 text-[11px] font-extrabold shadow-brut-sm"
              style={{ animation: "brut-badge-bob 2.4s ease-in-out infinite" }}
            >
              ⚡ 1-CLICK DEMO
            </span>

            <h2 className="font-display text-[26px] font-extrabold leading-none -tracking-[.03em]">
              Quick party pick
            </h2>
            <p className="mt-1 text-[13px] text-ink/70">Skip the setup — get a game in one tap.</p>

            <div className="mt-5 grid gap-4">
              <Field label="How many of you">
                <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2.5">
                  <input
                    aria-label="Minimum players"
                    name="minPlayers"
                    type="number"
                    min={1}
                    defaultValue={2}
                    className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
                  />
                  <span className="text-xl font-extrabold text-ink/30">→</span>
                  <input
                    aria-label="Maximum players"
                    name="maxPlayers"
                    type="number"
                    min={1}
                    defaultValue={6}
                    className="w-full rounded-[10px] border-[3px] border-ink bg-white p-3 text-center font-display text-2xl font-extrabold shadow-brut-sm"
                  />
                </div>
              </Field>

              <Field label="The vibe">
                <div className="grid grid-cols-3 gap-2">
                  {circumstances.map((item, index) => (
                    <label
                      key={item.label}
                      className="flex cursor-pointer flex-col items-center gap-1 rounded-[10px] border-2 border-ink bg-white px-1.5 py-2.5 text-xs font-semibold transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brut-sm has-[:checked]:bg-butter has-[:checked]:shadow-brut-sm"
                    >
                      <input
                        name="circumstances"
                        type="radio"
                        value={item.value}
                        defaultChecked={index === 0}
                        className="sr-only"
                      />
                      <span className="text-[22px] leading-none" aria-hidden="true">
                        {item.emoji}
                      </span>
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Game style">
                <select
                  name="gameType"
                  className="w-full appearance-none rounded-[10px] border-[3px] border-ink bg-white px-3.5 py-3 pr-9 text-sm font-semibold shadow-brut-sm"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231A1A1A' d='M6 8L0 0h12z'/%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center"
                  }}
                >
                  <option value="creative">Creative</option>
                  <option value="conversation">Conversation</option>
                  <option value="puzzle">Puzzle</option>
                  <option value="collaborative">Collaborative</option>
                </select>
              </Field>

              <input name="props" type="hidden" value="paper" />
              <input name="props" type="hidden" value="pens" />

              <button
                type="submit"
                className="mt-2 w-full rounded-xl border-[3px] border-ink bg-hot py-4 font-display text-[20px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
              >
                Make me a game 🎈
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="border-y-[3px] border-ink bg-butter py-16 text-center">
        <div className="mx-auto max-w-[1180px] px-6">
          <h2 className="font-display text-[clamp(40px,5vw,64px)] font-extrabold leading-[.92] -tracking-[.03em]">
            Ready when you are.{" "}
            <span
              className="inline-block text-hot"
              style={{ animation: "brut-word-pop 1.8s ease-in-out infinite" }}
            >
              Now-ish?
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-base leading-[1.5]">
            A new game appears in seconds. If it&apos;s not the vibe, regenerate. Nothing to install.
          </p>
          <Link
            href="/generate"
            className="mt-7 inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-ink px-5 py-3.5 font-bold text-cream shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
          >
            Start the party →
          </Link>
        </div>
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="text-[12px] font-bold uppercase tracking-[.03em]">{label}</div>
      {children}
    </div>
  );
}

function Sticker({
  children,
  bg,
  rotate = false
}: {
  children: React.ReactNode;
  bg: string;
  rotate?: boolean;
}) {
  return (
    <div
      className={`-mr-2.5 grid h-9 w-9 place-items-center rounded-full border-2 border-ink text-[18px] shadow-brut-press ${bg} ${
        rotate ? "rotate-[8deg]" : ""
      }`}
    >
      {children}
    </div>
  );
}
