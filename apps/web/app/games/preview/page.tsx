import { mockGenerateGame } from "@bordon-ai/ai";

type PreviewSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined, fallback: string) {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected && selected.trim().length > 0 ? selected : fallback;
}

function all(value: string | string[] | undefined, fallback: string[]) {
  if (Array.isArray(value)) return value.length > 0 ? value : fallback;
  return value ? [value] : fallback;
}

function parsePositiveInt(value: string | string[] | undefined, fallback: number) {
  const parsed = Number.parseInt(first(value, String(fallback)), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function GameSection({
  emoji,
  title,
  children
}: Readonly<{
  emoji: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-md border border-[#ffd166] bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#251646]">
        <span aria-hidden="true">{emoji}</span>
        {title}
      </h2>
      <div className="mt-4 text-[#4d3f66]">{children}</div>
    </section>
  );
}

function FriendlyList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="rounded-md bg-[#fff7d6] px-3 py-2 leading-7">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function GeneratedGamePreviewPage({
  searchParams
}: {
  searchParams: Promise<PreviewSearchParams>;
}) {
  const params = await searchParams;
  const minPlayers = parsePositiveInt(params.minPlayers, 2);
  const maxPlayers = Math.max(parsePositiveInt(params.maxPlayers, 6), minPlayers);

  const game = mockGenerateGame({
    playerCount: { min: minPlayers, max: maxPlayers },
    circumstances: first(
      params.circumstances,
      "A relaxed group waiting indoors with paper and pens."
    ),
    gameType: first(params.gameType, "creative"),
    availableProps: all(params.props, ["paper", "pens", "timer"])
  });

  return (
    <main className="min-h-screen bg-[#fff7d6] px-6 py-10">
      <article className="mx-auto max-w-5xl">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#11836f]">
          Your party buddy cooked this up
        </p>
        <h1 className="text-5xl font-bold text-[#251646]">{game.title} 🎉</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4d3f66]">{game.summary}</p>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#251646]">
          <span className="rounded-full bg-[#7bdff2] px-4 py-2">
            👥 {game.playerCount.min}-{game.playerCount.max} players
          </span>
          <span className="rounded-full bg-[#ffd166] px-4 py-2">
            ⏱️ {game.durationMinutes} minutes
          </span>
          <span className="rounded-full bg-[#b8f2c8] px-4 py-2">🌱 Ages {game.ageRating}</span>
        </div>

        <div className="mt-8 grid gap-5">
          <GameSection emoji="🧰" title="Grab these">
            <FriendlyList items={game.requiredMaterials} />
          </GameSection>

          <GameSection emoji="🚀" title="Set it up">
            <FriendlyList items={game.setup} />
          </GameSection>

          <GameSection emoji="📜" title="Tiny rulebook, big fun">
            <FriendlyList items={game.rules} />
          </GameSection>

          <GameSection emoji="🔁" title="How a round flows">
            <FriendlyList items={game.gameplayLoop} />
          </GameSection>

          <GameSection emoji="🏆" title="Scoring and victory">
            <div className="grid gap-3">
              <FriendlyList items={game.scoring} />
              <p className="rounded-md bg-[#ffedf3] px-3 py-2 font-semibold leading-7 text-[#251646]">
                Winner moment: {game.winCondition}
              </p>
            </div>
          </GameSection>

          <GameSection emoji="🛟" title="Keep it comfy">
            <FriendlyList items={game.safetyNotes} />
          </GameSection>
        </div>
      </article>
    </main>
  );
}
