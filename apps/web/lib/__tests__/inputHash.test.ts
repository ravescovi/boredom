import { describe, expect, it } from "vitest";
import { hashInput, normalizeInput, type RawGenerationInput } from "../inputHash";

const baseInput: RawGenerationInput = {
  playerCount: { min: 2, max: 6 },
  circumstances: "friends-hanging",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

describe("hashInput", () => {
  it("returns the same hash for identical inputs", () => {
    const a = hashInput(baseInput);
    for (let i = 0; i < 50; i++) {
      expect(hashInput(baseInput)).toBe(a);
    }
  });

  it("is insensitive to leading/trailing/internal whitespace in circumstances", () => {
    const a = hashInput({ ...baseInput, circumstances: "Friends Hanging" });
    const b = hashInput({ ...baseInput, circumstances: "  friends   hanging  " });
    expect(a).toBe(b);
  });

  it("is case-insensitive on circumstances and gameType", () => {
    const a = hashInput({ ...baseInput, circumstances: "CREATIVE Night", gameType: "Conversation" });
    const b = hashInput({ ...baseInput, circumstances: "creative night", gameType: "conversation" });
    expect(a).toBe(b);
  });

  it("is order-insensitive on availableProps", () => {
    const a = hashInput({ ...baseInput, availableProps: ["pens", "paper"] });
    const b = hashInput({ ...baseInput, availableProps: ["paper", "pens"] });
    expect(a).toBe(b);
  });

  it("dedupes availableProps", () => {
    const a = hashInput({ ...baseInput, availableProps: ["paper", "paper", "pens", "pens"] });
    const b = hashInput({ ...baseInput, availableProps: ["paper", "pens"] });
    expect(a).toBe(b);
  });

  it("drops empty-string availableProps", () => {
    const a = hashInput({ ...baseInput, availableProps: ["paper", "", "  ", "pens"] });
    const b = hashInput({ ...baseInput, availableProps: ["paper", "pens"] });
    expect(a).toBe(b);
  });

  it("distinguishes different circumstances", () => {
    expect(hashInput({ ...baseInput, circumstances: "a" })).not.toBe(
      hashInput({ ...baseInput, circumstances: "b" })
    );
  });

  it("distinguishes different gameType", () => {
    expect(hashInput({ ...baseInput, gameType: "creative" })).not.toBe(
      hashInput({ ...baseInput, gameType: "conversation" })
    );
  });

  it("distinguishes different player counts", () => {
    expect(hashInput({ ...baseInput, playerCount: { min: 2, max: 6 } })).not.toBe(
      hashInput({ ...baseInput, playerCount: { min: 3, max: 6 } })
    );
    expect(hashInput({ ...baseInput, playerCount: { min: 2, max: 6 } })).not.toBe(
      hashInput({ ...baseInput, playerCount: { min: 2, max: 8 } })
    );
  });

  it("distinguishes different prop sets", () => {
    expect(hashInput({ ...baseInput, availableProps: ["paper"] })).not.toBe(
      hashInput({ ...baseInput, availableProps: ["paper", "pens"] })
    );
  });

  it("returns 64 lowercase hex characters", () => {
    expect(hashInput(baseInput)).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("normalizeInput", () => {
  it("truncates non-integer player counts", () => {
    expect(normalizeInput({ ...baseInput, playerCount: { min: 2.7, max: 6.2 } })).toEqual({
      playerCount: { min: 2, max: 6 },
      circumstances: "friends-hanging",
      gameType: "creative",
      availableProps: ["paper", "pens"]
    });
  });
});
