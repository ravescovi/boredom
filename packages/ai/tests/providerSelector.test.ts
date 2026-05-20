import { afterEach, describe, expect, it, vi } from "vitest";
import { selectProvider } from "../src/providerSelector";

afterEach(() => {
  vi.restoreAllMocks();
});

const sampleInput = {
  playerCount: { min: 2, max: 4 },
  circumstances: "x",
  gameType: "creative",
  availableProps: ["paper"]
};

describe("selectProvider", () => {
  it("returns a provider function when ANTHROPIC_API_KEY is set", () => {
    const provider = selectProvider({ ANTHROPIC_API_KEY: "sk-test", NODE_ENV: "production" });
    expect(typeof provider).toBe("function");
  });

  it("returns mockProvider (with a console.warn) when key missing in development", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const provider = selectProvider({ NODE_ENV: "development" });

    const out = await provider(sampleInput);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("ANTHROPIC_API_KEY"));
    expect(out).toBeTruthy();
  });

  it("returns a provider that rejects when key missing in production", async () => {
    const provider = selectProvider({ NODE_ENV: "production" });
    await expect(provider(sampleInput)).rejects.toThrow(/ANTHROPIC_API_KEY/);
  });
});
