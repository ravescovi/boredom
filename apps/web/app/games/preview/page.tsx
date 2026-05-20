// apps/web/app/games/preview/page.tsx
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
    <section className="rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl">
      <h2 className="flex items-center gap-3 font-display text-[24px] font-extrabold -tracking-[.02em]">
        <span
          className="grid h-10 w-10 place-items-center rounded-[10px] border-2 border-ink bg-white text-[22px] shadow-brut-sm"
          aria-hidden="true"
        >
          {emoji}
        </span>
        {title}
      </h2>
      <div className="mt-4 text-ink/85">{children}</div>
    </section>
  );
}

function FriendlyList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-[10px] border-2 border-ink bg-white px-3.5 py-2.5 text-[15px] leading-[1.5] shadow-brut-sm"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function Pill({ bg, children }: { bg: string; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3.5 py-2 text-sm font-bold shadow-brut-sm ${bg}`}
    >
      {children}
    </span>
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
    <main className="mx-auto max-w-[960px] px-6 py-10">
      <p className="text-[12px] font-bold uppercase tracking-[.08em] text-hot">
        Your party buddy cooked this up
      </p>
      <h1 className="mt-2 font-display text-[clamp(48px,7vw,80px)] font-extrabold leading-[.92] -tracking-[.03em]">
        {game.title}{" "}
        <span
          className="inline-block"
          style={{ animation: "brut-wiggle 2.2s ease-in-out infinite" }}
        >
          🎉
        </span>
      </h1>
      <p className="mt-4 max-w-[640px] text-[17px] leading-[1.55] text-ink/85">{game.summary}</p>

      <div className="mt-6 flex flex-wrap gap-2.5">
        <Pill bg="bg-sky">
          👥 {game.playerCount.min}-{game.playerCount.max} players
        </Pill>
        <Pill bg="bg-butter">⏱️ {game.durationMinutes} minutes</Pill>
        <Pill bg="bg-mint">🌱 Ages {game.ageRating}</Pill>
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
            <p className="rounded-[12px] border-[3px] border-ink bg-hot px-4 py-3.5 font-display text-[18px] font-extrabold -tracking-[.02em] shadow-brut-lg">
              Winner moment: {game.winCondition}
            </p>
          </div>
        </GameSection>

        <GameSection emoji="🛟" title="Keep it comfy">
          <FriendlyList items={game.safetyNotes} />
        </GameSection>
      </div>
    </main>
  );
}
