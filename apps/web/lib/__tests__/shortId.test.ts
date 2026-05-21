import { describe, expect, it } from "vitest";
import { generateShortId, isShortId } from "../shortId";

describe("generateShortId", () => {
  it("produces a 6-character id in the Crockford-style alphabet", () => {
    for (let i = 0; i < 50; i++) {
      const id = generateShortId();
      expect(id).toHaveLength(6);
      expect(id).toMatch(/^[0-9A-HJKMNPQRSTVWXYZ]{6}$/);
    }
  });

  it("returns reasonably unique ids across many draws", () => {
    const set = new Set<string>();
    for (let i = 0; i < 200; i++) set.add(generateShortId());
    expect(set.size).toBeGreaterThan(190);
  });
});

describe("isShortId", () => {
  it("accepts valid 6-character uppercase ids", () => {
    expect(isShortId("ABCD12")).toBe(true);
    expect(isShortId("00000Z")).toBe(true);
    expect(isShortId("CHARAD")).toBe(true);
  });

  it("rejects lowercase or non-alphanumeric characters", () => {
    expect(isShortId("aaaaaa")).toBe(false);
    expect(isShortId("ABC-12")).toBe(false);
    expect(isShortId("ABC 12")).toBe(false);
  });

  it("rejects ids of the wrong length", () => {
    expect(isShortId("ABCDE")).toBe(false);
    expect(isShortId("ABCDEFG")).toBe(false);
    expect(isShortId("")).toBe(false);
  });
});
