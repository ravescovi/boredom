import type Anthropic from "@anthropic-ai/sdk";
import { GameSpecSchema } from "@bordon-ai/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { MockGeneratorInput } from "./mockGenerator";
import { buildSystemPrompt } from "./prompts";
import type { GameProvider } from "./generateGame";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

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

export function createAnthropicProvider(
  client: Anthropic,
  model: string = DEFAULT_MODEL
): GameProvider {
  const toolInputSchema = buildToolInputSchema();
  const systemText = buildSystemPrompt();

  return async (input, feedback) => {
    const messages: Array<{ role: "user" | "assistant"; content: unknown }> = [
      { role: "user", content: buildUserContent(input) }
    ];

    if (feedback && feedback.length > 0) {
      messages.push({
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "retry_prior",
            name: "submit_game",
            input: { note: "previous attempt rejected" }
          }
        ]
      });
      messages.push({
        role: "user",
        content:
          "That game failed validation for these reasons:\n" +
          feedback.map((r) => `- ${r}`).join("\n") +
          "\nGenerate a new game that addresses every reason. Call submit_game again."
      });
    }

    const response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      system: [{ type: "text", text: systemText, cache_control: { type: "ephemeral" } }],
      tools: [
        {
          name: "submit_game",
          description: "Submit one validated GameSpec for the user.",
          input_schema: toolInputSchema
        }
      ],
      tool_choice: { type: "tool", name: "submit_game" },
      messages
    } as unknown as Parameters<typeof client.messages.create>[0]);

    const block = (response as { content?: Array<{ type: string }> }).content?.find(
      (b) => b.type === "tool_use"
    ) as { type: "tool_use"; input: unknown } | undefined;
    if (!block) {
      throw new Error("Anthropic response had no tool_use block");
    }
    return block.input;
  };
}
