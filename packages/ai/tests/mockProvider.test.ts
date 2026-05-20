import { describe, expect, it } from "vitest";
import { GameSpecSchema } from "@bordon-ai/shared";
import { mockProvider } from "../src/mockProvider";

const input = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table with paper and pens.",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

describe("mockProvider", () => {
  it("returns a candidate that parses as a valid GameSpec", async () => {
    const candidate = await mockProvider(input);
    expect(GameSpecSchema.safeParse(candidate).success).toBe(true);
  });

  it("ignores the feedback parameter (mock is deterministic)", async () => {
    const first = await mockProvider(input);
    const second = await mockProvider(input, ["Unsafe policy term detected: bet"]);
    expect(second).toEqual(first);
  });
});
