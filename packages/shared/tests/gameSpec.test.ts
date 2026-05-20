import { describe, expect, it } from "vitest";
import { GameSpecSchema, renderGameSpecMarkdown } from "../src";
import { validGameSpecFixture } from "./validGameSpecFixture";

describe("GameSpecSchema", () => {
  it("accepts a valid GameSpec", () => {
    expect(GameSpecSchema.safeParse(validGameSpecFixture).success).toBe(true);
  });

  it("rejects commercial use", () => {
    const result = GameSpecSchema.safeParse({
      ...validGameSpecFixture,
      commercialUseAllowed: true
    });

    expect(result.success).toBe(false);
  });

  it("renders Markdown from valid JSON", () => {
    const game = GameSpecSchema.parse(validGameSpecFixture);
    const markdown = renderGameSpecMarkdown(game);

    expect(markdown).toContain("# Pattern Relay");
    expect(markdown).toContain("## Rules");
    expect(markdown).toContain("- Players describe patterns without copying protected game formats.");
  });
});
