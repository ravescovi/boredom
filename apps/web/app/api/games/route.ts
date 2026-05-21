import { NextResponse } from "next/server";
import { GameSpecSchema } from "@bordon-ai/shared";
import { createGameFromSpec } from "../../../lib/games";

export const dynamic = "force-dynamic";

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = GameSpecSchema.safeParse(
    (body as { spec?: unknown })?.spec ?? body
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid GameSpec", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const record = await createGameFromSpec(parsed.data);
    return NextResponse.json({
      shortId: record.shortId,
      score: record.score
    });
  } catch (err) {
    console.error("POST /api/games failed", err);
    return NextResponse.json({ error: "Failed to save game" }, { status: 500 });
  }
}
