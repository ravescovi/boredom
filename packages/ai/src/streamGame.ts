import type Anthropic from "@anthropic-ai/sdk";
import { GameSpecSchema, type GameSpec } from "@bordon-ai/shared";
import { parse as parsePartial, Allow } from "partial-json";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { MockGeneratorInput } from "./mockGenerator";
import { SAFETY_POLICY_VERSION } from "./policies";
import { FINAL_GAME_PROMPT_VERSION, buildSystemPrompt } from "./prompts";
import { validateGeneratedGameSpec } from "./validator";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 2048;

export type StreamEvent =
  | { kind: "partial"; partial: Partial<GameSpec> }
  | {
      kind: "ok";
      game: GameSpec;
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | {
      kind: "rejected";
      reasons: string[];
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | { kind: "error"; message: string };

export type StreamGameDeps = {
  client: Anthropic;
  model?: string;
  signal?: AbortSignal;
};

function buildToolInputSchema() {
  const schema = zodToJsonSchema(GameSpecSchema, {
    target: "openApi3",
    $refStrategy: "none"
  }) as Record<string, unknown>;
  delete schema.$schema;
  delete schema.$ref;
  delete schema.definitions;
  return schema;
}

function buildUserContent(input: MockGeneratorInput): string {
  return [
    "Generate one safe, original GameSpec for these inputs.",
    `playerCount.min: ${input.playerCount.min}`,
    `playerCount.max: ${input.playerCount.max}`,
    `gameType: ${input.gameType}`,
    `circumstances: ${input.circumstances}`,
    `availableProps: ${input.availableProps.join(", ") || "(none specified)"}`
  ].join("\n");
}

export async function* streamGame(
  input: MockGeneratorInput,
  deps: StreamGameDeps
): AsyncGenerator<StreamEvent> {
  const stamp = {
    promptVersion: FINAL_GAME_PROMPT_VERSION,
    safetyPolicyVersion: SAFETY_POLICY_VERSION
  };

  let accumulatedJson = "";
  let finalCandidate: unknown = null;
  let lastEmittedPartial: string = "";

  try {
    const stream = deps.client.messages.stream(
      {
        model: deps.model ?? DEFAULT_MODEL,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: "text",
            text: buildSystemPrompt(),
            cache_control: { type: "ephemeral" }
          }
        ],
        tools: [
          {
            name: "submit_game",
            description: "Submit one validated GameSpec for the user.",
            input_schema: buildToolInputSchema()
          }
        ],
        tool_choice: { type: "tool", name: "submit_game" },
        messages: [{ role: "user", content: buildUserContent(input) }]
      } as unknown as Parameters<typeof deps.client.messages.stream>[0],
      deps.signal ? { signal: deps.signal } : undefined
    );

    for await (const event of stream as unknown as AsyncIterable<{
      type: string;
      delta?: { type: string; partial_json?: string };
    }>) {
      if (event.type === "content_block_delta" && event.delta?.type === "input_json_delta") {
        accumulatedJson += event.delta.partial_json ?? "";
        const parsed = tryPartialParse(accumulatedJson);
        if (parsed && JSON.stringify(parsed) !== lastEmittedPartial) {
          lastEmittedPartial = JSON.stringify(parsed);
          yield { kind: "partial", partial: parsed };
        }
      }
    }

    const final = await stream.finalMessage();
    const toolUse = final.content.find((b) => b.type === "tool_use") as
      | { type: "tool_use"; input: unknown }
      | undefined;
    if (!toolUse) {
      yield { kind: "error", message: "Anthropic response had no tool_use block" };
      return;
    }
    finalCandidate = toolUse.input;
  } catch (err) {
    yield {
      kind: "error",
      message: err instanceof Error ? err.message : "Unknown streaming error"
    };
    return;
  }

  const validation = validateGeneratedGameSpec(finalCandidate);
  if (validation.ok) {
    yield { kind: "ok", game: validation.game, ...stamp };
  } else {
    yield { kind: "rejected", reasons: validation.reasons, ...stamp };
  }
}

function tryPartialParse(s: string): Partial<GameSpec> | null {
  try {
    const obj = parsePartial(s, Allow.OBJ | Allow.ARR | Allow.STR);
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      return obj as Partial<GameSpec>;
    }
    return null;
  } catch {
    return null;
  }
}
