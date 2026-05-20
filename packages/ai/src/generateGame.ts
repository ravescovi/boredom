import type { GameSpec } from "@bordon-ai/shared";
import type { MockGeneratorInput } from "./mockGenerator";

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
