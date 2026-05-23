import { createHash } from "node:crypto";

export type RawGenerationInput = {
  playerCount: { min: number; max: number };
  circumstances: string;
  gameType: string;
  availableProps: string[];
};

export function normalizeInput(input: RawGenerationInput): RawGenerationInput {
  return {
    playerCount: {
      min: Math.trunc(input.playerCount.min),
      max: Math.trunc(input.playerCount.max)
    },
    circumstances: input.circumstances.trim().toLowerCase().replace(/\s+/g, " "),
    gameType: input.gameType.trim().toLowerCase(),
    availableProps: Array.from(
      new Set(input.availableProps.map((p) => p.trim().toLowerCase()))
    )
      .filter((p) => p.length > 0)
      .sort()
  };
}

export function hashInput(input: RawGenerationInput): string {
  const n = normalizeInput(input);
  const payload = JSON.stringify({
    c: n.circumstances,
    g: n.gameType,
    pMin: n.playerCount.min,
    pMax: n.playerCount.max,
    pr: n.availableProps
  });
  return createHash("sha256").update(payload).digest("hex");
}
