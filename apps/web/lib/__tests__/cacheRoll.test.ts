import { describe, expect, it } from "vitest";
import { parseCacheHitRate, shouldServeCached } from "../cacheRoll";

describe("shouldServeCached", () => {
  it("returns false when rate is 0", () => {
    expect(shouldServeCached(0, () => 0)).toBe(false);
    expect(shouldServeCached(0, () => 0.99)).toBe(false);
  });

  it("returns true when rate is 1", () => {
    expect(shouldServeCached(1, () => 0.99)).toBe(true);
  });

  it("uses the roller for fractional rates", () => {
    expect(shouldServeCached(0.5, () => 0.3)).toBe(true);
    expect(shouldServeCached(0.5, () => 0.7)).toBe(false);
    expect(shouldServeCached(0.5, () => 0.5)).toBe(false); // strict <
  });

  it("rejects non-finite rates", () => {
    expect(shouldServeCached(Number.NaN, () => 0)).toBe(false);
    expect(shouldServeCached(Number.POSITIVE_INFINITY, () => 0)).toBe(false);
  });
});

describe("parseCacheHitRate", () => {
  it("defaults to 0.5 when unset", () => {
    expect(parseCacheHitRate({})).toBe(0.5);
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "" })).toBe(0.5);
  });

  it("parses valid floats", () => {
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "0" })).toBe(0);
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "0.25" })).toBe(0.25);
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "1" })).toBe(1);
  });

  it("clamps to [0,1]", () => {
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "-1" })).toBe(0);
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "5" })).toBe(1);
  });

  it("falls back to 0.5 on NaN input", () => {
    expect(parseCacheHitRate({ BORDON_CACHE_HIT_RATE: "abc" })).toBe(0.5);
  });
});
