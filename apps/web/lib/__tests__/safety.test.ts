import { describe, expect, it } from "vitest";
import { safetyPromises } from "../safety";

describe("safetyPromises", () => {
  it("exposes the four hard rules in order", () => {
    expect(safetyPromises.map((p) => p.id)).toEqual([
      "drinking",
      "gambling",
      "physical",
      "original"
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
