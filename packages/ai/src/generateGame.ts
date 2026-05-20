import type { GameSpec } from "@bordon-ai/shared";
import type { MockGeneratorInput } from "./mockGenerator";
import { SAFETY_POLICY_VERSION } from "./policies";
import { FINAL_GAME_PROMPT_VERSION } from "./prompts";
import { validateGeneratedGameSpec } from "./validator";

export type GameProvider = (
  input: MockGeneratorInput,
  feedback?: string[]
) => Promise<unknown>;

export type GenerateResult =
  | {
      status: "ok";
      game: GameSpec;
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | {
      status: "rejected";
      reasons: string[];
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | {
      status: "error";
      message: string;
    };

export type GenerateGameDeps = {
  provider: GameProvider;
};

export async function generateGame(
  input: MockGeneratorInput,
  deps: GenerateGameDeps
): Promise<GenerateResult> {
  const stamp = {
    promptVersion: FINAL_GAME_PROMPT_VERSION,
    safetyPolicyVersion: SAFETY_POLICY_VERSION
  };

  let firstReasons: string[];

  try {
    const firstCandidate = await deps.provider(input);
    const first = validateGeneratedGameSpec(firstCandidate);
    if (first.ok) return { status: "ok", game: first.game, ...stamp };
    firstReasons = first.reasons;
  } catch (err) {
    return { status: "error", message: errorMessage(err) };
  }

  try {
    const secondCandidate = await deps.provider(input, firstReasons);
    const second = validateGeneratedGameSpec(secondCandidate);
    if (second.ok) return { status: "ok", game: second.game, ...stamp };
    return { status: "rejected", reasons: second.reasons, ...stamp };
  } catch (err) {
    return { status: "error", message: errorMessage(err) };
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown generator error";
}
