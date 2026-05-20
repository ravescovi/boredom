import { describe, expect, it } from "vitest";
import { validateGeneratedGameSpec } from "../src";
import { mockGenerateGame } from "../src/mockGenerator";

const safeGame = mockGenerateGame({
  playerCount: { min: 2, max: 4 },
  circumstances: "A calm living room.",
  gameType: "conversation",
  availableProps: ["paper"]
});

describe("validateGeneratedGameSpec", () => {
  it("rejects drinking games", () => {
    const result = validateGeneratedGameSpec({
      ...safeGame,
      rules: ["Players drink when they miss a clue."]
    });

    expect(result.ok).toBe(false);
  });

  it("rejects gambling games", () => {
    const result = validateGeneratedGameSpec({
      ...safeGame,
      scoring: ["Players wager points that can be exchanged for money."]
    });

    expect(result.ok).toBe(false);
  });

  it("rejects physical-risk games", () => {
    const result = validateGeneratedGameSpec({
      ...safeGame,
      gameplayLoop: ["Players complete a stunt before guessing."]
    });

    expect(result.ok).toBe(false);
  });
});
