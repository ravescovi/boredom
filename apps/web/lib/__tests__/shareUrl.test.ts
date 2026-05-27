import { describe, expect, it } from "vitest";
import { mockGenerateGame } from "@bordom-ai/ai";
import { decodeGameFromUrl, encodeGameForUrl } from "../shareUrl";

const sample = mockGenerateGame({
  playerCount: { min: 2, max: 4 },
  circumstances: "x",
  gameType: "creative",
  availableProps: ["paper"]
});

describe("shareUrl encode/decode", () => {
  it("roundtrips a GameSpec losslessly", () => {
    const encoded = encodeGameForUrl(sample);
    const decoded = decodeGameFromUrl(encoded);
    expect(decoded).toEqual(sample);
  });

  it("produces URL-safe base64 (no +, /, =)", () => {
    const encoded = encodeGameForUrl(sample);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null when input is not valid base64", () => {
    expect(decodeGameFromUrl("!!!not-base64!!!")).toBeNull();
  });

  it("returns null when decoded JSON is not a valid GameSpec", () => {
    const garbage = encodeGameForUrl({ ...sample, commercialUseAllowed: true } as never);
    expect(decodeGameFromUrl(garbage)).toBeNull();
  });
});
