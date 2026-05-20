import { describe, expect, it, vi } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { createAnthropicProvider } from "../src/anthropicGenerator";
import { mockGenerateGame } from "../src/mockGenerator";

const input = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table with paper and pens.",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

function fakeClient(response: unknown) {
  return {
    messages: {
      create: vi.fn().mockResolvedValue(response)
    }
  } as unknown as Anthropic;
}

const successfulResponse = {
  content: [
    {
      type: "tool_use",
      id: "tool_1",
      name: "submit_game",
      input: mockGenerateGame(input)
    }
  ]
};

describe("createAnthropicProvider", () => {
  it("calls messages.create with model, cached system block, submit_game tool, and forced tool_choice", async () => {
    const client = fakeClient(successfulResponse);
    const provider = createAnthropicProvider(client);

    await provider(input);

    expect(client.messages.create).toHaveBeenCalledTimes(1);
    const args = (client.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0];

    expect(args.model).toBe("claude-sonnet-4-6");
    expect(Array.isArray(args.system)).toBe(true);
    expect(args.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(args.tools).toHaveLength(1);
    expect(args.tools[0].name).toBe("submit_game");
    expect(args.tool_choice).toEqual({ type: "tool", name: "submit_game" });
  });

  it("includes the structured input in the user message", async () => {
    const client = fakeClient(successfulResponse);
    const provider = createAnthropicProvider(client);

    await provider(input);

    const args = (client.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    const userMessage = args.messages[0];
    expect(userMessage.role).toBe("user");
    const text = JSON.stringify(userMessage.content);
    expect(text).toContain("creative");
    expect(text).toContain("paper");
    expect(text).toContain("pens");
  });

  it("appends a failed tool_use turn and reasons feedback when feedback is provided", async () => {
    const client = fakeClient(successfulResponse);
    const provider = createAnthropicProvider(client);

    await provider(input, ["Unsafe policy term detected: drink"]);

    const args = (client.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(args.messages.length).toBeGreaterThanOrEqual(2);
    const last = args.messages[args.messages.length - 1];
    expect(last.role).toBe("user");
    expect(JSON.stringify(last.content)).toMatch(/drink/);
  });

  it("returns the tool_use.input as the candidate", async () => {
    const expected = mockGenerateGame(input);
    const client = fakeClient({
      content: [{ type: "tool_use", id: "x", name: "submit_game", input: expected }]
    });
    const provider = createAnthropicProvider(client);

    const result = await provider(input);
    expect(result).toEqual(expected);
  });

  it("throws when the response has no tool_use block", async () => {
    const client = fakeClient({ content: [{ type: "text", text: "I refuse." }] });
    const provider = createAnthropicProvider(client);

    await expect(provider(input)).rejects.toThrow(/tool_use/);
  });
});
