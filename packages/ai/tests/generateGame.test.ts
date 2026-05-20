import { describe, expect, it, vi } from "vitest";
import {
  FINAL_GAME_PROMPT_VERSION,
  SAFETY_POLICY_VERSION,
  generateGame,
  mockGenerateGame
} from "../src";
import type { GameProvider } from "../src";

const input = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table with paper and pens.",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

const validCandidate = mockGenerateGame(input);
const invalidCandidate = { ...validCandidate, rules: ["Players drink when they miss a clue."] };

describe("generateGame", () => {
  it("returns ok on first valid call (no retry)", async () => {
    const provider: GameProvider = vi.fn().mockResolvedValueOnce(validCandidate);
    const result = await generateGame(input, { provider });

    expect(result.status).toBe("ok");
    expect(provider).toHaveBeenCalledTimes(1);
    if (result.status === "ok") {
      expect(result.promptVersion).toBe(FINAL_GAME_PROMPT_VERSION);
      expect(result.safetyPolicyVersion).toBe(SAFETY_POLICY_VERSION);
    }
  });

  it("retries once with feedback, then returns ok", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(invalidCandidate)
      .mockResolvedValueOnce(validCandidate);

    const result = await generateGame(input, { provider });

    expect(result.status).toBe("ok");
    expect(provider).toHaveBeenCalledTimes(2);

    const secondCallFeedback = (provider as ReturnType<typeof vi.fn>).mock.calls[1][1] as string[];
    expect(Array.isArray(secondCallFeedback)).toBe(true);
    expect(secondCallFeedback.length).toBeGreaterThan(0);
    expect(secondCallFeedback.some((r) => r.toLowerCase().includes("drink"))).toBe(true);
  });

  it("returns rejected when both attempts fail validation", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(invalidCandidate)
      .mockResolvedValueOnce(invalidCandidate);

    const result = await generateGame(input, { provider });

    expect(result.status).toBe("rejected");
    expect(provider).toHaveBeenCalledTimes(2);
    if (result.status === "rejected") {
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.promptVersion).toBe(FINAL_GAME_PROMPT_VERSION);
      expect(result.safetyPolicyVersion).toBe(SAFETY_POLICY_VERSION);
    }
  });

  it("returns error and does NOT retry when provider throws", async () => {
    const provider: GameProvider = vi.fn().mockRejectedValueOnce(new Error("network down"));

    const result = await generateGame(input, { provider });

    expect(result.status).toBe("error");
    expect(provider).toHaveBeenCalledTimes(1);
    if (result.status === "error") {
      expect(result.message).toMatch(/network down/);
    }
  });
});
