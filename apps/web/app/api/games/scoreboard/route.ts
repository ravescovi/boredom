import { NextResponse } from "next/server";
import { listScoreboard } from "../../../../lib/games";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    const rows = await listScoreboard(50);
    return NextResponse.json({
      games: rows.map((r) => ({
        shortId: r.shortId,
        title: r.title,
        summary: r.summary,
        score: r.score,
        isClassic: r.isClassic,
        createdAt: r.createdAt.toISOString()
      }))
    });
  } catch (err) {
    console.error("GET /api/games/scoreboard failed", err);
    return NextResponse.json({ error: "Failed to load scoreboard" }, { status: 500 });
  }
}
