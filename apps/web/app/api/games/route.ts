import { NextResponse } from "next/server";
import { GameSpecSchema } from "@bordom-ai/shared";
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

  const rawHash = (body as { inputHash?: unknown })?.inputHash;
  const inputHash =
    typeof rawHash === "string" && /^[a-f0-9]{64}$/.test(rawHash) ? rawHash : undefined;

  try {
    const record = await createGameFromSpec(parsed.data, { inputHash });
    return NextResponse.json({
      shortId: record.shortId,
      score: record.score
    });
  } catch (err) {
    console.error("POST /api/games failed", err);
    return NextResponse.json({ error: "Failed to save game" }, { status: 500 });
  }
}
