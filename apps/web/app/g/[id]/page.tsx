import Link from "next/link";
import { notFound } from "next/navigation";
import type { GameSpec } from "@bordon-ai/shared";
import { GeneratedGameView } from "../../../components/GeneratedGameView";
import { ShareGameButton } from "../../../components/ShareGameButton";
import { StarButton } from "../../../components/StarButton";
import { findClassic } from "../../../lib/classics";
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
      const classic = findClassic(upper);
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
      // DB unavailable — classics still resolve from static data.
      const classic = findClassic(upper);
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
      <GeneratedGameView game={resolved.spec} />

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/generate"
          className="rounded-xl border-[3px] border-ink bg-hot px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Make your own 🎲
        </Link>
        {resolved.kind === "stored" && (
          <StarButton shortId={resolved.shortId} initialScore={resolved.score} />
        )}
        <ShareGameButton
          game={resolved.spec}
          initialShortId={resolved.kind === "stored" ? resolved.shortId : undefined}
        />
      </div>
    </main>
  );
}
