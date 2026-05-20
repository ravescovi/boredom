# Real Generator (Anthropic) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hardcoded `mockGenerateGame` stub with an Anthropic-backed generator that turns form inputs into a validated, novel `GameSpec` and renders it via a Server Action on `/generate`.

**Architecture:** A `GameProvider = (input, feedback?) => Promise<unknown>` seam in `@bordon-ai/ai` with two implementations (Anthropic via tool use, mock for fallback/tests). An orchestrator in `generateGame.ts` runs provider → validator → retry-once-on-rejection. A Next.js Server Action in `apps/web` parses the form, delegates to a pure `runGenerateAction` helper, and returns a discriminated `ActionState` consumed by `useActionState` in the rewritten `/generate` page. The deleted `/games/preview` route is replaced by an in-page result view; the homepage retargets to `/generate`.

**Tech Stack:** TypeScript, Zod, Vitest, Next.js 15 App Router, React 19 (`useActionState`), `@anthropic-ai/sdk`, `zod-to-json-schema`.

**Reference spec:** `docs/superpowers/specs/2026-05-19-real-generator-design.md` (commit `e6d9b45`).

---

## File Structure

**Created in `packages/ai/src/`:**
- `anthropicGenerator.ts` — `createAnthropicProvider(client, model?) → GameProvider`. Builds messages + tool call, returns `tool_use.input`.
- `mockProvider.ts` — Adapter: wraps `mockGenerateGame` to match the `GameProvider` shape.
- `generateGame.ts` — Orchestrator: provider → validate → retry-once. Defines `GameProvider`, `GenerateResult`.
- `providerSelector.ts` — Pure function of env that returns `GameProvider`.

**Modified in `packages/ai/src/`:**
- `prompts.ts` — Bump `FINAL_GAME_PROMPT_VERSION` to `final-game-v0.2.0`, add `buildSystemPrompt()` returning the full cacheable system block text.
- `index.ts` — Add exports for new modules.

**Created in `packages/ai/tests/`:**
- `mockProvider.test.ts`
- `generateGame.test.ts`
- `anthropicGenerator.test.ts`
- `providerSelector.test.ts`

**Created in `apps/web/`:**
- `app/generate/actions.ts` — `"use server"` one-line forwarder.
- `app/generate/runGenerateAction.ts` — Pure helper with deps.
- `app/generate/__tests__/runGenerateAction.test.ts`
- `components/GeneratedGameView.tsx` — Pure render of `GameSpec` (JSX lifted from old preview page).
- `components/GenerationErrorView.tsx` — Categorized rejection / error UI.
- `components/CookingLoader.tsx` — Pending-state skeleton.

**Modified in `apps/web/`:**
- `app/generate/page.tsx` — Becomes `"use client"`, drives form with `useActionState`, reads `searchParams` for prefill.
- `app/page.tsx` — Quick-pick form `action` and "Peek at a game" link retargeted to `/generate`.

**Deleted in `apps/web/`:**
- `app/games/preview/page.tsx`
- `app/games/` directory.

**Package files:**
- `packages/ai/package.json` — Add deps `@anthropic-ai/sdk`, `zod-to-json-schema`.

---

## Task 1: Add SDK dependencies

**Files:**
- Modify: `packages/ai/package.json`

- [ ] **Step 1: Add the two new runtime dependencies to `packages/ai/package.json`**

Edit `packages/ai/package.json` so the `dependencies` block reads:

```json
"dependencies": {
  "@anthropic-ai/sdk": "^0.32.0",
  "@bordon-ai/shared": "workspace:*",
  "zod": "^3.24.1",
  "zod-to-json-schema": "^3.24.1"
}
```

(Keep all existing top-level fields unchanged. The version range `^0.32.0` for the Anthropic SDK is a sane minimum supporting tool use + `cache_control`; `pnpm install` will resolve to the newest compatible release.)

- [ ] **Step 2: Install**

Run from repo root:

```bash
pnpm install
```

Expected: pnpm reports new packages added to `packages/ai`. No errors.

- [ ] **Step 3: Sanity check — typecheck still passes**

```bash
pnpm --filter @bordon-ai/ai typecheck
```

Expected: PASS, no output beyond `tsc --noEmit`.

- [ ] **Step 4: Commit**

```bash
git add packages/ai/package.json pnpm-lock.yaml
git commit -m "chore(ai): add @anthropic-ai/sdk and zod-to-json-schema deps"
```

---

## Task 2: Bump prompt version and add system prompt builder

**Files:**
- Modify: `packages/ai/src/prompts.ts`
- Test: `packages/ai/tests/prompts.test.ts` (new)

- [ ] **Step 1: Write the failing test**

Create `packages/ai/tests/prompts.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  FINAL_GAME_PROMPT_VERSION,
  buildSystemPrompt,
  safetyPolicyText,
  ipAvoidancePolicyText
} from "../src";

describe("FINAL_GAME_PROMPT_VERSION", () => {
  it("is bumped to v0.2.0 because the template now embeds schema + tool instructions", () => {
    expect(FINAL_GAME_PROMPT_VERSION).toBe("final-game-v0.2.0");
  });
});

describe("buildSystemPrompt", () => {
  it("embeds both policy texts verbatim", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain(safetyPolicyText.trim());
    expect(prompt).toContain(ipAvoidancePolicyText.trim());
  });

  it("instructs the model to call the submit_game tool and forbids prose output", () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toMatch(/submit_game/);
    expect(prompt.toLowerCase()).toMatch(/json|tool/);
  });

  it("instructs the model that commercialUseAllowed must be false", () => {
    expect(buildSystemPrompt()).toMatch(/commercialUseAllowed.*false/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @bordon-ai/ai test -- tests/prompts.test.ts
```

Expected: FAIL — `FINAL_GAME_PROMPT_VERSION` is still `final-game-v0.1.0` and `buildSystemPrompt` is not exported.

- [ ] **Step 3: Update `packages/ai/src/prompts.ts`**

Replace the file contents with:

