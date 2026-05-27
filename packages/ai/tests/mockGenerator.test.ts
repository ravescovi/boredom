import { describe, expect, it } from "vitest";
import { GameSpecSchema } from "@bordom-ai/shared";
import { mockGenerateGame } from "../src";

describe("mockGenerateGame", () => {
  it("returns valid GameSpec output", () => {
    const game = mockGenerateGame({
      playerCount: { min: 3, max: 5 },
      circumstances: "Friends indoors with pens and paper.",
      gameType: "creative",
      availableProps: ["paper", "pens"]
    });

    expect(GameSpecSchema.safeParse(game).success).toBe(true);
    expect(game.commercialUseAllowed).toBe(false);
  });
});
