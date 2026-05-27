import { notFound } from "next/navigation";
import type { GameSpec } from "@bordom-ai/shared";
import { SharedGameView } from "../../../components/SharedGameView";
import { findClassic } from "../../../lib/classics";
import { findCardGame } from "../../../lib/cardGames";
import { ensureClassicSeeded, findGameByShortId } from "../../../lib/games";
import { decodeGameFromUrl } from "../../../lib/shareUrl";
import { isShortId } from "../../../lib/shortId";

type Props = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

type Resolved =
  | { kind: "stored"; shortId: string; spec: GameSpec; score: number; isClassic: boolean }
  | { kind: "legacy"; spec: GameSpec };

async function resolve(id: string): Promise<Resolved | null> {
  const upper = id.toUpperCase();
  if (isShortId(upper)) {
    try {
      const existing = await findGameByShortId(upper);
      if (existing) {
        return {
          kind: "stored",
          shortId: existing.shortId,
          spec: existing.spec,
          score: existing.score,
          isClassic: existing.isClassic
        };
      }
      const classic = findClassic(upper) ?? findCardGame(upper);
      if (classic) {
        const seeded = await ensureClassicSeeded(classic);
        return {
          kind: "stored",
          shortId: seeded.shortId,
          spec: seeded.spec,
          score: seeded.score,
          isClassic: true
        };
      }
    } catch {
      // DB unavailable — classics and card games still resolve from static data.
      const classic = findClassic(upper) ?? findCardGame(upper);
      if (classic) {
        return {
          kind: "legacy",
          spec: classic.spec
        };
      }
    }
  }

  const legacy = decodeGameFromUrl(id);
  return legacy ? { kind: "legacy", spec: legacy } : null;
}

export default async function SharedGamePage({ params }: Props) {
  const { id } = await params;
  const resolved = await resolve(id);
  if (!resolved) notFound();

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <SharedGameView
        spec={resolved.spec}
        shortId={resolved.kind === "stored" ? resolved.shortId : undefined}
        score={resolved.kind === "stored" ? resolved.score : undefined}
      />
    </main>
  );
}
