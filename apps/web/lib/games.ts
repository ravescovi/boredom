import type { GameSpec } from "@bordon-ai/shared";
import { prisma, Prisma } from "./db";
import { CLASSIC_GAMES, type ClassicGame } from "./classics";
import { generateShortId } from "./shortId";

export type GameRecord = {
  shortId: string;
  title: string;
  summary: string;
  score: number;
  isClassic: boolean;
  createdAt: Date;
  spec: GameSpec;
};

function toRecord(row: {
  shortId: string;
  title: string;
  summary: string;
  score: number;
  isClassic: boolean;
  createdAt: Date;
  currentJson: Prisma.JsonValue;
}): GameRecord {
  return {
    shortId: row.shortId,
    title: row.title,
    summary: row.summary,
    score: row.score,
    isClassic: row.isClassic,
    createdAt: row.createdAt,
    spec: row.currentJson as unknown as GameSpec
  };
}

export async function ensureClassicSeeded(classic: ClassicGame): Promise<GameRecord> {
  const row = await prisma.game.upsert({
    where: { shortId: classic.shortId },
    update: {},
    create: {
      shortId: classic.shortId,
      title: classic.spec.title,
      summary: classic.spec.summary,
      currentJson: classic.spec as unknown as Prisma.InputJsonValue,
      isClassic: true,
      visibility: "PUBLIC"
    }
  });
  return toRecord(row);
}

export async function ensureAllClassicsSeeded(): Promise<void> {
  await Promise.all(CLASSIC_GAMES.map((c) => ensureClassicSeeded(c)));
}

export async function findGameByShortId(shortId: string): Promise<GameRecord | null> {
  const normalized = shortId.toUpperCase();
  const row = await prisma.game.findUnique({ where: { shortId: normalized } });
  return row ? toRecord(row) : null;
}

export async function createGameFromSpec(spec: GameSpec): Promise<GameRecord> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const shortId = generateShortId();
    try {
      const stored: GameSpec = { ...spec, id: shortId };
      const row = await prisma.game.create({
        data: {
          shortId,
          title: stored.title,
          summary: stored.summary,
          currentJson: stored as unknown as Prisma.InputJsonValue,
          visibility: "PUBLIC"
        }
      });
      return toRecord(row);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002"
      ) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not allocate a unique short ID after several attempts.");
}

export async function incrementScore(shortId: string): Promise<GameRecord | null> {
  const normalized = shortId.toUpperCase();
  try {
    const row = await prisma.game.update({
      where: { shortId: normalized },
      data: { score: { increment: 1 } }
    });
    return toRecord(row);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return null;
    }
    throw err;
  }
}

export async function listScoreboard(limit = 25): Promise<GameRecord[]> {
  await ensureAllClassicsSeeded();
  const rows = await prisma.game.findMany({
    where: { visibility: "PUBLIC" },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: limit
  });
  return rows.map(toRecord);
}
