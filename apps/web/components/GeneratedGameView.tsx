import type { GameSpec } from "@bordon-ai/shared";
import { renderInlineMarkdown } from "../lib/inlineMarkdown";

type Props = {
  game: GameSpec;
};

function Card({
  emoji,
  title,
  tone = "paper",
  children
}: Readonly<{
  emoji: string;
  title: string;
  tone?: "paper" | "butter" | "mint" | "sky" | "lilac";
  children: React.ReactNode;
}>) {
  const toneClass = {
    paper: "bg-paper",
    butter: "bg-butter",
    mint: "bg-mint",
    sky: "bg-sky",
    lilac: "bg-lilac"
  }[tone];
  return (
    <section
      className={`rounded-[18px] border-[3px] border-ink ${toneClass} p-6 shadow-brut-lg`}
    >
      <h2 className="flex items-center gap-2 font-display text-[22px] font-extrabold -tracking-[.02em]">
        <span aria-hidden="true">{emoji}</span>
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-[1.6] text-ink/90">{children}</div>
    </section>
  );
}

function NumberedList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ol className="grid gap-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white font-display text-[14px] font-extrabold shadow-brut-sm"
          >
            {i + 1}
          </span>
          <span className="pt-0.5">{renderInlineMarkdown(item)}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="grid gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
          <span>{renderInlineMarkdown(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function Pill({
  children,
  tone
}: Readonly<{
  children: React.ReactNode;
  tone: "butter" | "mint" | "sky" | "hot" | "lilac";
}>) {
  const toneClass = {
    butter: "bg-butter",
    mint: "bg-mint",
    sky: "bg-sky",
    hot: "bg-hot",
    lilac: "bg-lilac"
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink ${toneClass} px-3.5 py-1.5 text-[13px] font-extrabold shadow-brut-sm`}
    >
      {children}
    </span>
  );
}

export function GeneratedGameView({ game }: Props) {
  return (
    <article className="grid gap-6">
      <header className="grid gap-4">
        <h1 className="font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
          {game.title}
        </h1>
        <p className="max-w-[640px] text-[18px] leading-[1.55] text-ink/85">
          {renderInlineMarkdown(game.summary)}
        </p>
        <div className="flex flex-wrap gap-2">
          <Pill tone="sky">
            👥 {game.playerCount.min}-{game.playerCount.max} players
          </Pill>
          <Pill tone="butter">⏱️ {game.durationMinutes} min</Pill>
          <Pill tone="mint">🌱 Ages {game.ageRating}</Pill>
        </div>
      </header>

      {game.requiredMaterials.length > 0 && (
        <Card emoji="🧰" title="Grab these" tone="paper">
          <BulletList items={game.requiredMaterials} />
        </Card>
      )}

      <Card emoji="🚀" title="Set it up" tone="paper">
        <NumberedList items={game.setup} />
      </Card>

      <Card emoji="📜" title="Rules" tone="paper">
        <BulletList items={game.rules} />
      </Card>

      <Card emoji="🔁" title="Turn structure" tone="paper">
        <NumberedList items={game.turnStructure} />
      </Card>

      <Card emoji="🌀" title="How a round flows" tone="paper">
        <NumberedList items={game.gameplayLoop} />
      </Card>

      <Card emoji="🏆" title="Scoring & win condition" tone="butter">
        <div className="grid gap-4">
          <BulletList items={game.scoring} />
          <p className="rounded-[10px] border-[3px] border-ink bg-paper px-4 py-3 text-[15px] font-semibold leading-[1.5]">
            <span className="mr-2 font-display text-[14px] font-extrabold uppercase tracking-[.05em]">
              Winner:
            </span>
            {renderInlineMarkdown(game.winCondition)}
          </p>
        </div>
      </Card>

      {game.edgeCases.length > 0 && (
        <Card emoji="🧩" title="Edge cases" tone="paper">
          <BulletList items={game.edgeCases} />
        </Card>
      )}

      {game.variants.length > 0 && (
        <Card emoji="🎨" title="Variants" tone="lilac">
          <BulletList items={game.variants} />
        </Card>
      )}

      <Card emoji="🛟" title="Keep it comfy" tone="mint">
        <BulletList items={game.safetyNotes} />
      </Card>
    </article>
  );
}
