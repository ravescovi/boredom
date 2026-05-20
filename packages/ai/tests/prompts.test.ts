import { describe, expect, it } from "vitest";
import {
  FINAL_GAME_PROMPT_VERSION,
  buildSystemPrompt,
  safetyPolicyText,
  ipAvoidancePolicyText
} from "../src";

describe("FINAL_GAME_PROMPT_VERSION", () => {
  it("is bumped to v0.2.0 because the template now embeds schema + tool instructions", () => {
    expect(FINAL_GAME_PROMPT_VERSION).toBe("final-game-v0.3.0");
  });
});

describe("buildSystemPrompt", () => {
  it("embeds both policy texts verbatim", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain(safetyPolicyText.trim());
    expect(prompt).toContain(ipAvoidancePolicyText.trim());
  });

  it("instructs the model to call the submit_game tool and forbids prose output", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/submit_game/);
    expect(prompt.toLowerCase()).toMatch(/json|tool/);
  });

  it("instructs the model that commercialUseAllowed must be false", () => {
    expect(buildSystemPrompt()).toMatch(/commercialUseAllowed.*false/i);
  });
});
