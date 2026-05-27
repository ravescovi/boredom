// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockGenerateGame } from "@bordom-ai/ai";

// Mock the persistence layer so the route never touches Prisma/the DB. This is
// the seam the generation cache reads through.
const findCachedGameByInputHash = vi.fn();
vi.mock("../../../../lib/games", () => ({
  findCachedGameByInputHash: (...args: unknown[]) => findCachedGameByInputHash(...args)
}));

import { POST } from "../route";

const DETERMINISTIC_INPUT = {
  minPlayers: "3",
  maxPlayers: "6",
  circumstances: "Friends hanging out indoors with paper and pens",
  gameType: "creative",
  props: "paper"
};

function formRequest(fields: Record<string, string>): Request {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return new Request("http://localhost/api/generate", { method: "POST", body: fd });
}

type OkEvent = {
  type: string;
  game: { title: string };
  shortId?: string;
  inputHash?: string;
  cached?: boolean;
};

async function readOkEvent(res: Response): Promise<OkEvent | null> {
  const text = await res.text();
  for (const block of text.split("\n\n")) {
    let event: string | null = null;
    let data: string | null = null;
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      if (line.startsWith("data:")) data = line.slice(5).trim();
    }
    if (event === "ok" && data) return JSON.parse(data) as OkEvent;
  }
  return null;
}

function storedRecord(shortId: string) {
  const spec = { ...mockGenerateGame({ ...mockInput }), id: shortId };
  return {
    shortId,
    title: spec.title,
    summary: spec.summary,
    score: 3,
    isClassic: false,
    createdAt: new Date(),
    spec
  };
}

const mockInput = {
  playerCount: { min: 3, max: 6 },
  circumstances: "friends hanging out indoors with paper and pens",
  gameType: "creative",
  availableProps: ["paper"]
};

const ORIGINAL_ENV = { ...process.env };

beforeEach(() => {
  findCachedGameByInputHash.mockReset();
  // No API key + non-production (vitest sets NODE_ENV=test) -> selectStreamingClient
  // returns mock mode, so a cache miss falls through to the deterministic mock
  // generator with no network call.
  delete process.env.ANTHROPIC_API_KEY;
});

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("POST /api/generate — generation cache", () => {
  it("serves a stored game on a cache hit (rate=1) without generating", async () => {
    process.env.BORDON_CACHE_HIT_RATE = "1";
    findCachedGameByInputHash.mockResolvedValue(storedRecord("CACHED1"));

    const res = await POST(formRequest(DETERMINISTIC_INPUT));
    const ok = await readOkEvent(res);

    expect(findCachedGameByInputHash).toHaveBeenCalledTimes(1);
    expect(ok).not.toBeNull();
    expect(ok!.cached).toBe(true);
    expect(ok!.shortId).toBe("CACHED1");
  });

  it("falls through to generation on a rolled miss (rate=1, nothing stored)", async () => {
    process.env.BORDON_CACHE_HIT_RATE = "1";
    findCachedGameByInputHash.mockResolvedValue(null);

    const res = await POST(formRequest(DETERMINISTIC_INPUT));
    const ok = await readOkEvent(res);

    expect(findCachedGameByInputHash).toHaveBeenCalledTimes(1);
    expect(ok).not.toBeNull();
    expect(ok!.cached).toBeUndefined();
    expect(ok!.shortId).toBeUndefined();
    // A miss still hands the client the inputHash so it can persist the game.
    expect(ok!.inputHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("never consults the cache when the roll fails (rate=0)", async () => {
    process.env.BORDON_CACHE_HIT_RATE = "0";

    const res = await POST(formRequest(DETERMINISTIC_INPUT));
    const ok = await readOkEvent(res);

    expect(findCachedGameByInputHash).not.toHaveBeenCalled();
    expect(ok).not.toBeNull();
    expect(ok!.cached).toBeUndefined();
    expect(ok!.inputHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("never caches random requests, even at rate=1", async () => {
    process.env.BORDON_CACHE_HIT_RATE = "1";

    const res = await POST(formRequest({ random: "1" }));
    const ok = await readOkEvent(res);

    expect(findCachedGameByInputHash).not.toHaveBeenCalled();
    expect(ok).not.toBeNull();
    // Random generations carry no inputHash (not cacheable).
    expect(ok!.inputHash).toBeUndefined();
  });
});
