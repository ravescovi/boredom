import { describe, expect, it } from "vitest";
import { safetyPromises } from "../safety";

describe("safetyPromises", () => {
  it("exposes the three player-facing hard rules in order", () => {
    expect(safetyPromises.map((p) => p.id)).toEqual([
      "drinking",
      "gambling",
      "physical"
    ]);
  });

  it("each promise carries an emoji, title, and note", () => {
    for (const promise of safetyPromises) {
      expect(promise.emoji.length).toBeGreaterThan(0);
      expect(promise.title.length).toBeGreaterThan(0);
      expect(promise.note.length).toBeGreaterThan(0);
    }
  });
});
