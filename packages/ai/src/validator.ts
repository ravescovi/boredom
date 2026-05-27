import { GameSpecSchema, type GameSpec } from "@bordom-ai/shared";
import { unsafeTerms } from "./policies";

export type GameSpecValidationResult =
  | { ok: true; game: GameSpec }
  | { ok: false; reasons: string[] };

function collectText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(collectText).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(collectText).join(" ");
  return "";
}

export function validateGeneratedGameSpec(candidate: unknown): GameSpecValidationResult {
  const parsed = GameSpecSchema.safeParse(candidate);
  if (!parsed.success) {
    return { ok: false, reasons: parsed.error.issues.map((issue) => issue.message) };
  }

  const gameplayContent = Object.fromEntries(
    Object.entries(parsed.data).filter(([key]) => key !== "safetyNotes")
  );
  const body = collectText(gameplayContent).toLowerCase();
  const matchedTerms = unsafeTerms.filter((term) => body.includes(term));

  if (matchedTerms.length > 0) {
    return {
      ok: false,
      reasons: matchedTerms.map((term) => `Unsafe policy term detected: ${term}`)
    };
  }

  return { ok: true, game: parsed.data };
}
