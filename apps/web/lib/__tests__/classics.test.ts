import { describe, expect, it } from "vitest";
import { GameSpecSchema } from "@bordom-ai/shared";
import { CLASSIC_GAMES, findClassic } from "../classics";
import { isShortId } from "../shortId";

describe("classic games", () => {
  it("each classic has a valid GameSpec", () => {
    for (const c of CLASSIC_GAMES) {
      expect(() => GameSpecSchema.parse(c.spec)).not.toThrow();
    }
  });

  it("each classic uses a valid 6-character short id matching the spec id", () => {
    for (const c of CLASSIC_GAMES) {
      expect(isShortId(c.shortId)).toBe(true);
      expect(c.spec.id).toBe(c.shortId);
    }
  });

  it("short ids are unique across classics", () => {
    const ids = CLASSIC_GAMES.map((c) => c.shortId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("findClassic is case-insensitive and returns the matching entry", () => {
    const first = CLASSIC_GAMES[0];
    expect(findClassic(first.shortId)).toEqual(first);
    expect(findClassic(first.shortId.toLowerCase())).toEqual(first);
    expect(findClassic("NOPE99")).toBeUndefined();
  });
});