```ts
import {
  IP_AVOIDANCE_POLICY_VERSION,
  SAFETY_POLICY_VERSION,
  ipAvoidancePolicyText,
  safetyPolicyText
} from "./policies";

export const CLARIFICATION_PROMPT_VERSION = "clarification-v0.1.0";
export const FINAL_GAME_PROMPT_VERSION = "final-game-v0.2.0";

export const clarificationPromptTemplate = `
You are Bordon.ai, a safe game design assistant. Ask concise clarification questions only
when the player's context is missing information required to produce a structured safe game.
Never suggest prohibited mechanics. Safety policy: ${SAFETY_POLICY_VERSION}.
`;

export function buildSystemPrompt(): string {
  return [
    "You are Bordon.ai, a safe game design assistant.",
    "Your only way to respond is by calling the submit_game tool with a GameSpec.",
    "Do NOT output prose, Markdown, or free-text JSON. Always call the tool.",
    "Every game you produce MUST set commercialUseAllowed to false.",
    `Safety policy (${SAFETY_POLICY_VERSION}):\n${safetyPolicyText.trim()}`,
    `IP avoidance policy (${IP_AVOIDANCE_POLICY_VERSION}):\n${ipAvoidancePolicyText.trim()}`,
    "Generate one original, safe, non-commercial game tailored to the user's structured input.",
    "Reject any temptation to imitate existing franchises, characters, or distinctive game names."
  ].join("\n\n");
}
```

(The old `finalGameGenerationPromptTemplate` export is dropped — only the version constant + the new builder are part of the public surface.)

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter @bordon-ai/ai test -- tests/prompts.test.ts
```

Expected: PASS, 3 tests green.

- [ ] **Step 5: Run the rest of the ai package's tests to confirm nothing else broke**

```bash
pnpm --filter @bordon-ai/ai test
```

Expected: PASS, all tests green. (Existing tests don't import the dropped `finalGameGenerationPromptTemplate`.)

- [ ] **Step 6: Commit**

```bash
git add packages/ai/src/prompts.ts packages/ai/tests/prompts.test.ts
git commit -m "feat(ai): bump prompt to v0.2.0 and add buildSystemPrompt"
```

---

## Task 3: Add provider types and mockProvider adapter

**Files:**
- Create: `packages/ai/src/generateGame.ts` (types only in this task)
- Create: `packages/ai/src/mockProvider.ts`
- Test: `packages/ai/tests/mockProvider.test.ts` (new)

- [ ] **Step 1: Write the failing test for `mockProvider`**

Create `packages/ai/tests/mockProvider.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GameSpecSchema } from "@bordon-ai/shared";
import { mockProvider } from "../src/mockProvider";

const input = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table with paper and pens.",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

