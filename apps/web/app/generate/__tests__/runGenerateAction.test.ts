import { describe, expect, it, vi } from "vitest";
import { mockGenerateGame } from "@bordon-ai/ai";
import type { GameProvider } from "@bordon-ai/ai";
import { runGenerateAction } from "../runGenerateAction";

const baseInput = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table.",
  gameType: "creative",
  availableProps: ["paper"]
};
const validCandidate = mockGenerateGame(baseInput);
const drinkingCandidate = {
  ...validCandidate,
  rules: ["Players drink when they miss a clue."]
};
const gamblingCandidate = {
  ...validCandidate,
  scoring: ["Players wager points for money."]
};
const physicalCandidate = {
  ...validCandidate,
  gameplayLoop: ["Players complete a stunt before guessing."]
};

function buildForm(overrides: Record<string, string | string[]> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string | string[]> = {
    minPlayers: "2",
    maxPlayers: "4",
    circumstances: "A quiet table.",
    gameType: "creative",
    props: ["paper", "pens"]
  };
  const merged = { ...defaults, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

const silentLog = () => {};

describe("runGenerateAction", () => {
  it("returns ok for a valid form + provider that returns a valid candidate", async () => {
    const provider: GameProvider = vi.fn().mockResolvedValueOnce(validCandidate);
    const state = await runGenerateAction(buildForm(), { provider, log: silentLog });

    expect(state.status).toBe("ok");
  });

  it("returns input_error when minPlayers > maxPlayers without calling the provider", async () => {
    const provider: GameProvider = vi.fn();
    const state = await runGenerateAction(buildForm({ minPlayers: "10", maxPlayers: "2" }), {
      provider,
      log: silentLog
    });

    expect(state.status).toBe("input_error");
    if (state.status === "input_error") {
      expect(state.fields.maxPlayers).toBeDefined();
    }
    expect(provider).not.toHaveBeenCalled();
  });

  it("maps drinking rejection reasons to drinking_or_intoxication", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(drinkingCandidate)
      .mockResolvedValueOnce(drinkingCandidate);
    const state = await runGenerateAction(buildForm(), { provider, log: silentLog });

    expect(state.status).toBe("rejected");
    if (state.status === "rejected") {
      expect(state.categories).toContain("drinking_or_intoxication");
    }
  });

  it("maps gambling rejection reasons to gambling_or_stakes", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(gamblingCandidate)
      .mockResolvedValueOnce(gamblingCandidate);
    const state = await runGenerateAction(buildForm(), { provider, log: silentLog });

    if (state.status === "rejected") {
      expect(state.categories).toContain("gambling_or_stakes");
    } else {
      throw new Error(`expected rejected, got ${state.status}`);
    }
  });

  it("maps physical-risk rejection reasons to physical_risk", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(physicalCandidate)
      .mockResolvedValueOnce(physicalCandidate);
    const state = await runGenerateAction(buildForm(), { provider, log: silentLog });

    if (state.status === "rejected") {
      expect(state.categories).toContain("physical_risk");
    } else {
      throw new Error(`expected rejected, got ${state.status}`);
    }
  });

  it("returns error when the provider throws", async () => {
    const provider: GameProvider = vi.fn().mockRejectedValueOnce(new Error("network"));
    const state = await runGenerateAction(buildForm(), { provider, log: silentLog });

    expect(state.status).toBe("error");
  });
});
