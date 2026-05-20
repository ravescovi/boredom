import Link from "next/link";
import { notFound } from "next/navigation";
import { GeneratedGameView } from "../../../components/GeneratedGameView";
import { ShareGameButton } from "../../../components/ShareGameButton";
import { decodeGameFromUrl } from "../../../lib/shareUrl";

type Props = {
  params: Promise<{ encoded: string }>;
};

export const dynamic = "force-static";

export default async function SharedGamePage({ params }: Props) {
  const { encoded } = await params;
  const game = decodeGameFromUrl(encoded);
  if (!game) notFound();

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
        <span
          className="h-2 w-2 rounded-full bg-mint"
          style={{ animation: "brut-pulse 1.6s infinite" }}
        />
        Shared game
      </span>

      <div className="mt-6">
        <GeneratedGameView game={game} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/generate"
          className="rounded-xl border-[3px] border-ink bg-hot px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Make your own 🎲
        </Link>
        <ShareGameButton game={game} />
      </div>
    </main>
  );
}