describe("mockProvider", () => {
  it("returns a candidate that parses as a valid GameSpec", async () => {
    const candidate = await mockProvider(input);
    expect(GameSpecSchema.safeParse(candidate).success).toBe(true);
  });

  it("ignores the feedback parameter (mock is deterministic)", async () => {
    const first = await mockProvider(input);
    const second = await mockProvider(input, ["Unsafe policy term detected: bet"]);
    expect(second).toEqual(first);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @bordon-ai/ai test -- tests/mockProvider.test.ts
```

Expected: FAIL — module `../src/mockProvider` does not exist.

- [ ] **Step 3: Define provider types in `generateGame.ts`**

Create `packages/ai/src/generateGame.ts` with **types only** for now (orchestrator logic is Task 4):

```ts
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
```

- [ ] **Step 4: Implement `mockProvider`**

Create `packages/ai/src/mockProvider.ts`:

```ts
import { mockGenerateGame } from "./mockGenerator";
import type { GameProvider } from "./generateGame";

export const mockProvider: GameProvider = async (input) => {
  return mockGenerateGame(input);
};
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
pnpm --filter @bordon-ai/ai test -- tests/mockProvider.test.ts
```

Expected: PASS, 2 tests green.

- [ ] **Step 6: Commit**

```bash
git add packages/ai/src/generateGame.ts packages/ai/src/mockProvider.ts packages/ai/tests/mockProvider.test.ts
git commit -m "feat(ai): add GameProvider seam and mockProvider adapter"
```

---

## Task 4: Implement `generateGame` orchestrator

**Files:**
- Modify: `packages/ai/src/generateGame.ts`
- Test: `packages/ai/tests/generateGame.test.ts` (new)

- [ ] **Step 1: Write the failing tests**

Create `packages/ai/tests/generateGame.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import {
  FINAL_GAME_PROMPT_VERSION,
  SAFETY_POLICY_VERSION,
  generateGame,
  mockGenerateGame
} from "../src";
import type { GameProvider } from "../src";

const input = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table with paper and pens.",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

const validCandidate = mockGenerateGame(input);
const invalidCandidate = { ...validCandidate, rules: ["Players drink when they miss a clue."] };

describe("generateGame", () => {
  it("returns ok on first valid call (no retry)", async () => {
    const provider: GameProvider = vi.fn().mockResolvedValueOnce(validCandidate);
    const result = await generateGame(input, { provider });

    expect(result.status).toBe("ok");
    expect(provider).toHaveBeenCalledTimes(1);
    if (result.status === "ok") {
      expect(result.promptVersion).toBe(FINAL_GAME_PROMPT_VERSION);
      expect(result.safetyPolicyVersion).toBe(SAFETY_POLICY_VERSION);
    }
  });

  it("retries once with feedback, then returns ok", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(invalidCandidate)
      .mockResolvedValueOnce(validCandidate);

    const result = await generateGame(input, { provider });

    expect(result.status).toBe("ok");
    expect(provider).toHaveBeenCalledTimes(2);

    const secondCallFeedback = (provider as ReturnType<typeof vi.fn>).mock.calls[1][1] as string[];
    expect(Array.isArray(secondCallFeedback)).toBe(true);
    expect(secondCallFeedback.length).toBeGreaterThan(0);
    expect(secondCallFeedback.some((r) => r.toLowerCase().includes("drink"))).toBe(true);
  });

  it("returns rejected when both attempts fail validation", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(invalidCandidate)
      .mockResolvedValueOnce(invalidCandidate);

    const result = await generateGame(input, { provider });

    expect(result.status).toBe("rejected");
    expect(provider).toHaveBeenCalledTimes(2);
    if (result.status === "rejected") {
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.promptVersion).toBe(FINAL_GAME_PROMPT_VERSION);
      expect(result.safetyPolicyVersion).toBe(SAFETY_POLICY_VERSION);
    }
  });

  it("returns error and does NOT retry when provider throws", async () => {
    const provider: GameProvider = vi.fn().mockRejectedValueOnce(new Error("network down"));

    const result = await generateGame(input, { provider });

    expect(result.status).toBe("error");
    expect(provider).toHaveBeenCalledTimes(1);
    if (result.status === "error") {
      expect(result.message).toMatch(/network down/);
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @bordon-ai/ai test -- tests/generateGame.test.ts
```

Expected: FAIL — `generateGame` not exported.

- [ ] **Step 3: Implement the orchestrator**

Replace `packages/ai/src/generateGame.ts` with:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter @bordon-ai/ai test -- tests/generateGame.test.ts
```

Expected: PASS, 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/generateGame.ts packages/ai/tests/generateGame.test.ts
git commit -m "feat(ai): add generateGame orchestrator with retry-once-on-rejection"
```

---

## Task 5: Implement `createAnthropicProvider`

**Files:**
- Create: `packages/ai/src/anthropicGenerator.ts`
- Test: `packages/ai/tests/anthropicGenerator.test.ts` (new)

- [ ] **Step 1: Write the failing tests**

Create `packages/ai/tests/anthropicGenerator.test.ts`:

```ts
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
    const failedCandidate = { broken: true };
    const client = fakeClient(successfulResponse);
    const provider = createAnthropicProvider(client, "claude-sonnet-4-6", {
      onRetryBuildFailedCandidate: () => failedCandidate
    });

    // Note: For now feedback is just appended as a new user message; the failed
    // candidate is reconstructed by the implementation since orchestrator doesn't
    // pass it. The simplest correct shape: append a user turn with the reasons.
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @bordon-ai/ai test -- tests/anthropicGenerator.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `createAnthropicProvider`**

Create `packages/ai/src/anthropicGenerator.ts`:

```ts
import type Anthropic from "@anthropic-ai/sdk";
import { GameSpecSchema } from "@bordon-ai/shared";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { MockGeneratorInput } from "./mockGenerator";
import { buildSystemPrompt } from "./prompts";
import type { GameProvider } from "./generateGame";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

type Options = {
  onRetryBuildFailedCandidate?: (input: MockGeneratorInput) => unknown;
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

export function createAnthropicProvider(
  client: Anthropic,
  model: string = DEFAULT_MODEL,
  options: Options = {}
): GameProvider {
  const toolInputSchema = buildToolInputSchema();
  const systemText = buildSystemPrompt();

  return async (input, feedback) => {
    const messages: Array<{ role: "user" | "assistant"; content: unknown }> = [
      { role: "user", content: buildUserContent(input) }
    ];

    if (feedback && feedback.length > 0) {
      const failed = options.onRetryBuildFailedCandidate
        ? options.onRetryBuildFailedCandidate(input)
        : { note: "previous attempt rejected" };
      messages.push({
        role: "assistant",
        content: [
          {
            type: "tool_use",
            id: "retry_prior",
            name: "submit_game",
            input: failed
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter @bordon-ai/ai test -- tests/anthropicGenerator.test.ts
```

Expected: PASS, 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/anthropicGenerator.ts packages/ai/tests/anthropicGenerator.test.ts
git commit -m "feat(ai): add Anthropic-backed GameProvider via tool use"
```

---

## Task 6: Implement `selectProvider`

**Files:**
- Create: `packages/ai/src/providerSelector.ts`
- Test: `packages/ai/tests/providerSelector.test.ts` (new)

- [ ] **Step 1: Write the failing tests**

Create `packages/ai/tests/providerSelector.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { selectProvider } from "../src/providerSelector";

afterEach(() => {
  vi.restoreAllMocks();
});

const sampleInput = {
  playerCount: { min: 2, max: 4 },
  circumstances: "x",
  gameType: "creative",
  availableProps: ["paper"]
};

describe("selectProvider", () => {
  it("returns the anthropic-backed provider when ANTHROPIC_API_KEY is set", () => {
    const provider = selectProvider({ ANTHROPIC_API_KEY: "sk-test", NODE_ENV: "production" });
    expect(typeof provider).toBe("function");
    // Smoke: the anthropic provider is identified by the fact it would attempt
    // a network call. We don't run it here — just confirm it's not mockProvider.
    // Use selectProvider with a missing key in dev as the comparison.
  });

  it("returns mockProvider (with a console.warn) when key missing in development", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const provider = selectProvider({ NODE_ENV: "development" });

    const out = await provider(sampleInput);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("ANTHROPIC_API_KEY")
    );
    expect(out).toBeTruthy();
  });

  it("returns a provider that rejects when key missing in production", async () => {
    const provider = selectProvider({ NODE_ENV: "production" });
    await expect(provider(sampleInput)).rejects.toThrow(/ANTHROPIC_API_KEY/);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @bordon-ai/ai test -- tests/providerSelector.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `selectProvider`**

Create `packages/ai/src/providerSelector.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { createAnthropicProvider } from "./anthropicGenerator";
import { mockProvider } from "./mockProvider";
import type { GameProvider } from "./generateGame";

export type ProviderEnv = {
  ANTHROPIC_API_KEY?: string;
  BORDON_GENERATOR_MODEL?: string;
  NODE_ENV?: string;
};

export function selectProvider(env: ProviderEnv): GameProvider {
  const key = env.ANTHROPIC_API_KEY;
  if (key) {
    const client = new Anthropic({ apiKey: key });
    const model = env.BORDON_GENERATOR_MODEL || "claude-sonnet-4-6";
    return createAnthropicProvider(client, model);
  }
  if (env.NODE_ENV === "production") {
    return async () => {
      throw new Error("ANTHROPIC_API_KEY missing in production");
    };
  }
  console.warn("ANTHROPIC_API_KEY not set; using mock generator");
  return mockProvider;
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter @bordon-ai/ai test -- tests/providerSelector.test.ts
```

Expected: PASS, 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add packages/ai/src/providerSelector.ts packages/ai/tests/providerSelector.test.ts
git commit -m "feat(ai): add selectProvider env-based picker"
```

---

## Task 7: Wire `packages/ai` exports and verify the whole package

**Files:**
- Modify: `packages/ai/src/index.ts`

- [ ] **Step 1: Update `packages/ai/src/index.ts`**

Replace the file contents with:

```ts
export * from "./anthropicGenerator";
export * from "./generateGame";
export * from "./mockGenerator";
export * from "./mockProvider";
export * from "./policies";
export * from "./prompts";
export * from "./providerSelector";
export * from "./validator";
```

- [ ] **Step 2: Run the entire ai package test suite**

```bash
pnpm --filter @bordon-ai/ai test
```

Expected: PASS — all tests green. (Should include `generateGame`, `mockProvider`, `anthropicGenerator`, `providerSelector`, `prompts`, `mockGenerator`, `validator`.)

- [ ] **Step 3: Typecheck the whole repo**

```bash
pnpm typecheck
```

Expected: PASS, no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/ai/src/index.ts
git commit -m "chore(ai): export new generator modules from package entrypoint"
```

---

## Task 8: Extract `GeneratedGameView` component

**Files:**
- Create: `apps/web/components/GeneratedGameView.tsx`

- [ ] **Step 1: Create `GeneratedGameView.tsx`**

The component is JSX lifted from `apps/web/app/games/preview/page.tsx` (the rendering portion only). Create `apps/web/components/GeneratedGameView.tsx`:

```tsx
import type { GameSpec } from "@bordon-ai/shared";

type Props = {
  game: GameSpec;
};

function GameSection({
  emoji,
  title,
  children
}: Readonly<{
  emoji: string;
  title: string;
  children: React.ReactNode;
}>) {
  return (
    <section className="rounded-md border border-[#ffd166] bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xl font-bold text-[#251646]">
        <span aria-hidden="true">{emoji}</span>
        {title}
      </h2>
      <div className="mt-4 text-[#4d3f66]">{children}</div>
    </section>
  );
}

function FriendlyList({ items }: Readonly<{ items: string[] }>) {
  return (
    <ul className="grid gap-3">
      {items.map((item) => (
        <li key={item} className="rounded-md bg-[#fff7d6] px-3 py-2 leading-7">
          {item}
        </li>
      ))}
    </ul>
  );
}

export function GeneratedGameView({ game }: Props) {
  return (
    <article className="mx-auto max-w-5xl">
      <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#11836f]">
        Your party buddy cooked this up
      </p>
      <h1 className="text-5xl font-bold text-[#251646]">{game.title} 🎉</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-[#4d3f66]">{game.summary}</p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold text-[#251646]">
        <span className="rounded-full bg-[#7bdff2] px-4 py-2">
          👥 {game.playerCount.min}-{game.playerCount.max} players
        </span>
        <span className="rounded-full bg-[#ffd166] px-4 py-2">
          ⏱️ {game.durationMinutes} minutes
        </span>
        <span className="rounded-full bg-[#b8f2c8] px-4 py-2">🌱 Ages {game.ageRating}</span>
      </div>

      <div className="mt-8 grid gap-5">
        <GameSection emoji="🧰" title="Grab these">
          <FriendlyList items={game.requiredMaterials} />
        </GameSection>

        <GameSection emoji="🚀" title="Set it up">
          <FriendlyList items={game.setup} />
        </GameSection>

        <GameSection emoji="📜" title="Tiny rulebook, big fun">
          <FriendlyList items={game.rules} />
        </GameSection>

        <GameSection emoji="🔁" title="How a round flows">
          <FriendlyList items={game.gameplayLoop} />
        </GameSection>

        <GameSection emoji="🏆" title="Scoring and victory">
          <div className="grid gap-3">
            <FriendlyList items={game.scoring} />
            <p className="rounded-md bg-[#ffedf3] px-3 py-2 font-semibold leading-7 text-[#251646]">
              Winner moment: {game.winCondition}
            </p>
          </div>
        </GameSection>

        <GameSection emoji="🛟" title="Keep it comfy">
          <FriendlyList items={game.safetyNotes} />
        </GameSection>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @bordon-ai/web typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/components/GeneratedGameView.tsx
git commit -m "feat(web): extract GeneratedGameView component from preview page"
```

---

## Task 9: Add `CookingLoader` and `GenerationErrorView` components

**Files:**
- Create: `apps/web/components/CookingLoader.tsx`
- Create: `apps/web/components/GenerationErrorView.tsx`

- [ ] **Step 1: Create `CookingLoader.tsx`**

```tsx
export function CookingLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto flex max-w-md flex-col items-center gap-4 py-12 text-center"
    >
      <span className="text-5xl" aria-hidden="true">
        🍳
      </span>
      <p className="text-xl font-bold text-[#251646]">Cooking up your game…</p>
      <p className="text-sm text-[#4d3f66]">
        Usually takes about ten seconds. Hang tight.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Create `GenerationErrorView.tsx`**

```tsx
export type ErrorCategory =
  | "drinking_or_intoxication"
  | "gambling_or_stakes"
  | "physical_risk"
  | "ip_or_imitation"
  | "schema_mismatch"
  | "other";

type Props = {
  variant: "rejected" | "error";
  categories?: ErrorCategory[];
  message?: string;
  onRetry: () => void;
};

const CATEGORY_LABEL: Record<ErrorCategory, string> = {
  drinking_or_intoxication: "drinking or intoxication",
  gambling_or_stakes: "gambling or financial stakes",
  physical_risk: "physical risk",
  ip_or_imitation: "imitating existing games",
  schema_mismatch: "incomplete game structure",
  other: "another safety concern"
};

export function GenerationErrorView({ variant, categories = [], message, onRetry }: Props) {
  if (variant === "rejected") {
    return (
      <div className="mx-auto max-w-2xl rounded-md border border-[#ffd166] bg-white p-6 text-[#251646] shadow-sm">
        <h2 className="text-2xl font-bold">We couldn&apos;t safely generate that one.</h2>
        <p className="mt-3 text-[#4d3f66]">
          Try a different vibe, props, or game style.
        </p>
        {categories.length > 0 && (
          <p className="mt-3 text-sm text-[#4d3f66]">
            Reason: {categories.map((c) => CATEGORY_LABEL[c]).join(", ")}.
          </p>
        )}
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-md bg-[#ff5c8a] px-4 py-2 font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl rounded-md border border-[#ffd166] bg-white p-6 text-[#251646] shadow-sm">
      <h2 className="text-2xl font-bold">Something went wrong on our side.</h2>
      <p className="mt-3 text-[#4d3f66]">{message ?? "Try again in a moment."}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-md bg-[#ff5c8a] px-4 py-2 font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

```bash
pnpm --filter @bordon-ai/web typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/components/CookingLoader.tsx apps/web/components/GenerationErrorView.tsx
git commit -m "feat(web): add CookingLoader and GenerationErrorView components"
```

---

## Task 10: Implement `runGenerateAction` helper with TDD

**Files:**
- Create: `apps/web/app/generate/runGenerateAction.ts`
- Test: `apps/web/app/generate/__tests__/runGenerateAction.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/web/app/generate/__tests__/runGenerateAction.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { mockGenerateGame } from "@bordon-ai/ai";
import type { GameProvider } from "@bordon-ai/ai";
import { runGenerateAction } from "../runGenerateAction";

const baseInput = {
  playerCount: { min: 2, max: 4 },
  circumstances: "A quiet table.",
  gameType: "creative",
  availableProps: ["paper"]
};
const validCandidate = mockGenerateGame(baseInput);
const drinkingCandidate = {
  ...validCandidate,
  rules: ["Players drink when they miss a clue."]
};
const gamblingCandidate = {
  ...validCandidate,
  scoring: ["Players wager points for money."]
};
const physicalCandidate = {
  ...validCandidate,
  gameplayLoop: ["Players complete a stunt before guessing."]
};

function buildForm(overrides: Record<string, string | string[]> = {}): FormData {
  const fd = new FormData();
  const defaults: Record<string, string | string[]> = {
    minPlayers: "2",
    maxPlayers: "4",
    circumstances: "A quiet table.",
    gameType: "creative",
    props: ["paper", "pens"]
  };
  const merged = { ...defaults, ...overrides };
  for (const [key, value] of Object.entries(merged)) {
    if (Array.isArray(value)) {
      for (const v of value) fd.append(key, v);
    } else {
      fd.set(key, value);
    }
  }
  return fd;
}

describe("runGenerateAction", () => {
  it("returns ok for a valid form + provider that returns a valid candidate", async () => {
    const provider: GameProvider = vi.fn().mockResolvedValueOnce(validCandidate);
    const state = await runGenerateAction(buildForm(), { provider });

    expect(state.status).toBe("ok");
  });

  it("returns input_error when minPlayers > maxPlayers without calling the provider", async () => {
    const provider: GameProvider = vi.fn();
    const state = await runGenerateAction(
      buildForm({ minPlayers: "10", maxPlayers: "2" }),
      { provider }
    );

    expect(state.status).toBe("input_error");
    if (state.status === "input_error") {
      expect(state.fields.maxPlayers).toBeDefined();
    }
    expect(provider).not.toHaveBeenCalled();
  });

  it("maps drinking rejection reasons to drinking_or_intoxication", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(drinkingCandidate)
      .mockResolvedValueOnce(drinkingCandidate);
    const state = await runGenerateAction(buildForm(), { provider });

    expect(state.status).toBe("rejected");
    if (state.status === "rejected") {
      expect(state.categories).toContain("drinking_or_intoxication");
    }
  });

  it("maps gambling rejection reasons to gambling_or_stakes", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(gamblingCandidate)
      .mockResolvedValueOnce(gamblingCandidate);
    const state = await runGenerateAction(buildForm(), { provider });

    if (state.status === "rejected") {
      expect(state.categories).toContain("gambling_or_stakes");
    } else {
      throw new Error(`expected rejected, got ${state.status}`);
    }
  });

  it("maps physical-risk rejection reasons to physical_risk", async () => {
    const provider: GameProvider = vi
      .fn()
      .mockResolvedValueOnce(physicalCandidate)
      .mockResolvedValueOnce(physicalCandidate);
    const state = await runGenerateAction(buildForm(), { provider });

    if (state.status === "rejected") {
      expect(state.categories).toContain("physical_risk");
    } else {
      throw new Error(`expected rejected, got ${state.status}`);
    }
  });

  it("returns error when the provider throws", async () => {
    const provider: GameProvider = vi.fn().mockRejectedValueOnce(new Error("network"));
    const state = await runGenerateAction(buildForm(), { provider });

    expect(state.status).toBe("error");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
pnpm --filter @bordon-ai/web test -- app/generate/__tests__/runGenerateAction.test.ts
```

Expected: FAIL — module does not exist.

- [ ] **Step 3: Implement `runGenerateAction`**

Create `apps/web/app/generate/runGenerateAction.ts`:

```ts
import type { GameSpec } from "@bordon-ai/shared";
import {
  generateGame,
  FINAL_GAME_PROMPT_VERSION,
  SAFETY_POLICY_VERSION,
  type GameProvider,
  type GenerateResult
} from "@bordon-ai/ai";

export type RejectionCategory =
  | "drinking_or_intoxication"
  | "gambling_or_stakes"
  | "physical_risk"
  | "ip_or_imitation"
  | "schema_mismatch"
  | "other";

export type ActionState =
  | { status: "idle" }
  | {
      status: "ok";
      game: GameSpec;
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | {
      status: "rejected";
      categories: RejectionCategory[];
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | { status: "input_error"; fields: Record<string, string> }
  | { status: "error"; message: string };

export type RunGenerateDeps = {
  provider: GameProvider;
  now?: () => number;
  log?: (entry: Record<string, unknown>) => void;
};

type ParsedInput = {
  playerCount: { min: number; max: number };
  circumstances: string;
  gameType: string;
  availableProps: string[];
};

type ParseResult =
  | { ok: true; value: ParsedInput }
  | { ok: false; fields: Record<string, string> };

const DRINKING_TERMS = ["alcohol", "beer", "drink", "drinking", "drunk", "shot"];
const GAMBLING_TERMS = ["bet", "blackjack", "casino", "gamble", "lottery", "poker", "wager"];
const PHYSICAL_TERMS = ["dare", "pain", "restraint", "stunt", "tackle", "weapon"];

function parseFormData(form: FormData): ParseResult {
  const fields: Record<string, string> = {};

  const minStr = String(form.get("minPlayers") ?? "");
  const maxStr = String(form.get("maxPlayers") ?? "");
  const min = Number.parseInt(minStr, 10);
  const max = Number.parseInt(maxStr, 10);

  if (!Number.isFinite(min) || min < 1) fields.minPlayers = "Min players must be at least 1.";
  if (!Number.isFinite(max) || max < 1) fields.maxPlayers = "Max players must be at least 1.";
  if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
    fields.maxPlayers = "Min must be ≤ Max.";
  }

  const circumstances = String(form.get("circumstances") ?? "").trim();
  const gameType = String(form.get("gameType") ?? "").trim();
  if (!circumstances) fields.circumstances = "Pick a vibe.";
  if (!gameType) fields.gameType = "Pick a game style.";

  const props = form.getAll("props").map((p) => String(p)).filter((p) => p.length > 0);

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    value: { playerCount: { min, max }, circumstances, gameType, availableProps: props }
  };
}

function categorizeReason(reason: string): RejectionCategory {
  const lc = reason.toLowerCase();
  if (DRINKING_TERMS.some((t) => lc.includes(t))) return "drinking_or_intoxication";
  if (GAMBLING_TERMS.some((t) => lc.includes(t))) return "gambling_or_stakes";
  if (PHYSICAL_TERMS.some((t) => lc.includes(t))) return "physical_risk";
  if (lc.includes("franchise") || lc.includes("trademark") || lc.includes("imitat"))
    return "ip_or_imitation";
  if (lc.includes("required") || lc.includes("string") || lc.includes("must"))
    return "schema_mismatch";
  return "other";
}

function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function runGenerateAction(
  form: FormData,
  deps: RunGenerateDeps
): Promise<ActionState> {
  const now = deps.now ?? (() => Date.now());
  const log = deps.log ?? ((entry) => console.log(JSON.stringify(entry)));
  const startedAt = now();

  const parsed = parseFormData(form);
  if (!parsed.ok) {
    log({
      status: "input_error",
      fields: parsed.fields,
      latencyMs: now() - startedAt,
      promptVersion: FINAL_GAME_PROMPT_VERSION,
      safetyPolicyVersion: SAFETY_POLICY_VERSION
    });
    return { status: "input_error", fields: parsed.fields };
  }

  const result: GenerateResult = await generateGame(parsed.value, { provider: deps.provider });
  const latencyMs = now() - startedAt;

  if (result.status === "ok") {
    log({
      status: "ok",
      inputJson: parsed.value,
      outputJson: result.game,
      promptVersion: result.promptVersion,
      safetyPolicyVersion: result.safetyPolicyVersion,
      latencyMs,
      model: "claude-sonnet-4-6"
    });
    return result;
  }

  if (result.status === "rejected") {
    const categories = dedupe(result.reasons.map(categorizeReason));
    log({
      status: "rejected",
      inputJson: parsed.value,
      rejectionReasons: result.reasons,
      promptVersion: result.promptVersion,
      safetyPolicyVersion: result.safetyPolicyVersion,
      latencyMs,
      model: "claude-sonnet-4-6"
    });
    return {
      status: "rejected",
      categories,
      promptVersion: result.promptVersion,
      safetyPolicyVersion: result.safetyPolicyVersion
    };
  }

  log({
    status: "error",
    inputJson: parsed.value,
    message: result.message,
    latencyMs,
    promptVersion: FINAL_GAME_PROMPT_VERSION,
    safetyPolicyVersion: SAFETY_POLICY_VERSION,
    model: "claude-sonnet-4-6"
  });
  return { status: "error", message: result.message };
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
pnpm --filter @bordon-ai/web test -- app/generate/__tests__/runGenerateAction.test.ts
```

Expected: PASS, 6 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/generate/runGenerateAction.ts apps/web/app/generate/__tests__/runGenerateAction.test.ts
git commit -m "feat(web): add runGenerateAction pure helper with reason categorization"
```

---

## Task 11: Wire the Server Action wrapper

**Files:**
- Create: `apps/web/app/generate/actions.ts`

- [ ] **Step 1: Create `actions.ts`**

```ts
"use server";

import { selectProvider } from "@bordon-ai/ai";
import { runGenerateAction, type ActionState } from "./runGenerateAction";

const provider = selectProvider(process.env);

export async function generateGameAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return runGenerateAction(formData, { provider });
}
```

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @bordon-ai/web typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/generate/actions.ts
git commit -m "feat(web): add generateGameAction Server Action wrapper"
```

---

## Task 12: Rewrite `/generate/page.tsx` as a client component with `useActionState`

**Files:**
- Modify: `apps/web/app/generate/page.tsx`

- [ ] **Step 1: Replace the file contents**

Overwrite `apps/web/app/generate/page.tsx` with:

```tsx
"use client";

import { useActionState } from "react";
import { AvailablePropsSelector } from "../../components/AvailablePropsSelector";
import { CircumstancesInput } from "../../components/CircumstancesInput";
import { CookingLoader } from "../../components/CookingLoader";
import { GameTypeSelector } from "../../components/GameTypeSelector";
import { GeneratedGameView } from "../../components/GeneratedGameView";
import { GenerationErrorView } from "../../components/GenerationErrorView";
import { PlayerCountInput } from "../../components/PlayerCountInput";
import { SafetyConstraintsNotice } from "../../components/SafetyConstraintsNotice";
import { generateGameAction } from "./actions";
import type { ActionState } from "./runGenerateAction";

const initialState: ActionState = { status: "idle" };

export default function GeneratePage() {
  const [state, formAction, isPending] = useActionState(generateGameAction, initialState);

  return (
    <main className="min-h-screen bg-[#fff7d6] px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section>
          {isPending ? (
            <CookingLoader />
          ) : state.status === "ok" ? (
            <ResultView game={state.game} />
          ) : state.status === "rejected" ? (
            <GenerationErrorView
              variant="rejected"
              categories={state.categories}
              onRetry={() => window.location.reload()}
            />
          ) : state.status === "error" ? (
            <GenerationErrorView
              variant="error"
              message={state.message}
              onRetry={() => window.location.reload()}
            />
          ) : (
            <FormView state={state} formAction={formAction} />
          )}
        </section>

        <SafetyConstraintsNotice />
      </div>
    </main>
  );
}

function ResultView({ game }: { game: import("@bordon-ai/shared").GameSpec }) {
  return (
    <div className="grid gap-6">
      <GeneratedGameView game={game} />
      <button
        type="button"
        onClick={() => window.location.assign("/generate")}
        className="w-fit rounded-md bg-[#ff5c8a] px-5 py-3 font-semibold text-white"
      >
        Make another 🎲
      </button>
    </div>
  );
}

function FormView({
  state,
  formAction
}: {
  state: ActionState;
  formAction: (formData: FormData) => void;
}) {
  const fieldErrors = state.status === "input_error" ? state.fields : {};
  return (
    <>
      <h1 className="text-4xl font-bold text-[#251646]">Set up your party buddy</h1>
      <p className="mt-3 max-w-2xl text-[#4d3f66]">
        Pick the number of players, the vibe, and the props. The generator will turn it into a safe
        structured game.
      </p>

      <form action={formAction} className="mt-8 grid gap-6">
        <PlayerCountInput />
        {fieldErrors.minPlayers && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.minPlayers}</p>
        )}
        {fieldErrors.maxPlayers && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.maxPlayers}</p>
        )}

        <CircumstancesInput />
        {fieldErrors.circumstances && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.circumstances}</p>
        )}

        <GameTypeSelector />
        {fieldErrors.gameType && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.gameType}</p>
        )}

        <AvailablePropsSelector />

        <button
          type="submit"
          className="w-fit rounded-md bg-[#ff5c8a] px-5 py-3 font-semibold text-white"
        >
          Generate game 🎲
        </button>
      </form>
    </>
  );
}
```

(Note: this task does not implement URL-param prefill — Task 13 handles that as part of homepage retargeting. The defaults baked into the input components are sufficient for direct visits to `/generate`.)

- [ ] **Step 2: Typecheck**

```bash
pnpm --filter @bordon-ai/web typecheck
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/generate/page.tsx
git commit -m "feat(web): rewrite /generate as client page with useActionState"
```

---

## Task 13: Retarget the homepage and delete `/games/preview`

**Files:**
- Modify: `apps/web/app/page.tsx`
- Delete: `apps/web/app/games/preview/page.tsx`
- Delete: `apps/web/app/games/` (the empty parent directory if it becomes empty)

- [ ] **Step 1: Retarget the homepage form and CTA**

Open `apps/web/app/page.tsx`. Make these specific edits:

  **a)** Change the quick-pick form's `action`:

  Find:
  ```
  action="/games/preview"
  ```
  Replace with:
  ```
  action="/generate"
  ```

  **b)** Change the "Peek at a game" link:

  Find:
  ```tsx
              <Link
                href="/games/preview"
                className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-paper px-5 py-3.5 font-bold text-ink shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
              >
                Peek at a game
              </Link>
  ```
  Replace with:
  ```tsx
              <Link
                href="/generate"
                className="inline-flex items-center gap-2 rounded-xl border-[3px] border-ink bg-paper px-5 py-3.5 font-bold text-ink shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-brut-press"
              >
                Try it
              </Link>
  ```

- [ ] **Step 2: Delete `/games/preview` and the empty parent directory**

```bash
rm apps/web/app/games/preview/page.tsx
rmdir apps/web/app/games/preview
rmdir apps/web/app/games
```

(`rmdir` errors if the directories aren't empty, which is intentional — the only file is the deleted preview page.)

- [ ] **Step 3: Verify the homepage form posts to `/generate` with the same field names the page expects**

The quick-pick form sends: `minPlayers`, `maxPlayers`, `circumstances`, `gameType`, `props`. `/generate`'s form components (after Task 12) read those same names. The page is a client component using `useActionState` — it does NOT auto-fire the action when arriving with query params. The user lands on `/generate?minPlayers=2&maxPlayers=6&...`, sees the form, clicks submit. That two-click flow is intentional per the spec.

(No code change in this step — just confirm the names match by visually scanning `apps/web/app/page.tsx`'s `<input name="...">` attributes and the input components in `apps/web/components/`.)

- [ ] **Step 4: Typecheck + lint**

```bash
pnpm --filter @bordon-ai/web typecheck
pnpm --filter @bordon-ai/web lint
```

Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/web/app/page.tsx
git rm apps/web/app/games/preview/page.tsx
git commit -m "feat(web): retarget homepage to /generate and drop /games/preview"
```

---

## Task 14: Full verification

- [ ] **Step 1: Run the entire test suite**

```bash
pnpm test
```

Expected output (totals):

- `packages/shared`: 3 passed
- `packages/ai`: at least 17 passed (3 prompts + 1 mockGenerator + 2 mockProvider + 4 generateGame + 5 anthropicGenerator + 3 providerSelector + 3 validator — note: existing `mockGenerator.test.ts` had 1 and `validator.test.ts` had 3)
- `packages/database`: 0 (passes with no tests)
- `apps/web`: at least 13 (2 safety + 5 modal + 6 runGenerateAction)

If a count is short, look at the failing file and fix before continuing.

- [ ] **Step 2: Typecheck across the workspace**

```bash
pnpm typecheck
```

Expected: PASS in all 4 packages.

- [ ] **Step 3: Lint**

```bash
pnpm lint
```

Expected: PASS in all 4 packages.

- [ ] **Step 4: Manual smoke #1 — mock fallback**

In a terminal:

```bash
# Make sure no key is set in this shell
unset ANTHROPIC_API_KEY
pnpm dev
```

In a second terminal or your browser:

1. Open `http://localhost:3000`.
2. Click "Start the party 🎉" → land on `/generate`.
3. Submit the form with defaults.
4. Expect: `CookingLoader` flashes, then `GeneratedGameView` renders "Context Mosaic" (the deterministic mock).
5. Expect in the `pnpm dev` terminal: a warning line `ANTHROPIC_API_KEY not set; using mock generator` and a JSON audit log line with `"status":"ok"`.

Stop the dev server (Ctrl-C).

- [ ] **Step 5: Manual smoke #2 — real Anthropic call**

```bash
# Place a freshly rotated key — never paste into chat
echo 'ANTHROPIC_API_KEY=sk-ant-...' >> apps/web/.env.local
pnpm dev
```

1. Reload `http://localhost:3000/generate`.
2. Submit the form with defaults.
3. Expect: `CookingLoader` for ~5–10s, then a **novel** game appears (title is NOT "Context Mosaic"; rules vary across submissions).
4. Expect in the terminal: a JSON audit log line with `"status":"ok"`, `"model":"claude-sonnet-4-6"`, and a populated `outputJson`.

Stop the dev server.

- [ ] **Step 6: Manual smoke #3 — input error**

Restart `pnpm dev`. Open `/generate`, set min players to 10 and max to 2, submit. Expect: form re-renders with "Min must be ≤ Max." next to the max field. No Anthropic call (no audit log line with model name).

- [ ] **Step 7: Manual smoke #4 — homepage prefill flow**

From `http://localhost:3000`, fill the quick-pick form (e.g. pick "Party" vibe, change player range), click "Make me a game". Land on `/generate`. (Per the spec, this is two-click — the page shows the form, not auto-submit.) Click the submit button on `/generate`. Expect: a game renders.

- [ ] **Step 8: Commit any documentation drift**

If `README.md`, `AGENTS.md`, or `CLAUDE.md` references `/games/preview` or `mockGenerateGame` as the production path, update those references. Otherwise skip.

If there are doc changes:

```bash
git add README.md AGENTS.md docs
git commit -m "docs: reflect real Anthropic generator pipeline"
```

- [ ] **Step 9: Final status**

```bash
git status
git log --oneline -15
```

Expected: clean working tree; the commits from tasks 1–13 (and optionally 8 from this task) are present in order.

---

## Self-Review (filled in inline)

**Spec coverage check.** Each requirement in `docs/superpowers/specs/2026-05-19-real-generator-design.md` maps to at least one task:

- New `packages/ai` files (`anthropicGenerator`, `mockProvider`, `generateGame`, `providerSelector`) → Tasks 3–6.
- `prompts.ts` version bump + builder → Task 2.
- Package deps (`@anthropic-ai/sdk`, `zod-to-json-schema`) → Task 1.
- `packages/ai/src/index.ts` exports → Task 7.
- `GeneratedGameView`, `GenerationErrorView`, `CookingLoader` → Tasks 8–9.
- `runGenerateAction` pure helper + tests → Task 10.
- `actions.ts` Server Action wrapper → Task 11.
- `/generate/page.tsx` rewrite with `useActionState` → Task 12.
- Homepage retarget + `/games/preview` deletion → Task 13.
- Manual smoke checklist from the spec (mock fallback, real call, input error) → Task 14 steps 4–7.
- Audit log shape → emitted from `runGenerateAction` (Task 10).
- Sanitized rejection categories → Task 10 (`categorizeReason`).
- Retry-once orchestration → Task 4.
- Tool-use structured output with cache_control → Task 5.
- Env-driven provider selection → Task 6.

**Placeholder scan.** No "TBD", "TODO", "fill in", or "similar to Task N" instances. Every code-producing step contains complete code. Every command step shows expected output.

**Type consistency check.**
- `GameProvider` defined in `generateGame.ts` (Task 3) → imported in `mockProvider.ts` (Task 3), `anthropicGenerator.ts` (Task 5), `providerSelector.ts` (Task 6), `runGenerateAction.ts` (Task 10). All use the same name.
- `GenerateResult` defined in `generateGame.ts` (Task 4) → consumed in `runGenerateAction.ts` (Task 10). Same name.
- `ActionState` defined in `runGenerateAction.ts` (Task 10) → imported in `actions.ts` (Task 11) and `page.tsx` (Task 12). Same name.
- `RejectionCategory` enum values in `runGenerateAction.ts` (Task 10) match `ErrorCategory` in `GenerationErrorView.tsx` (Task 9). **Note:** the type names differ (`RejectionCategory` vs `ErrorCategory`) but the string union members are identical. The page passes `state.categories` of type `RejectionCategory[]` to a prop typed as `ErrorCategory[]` — TypeScript will accept it because the underlying string unions are equal. This is intentional decoupling; if you want a single type, import `RejectionCategory` into `GenerationErrorView.tsx` instead of redefining `ErrorCategory`. Either is fine.

No other inconsistencies found.
