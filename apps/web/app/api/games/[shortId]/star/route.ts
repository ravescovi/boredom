import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ensureClassicSeeded, findGameByShortId, incrementScore } from "../../../../../lib/games";
import { findClassic } from "../../../../../lib/classics";
import { isShortId } from "../../../../../lib/shortId";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "bordon_stars";
const COOKIE_MAX_AGE_DAYS = 365;

type Params = { params: Promise<{ shortId: string }> };

function parseStars(raw: string | undefined): Set<string> {
  if (!raw) return new Set();
  return new Set(raw.split(",").filter(Boolean));
}

export async function POST(_req: Request, { params }: Params): Promise<Response> {
  const { shortId: rawId } = await params;
  const shortId = rawId.toUpperCase();

  if (!isShortId(shortId)) {
    return NextResponse.json({ error: "Invalid short id" }, { status: 400 });
  }

  try {
    const existing = await findGameByShortId(shortId);
    if (!existing) {
      const classic = findClassic(shortId);
      if (classic) {
        await ensureClassicSeeded(classic);
      } else {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
    }

    const jar = await cookies();
    const starred = parseStars(jar.get(COOKIE_NAME)?.value);

    if (starred.has(shortId)) {
      const current = (await findGameByShortId(shortId))!;
      return NextResponse.json({ score: current.score, alreadyStarred: true });
    }

    const updated = await incrementScore(shortId);
    if (!updated) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    starred.add(shortId);
    jar.set(COOKIE_NAME, Array.from(starred).join(","), {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60
    });

    return NextResponse.json({ score: updated.score, alreadyStarred: false });
  } catch (err) {
    console.error("POST /api/games/[shortId]/star failed", err);
    return NextResponse.json({ error: "Failed to star game" }, { status: 500 });
  }
}
