# Real Generator (Anthropic) — Design Spec

**Date:** 2026-05-19
**Status:** Approved, ready for implementation plan
**Scope:** Replace the hardcoded `mockGenerateGame` stub with a real Anthropic-backed generator that turns form inputs into a validated, novel `GameSpec`. No persistence in this round.

## Goals

- Submitting the form on `/generate` calls Anthropic, validates the result against `GameSpecSchema` + the unsafe-term policy, and renders a novel game.
- Every model output passes through `validateGeneratedGameSpec` before reaching the UI. No exceptions.
- Generator failure modes (validator rejection, transport errors, missing key, bad form input) each have a clear, user-facing state.
- The existing deterministic `mockGenerateGame` survives as a test fixture and as a dev fallback when `ANTHROPIC_API_KEY` is not set.
- CI runs entirely offline — no test ever calls the real Anthropic API.

**Non-goals.** No persistence, no `Game` / `GameVersion` / `GenerationEvent` rows, no shareable URLs, no clarification round-trip, no auth, no streaming responses, no quota enforcement. Those are explicitly deferred to a later round.

## Decisions Log

| Fork | Choice | Reasoning |
|---|---|---|
| Engine | Real Anthropic LLM | User explicitly authorized; `CLAUDE.md` requires explicit instruction. |
| Model | `claude-sonnet-4-6` | Best creativity/cost balance for a ~2KB JSON payload at acceptable latency (~5–10s). |
| Mock fate | Keep as fallback + test fixture | Lets CI run offline; lets contributors run `pnpm dev` without a key. |
| Interaction | Single-shot | Clarification round-trip is out of scope; prompt template stays defined but unused. |
| Validator failure | Retry once with feedback, then friendly error | Bounded cost; gives the model one chance to self-correct on its own bad output. |
| Call shape | Next.js Server Action + `useActionState` | Idiomatic App Router, keeps `ANTHROPIC_API_KEY` server-side, no separate API surface. |
| Result delivery | Approach A — collapse `/generate` into one page that swaps form → result in place | Matches no-DB scope; deletes the orphaned `/games/preview` URL. |
| Structured output | Anthropic tool use (`submit_game` tool with `GameSpecSchema` → JSON Schema) | More reliable than text+parse; the validator remains the final safety boundary. |
| Prompt caching | `cache_control: ephemeral` on the static system block | Static safety/IP/schema content reused on every call; ~70% input-token savings on warm calls. |

## Architecture

```
form submit  →  Server Action (apps/web/app/generate/actions.ts)
                  └─ generateGame(input, { provider })           ← new orchestrator in packages/ai
                       └─ selectProvider(env) → anthropicProvider | mockProvider
                       └─ validateGeneratedGameSpec()             ← existing single safety boundary
                       └─ retry once with validator reasons fed back into the prompt
                  →  returns ActionState { status, … }
              ↓
useActionState in apps/web/app/generate/page.tsx swaps view in place:
  form  →  CookingLoader  →  GeneratedGameView  |  GenerationErrorView
```

**Provider seam.** `packages/ai` exposes a `GameProvider = (input, feedback?) => Promise<unknown>` interface. Two implementations: `anthropicProvider` (real call, takes an injected `Anthropic` client for testability) and `mockProvider` (wraps `mockGenerateGame`). `selectProvider(env)` picks based on `ANTHROPIC_API_KEY` presence + `NODE_ENV`.

**Validator stays the single safety boundary.** Every provider output, real or mock, passes through `validateGeneratedGameSpec` before reaching the UI.

## Components

### `packages/ai`

| File | Status | What | Interface | Depends on |
|---|---|---|---|---|
| `anthropicGenerator.ts` | new | Turn `(input, feedback?)` into an unvalidated JSON candidate. Builds messages, calls Anthropic via tool use, returns `tool_use.input` as `unknown`. | `anthropicProvider({ client, input, feedback? }) → Promise<unknown>` | `@anthropic-ai/sdk`, `prompts.ts`, `policies.ts`, `zod-to-json-schema` |
| `generateGame.ts` | new | Orchestrate one full attempt: provider → validate → retry once with reasons → discriminated result. Hard cap of 2 provider calls per request. | `generateGame(input, { provider }) → Promise<GenerateResult>` | `validator.ts`, `prompts.ts`, `policies.ts` |
| `providerSelector.ts` | new | Pick `anthropicProvider` or `mockProvider` based on `ANTHROPIC_API_KEY` + `NODE_ENV`. Pure function of env. | `selectProvider(env) → GameProvider` | nothing app-side |
| `prompts.ts` | modified | Bump `FINAL_GAME_PROMPT_VERSION` from `final-game-v0.1.0` → `final-game-v0.2.0`. Replace template with one that names the `submit_game` tool, embeds the safety/IP policy text, and slots the user input. | constant strings | `policies.ts` |
| `index.ts` | modified | Add exports for new modules. | — | — |
| `package.json` | modified | Add runtime deps: `@anthropic-ai/sdk`, `zod-to-json-schema`. | — | — |
| `mockGenerator.ts` | unchanged | Deterministic fixture; wrapped by `mockProvider` adapter. | as today | — |
| `validator.ts`, `policies.ts` | unchanged | Single safety boundary. | as today | — |

### `apps/web`

| File | Status | What | Interface |
|---|---|---|---|
| `app/generate/actions.ts` | new | `"use server"` export. One-line forwarder to `runGenerateAction`. | `generateGameAction(prev, formData) → Promise<ActionState>` |
| `app/generate/runGenerateAction.ts` | new | Pure helper: parses `FormData`, calls `generateGame`, maps validator reasons to `RejectionCategory[]`, returns `ActionState`. Takes deps explicitly so tests can inject a fake provider. | `runGenerateAction(formData, deps) → Promise<ActionState>` |
| `app/generate/page.tsx` | modified → client | Drives the form with `useActionState`; swaps between form / loader / result / error. | — |
| `components/GeneratedGameView.tsx` | new | Pure render of a `GameSpec`. JSX lifted from the deleted preview page. | `<GeneratedGameView game={…} />` |
| `components/GenerationErrorView.tsx` | new | Friendly "we couldn't make a safe game" + retry button. Renders categories, never raw unsafe terms. | `<GenerationErrorView state={…} onRetry={…} />` |
| `components/CookingLoader.tsx` | new, small | "Cooking up a game…" skeleton during `isPending`. | `<CookingLoader />` |
| `app/games/preview/page.tsx`, `app/games/` | deleted | Vestige of the old query-string flow (see *Homepage integration* below for the migration). | — |
| `app/page.tsx` | modified | Quick-pick `<form action>` and "Peek at a game" `<Link>` retargeted from `/games/preview` to `/generate`. | — |

### Type contracts

```ts
// packages/ai/src/generateGame.ts
export type GameProvider = (
  input: MockGeneratorInput,
  feedback?: string[],
) => Promise<unknown>;

export type GenerateResult =
  | { status: "ok"; game: GameSpec; promptVersion: string; safetyPolicyVersion: string }
  | { status: "rejected"; reasons: string[]; promptVersion: string; safetyPolicyVersion: string }
  | { status: "error"; message: string };

// apps/web/app/generate/runGenerateAction.ts
export type RejectionCategory =
  | "drinking_or_intoxication"
  | "gambling_or_stakes"
  | "physical_risk"
  | "ip_or_imitation"
  | "schema_mismatch"
  | "other";

export type ActionState =
  | { status: "idle" }
  | { status: "ok"; game: GameSpec; promptVersion: string; safetyPolicyVersion: string }
  | { status: "rejected"; categories: RejectionCategory[]; promptVersion: string; safetyPolicyVersion: string }
  | { status: "input_error"; fields: Record<string, string> }
  | { status: "error"; message: string };
```

`GenerateResult` is what the orchestrator returns. `ActionState` is the superset the page sees — it adds `idle` (initial render) and `input_error` (form validation failure, no Anthropic call burned). Raw validator reasons stay server-side; only opaque categories cross to the client.

## Data flow

### Per-call sequence inside `anthropicGenerator`

1. Convert `GameSpecSchema` → JSON Schema via `zod-to-json-schema`.
2. Build cacheable system block: role + non-negotiable safety/IP rules + the rule that the model must call `submit_game` + `safetyPolicyText` + `ipAvoidancePolicyText`.
3. Build user message: structured inputs (`playerCount`, `circumstances`, `gameType`, `availableProps`).
4. Call:
   ```ts
   client.messages.create({
     model: "claude-sonnet-4-6",
     max_tokens: 4096,
     system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
     tools: [{ name: "submit_game", input_schema: gameSpecJsonSchema }],
     tool_choice: { type: "tool", name: "submit_game" },
     messages: [/* user turn + optional retry turns */],
   });
   ```
5. Extract the `tool_use.input` from the response → return as `unknown` candidate. If no `tool_use` block, throw — orchestrator treats it as a transport error (no retry).

### Retry-with-feedback shape (single retry only)

```
messages: [
  { role: "user", content: <original structured input> },
  { role: "assistant", content: [{ type: "tool_use", id, name: "submit_game", input: <failed candidate> }] },
  { role: "user", content:
      "That game failed validation for these reasons:\n" +
      reasons.map(r => `- ${r}`).join("\n") +
      "\nGenerate a new game that addresses every reason. Call submit_game again."
  }
]
```

### Budget guards (orchestrator)

- Hard cap: 2 Anthropic calls per request.
- Each call wrapped in `AbortController` with a 30s timeout.
- On thrown exception (network, 5xx, timeout, malformed SDK response): no retry, return `error`. Retry is reserved for **validator failures** (model produced something unsafe/malformed in content) — transport failures shouldn't compound cost.

## Error handling

| State | Trigger | UI | Copy |
|---|---|---|---|
| pending | `isPending` from `useActionState` | `CookingLoader` | "Cooking up your game…" with animated stickers |
| ok | `status: "ok"` | `GeneratedGameView` | Full game + "Make another" button that resets to form |
| rejected | Validator rejected twice | `GenerationErrorView` | "We couldn't safely generate from those inputs. Try a different vibe or props." + "Try again" |
| input_error | `min > max`, or any Zod fail on form data | form re-renders with inline messages | e.g. "Min must be ≤ Max." |
| error | Transport failure, missing key in prod, malformed SDK response | `GenerationErrorView` (different copy) | "Something went wrong on our side. Try again." + "Try again" |

### Reason sanitization

Validator reasons today are strings like `"Unsafe policy term detected: drink"` or Zod `"String must contain at least 1 character"`. We do **not** echo those to the client. `runGenerateAction` maps each raw reason to a `RejectionCategory` before returning. Reasoning:

- Avoids reflecting user-pasted unsafe content back into HTML.
- Avoids giving a bypass roadmap to anyone probing the policy.
- Gives the UI a stable enum to switch on for tone/icon.

Raw reasons stay server-side in the audit log.

### Env-dependent provider selection (`providerSelector.ts`)

- `ANTHROPIC_API_KEY` set → real provider, regardless of `NODE_ENV`.
- Key missing + `NODE_ENV !== "production"` → `mockProvider`, with `console.warn("ANTHROPIC_API_KEY not set; using mock generator")`.
- Key missing + `NODE_ENV === "production"` → returns a provider whose first call rejects with a sentinel error; action maps to `status: "error"`. No silent degradation to mock in production.

### Server-side audit log

On every action call, emit one JSON line via `console.log` with:

```json
{
  "inputJson": {...},
  "outputJson": {...} | null,
  "status": "ok" | "rejected" | "error" | "input_error",
  "rejectionReasons": [...],
  "promptVersion": "final-game-v0.2.0",
  "safetyPolicyVersion": "safety-policy-v0.1.0",
  "latencyMs": 5210,
  "retryAttempted": false,
  "model": "claude-sonnet-4-6"
}
```

This is the audit shape the v0 PRD calls out. When persistence lands in a future round, the same struct maps 1:1 onto a `GenerationEvent` insert — no rework needed.

## Testing strategy

**Principle: zero real Anthropic calls in tests.** Every new unit takes its provider/client via dependency injection so a fake substitutes in.

### New test files

| File | Verifies |
|---|---|
| `packages/ai/tests/anthropicGenerator.test.ts` | Fake `Anthropic` client captures request payload: (1) `system` block has safety/IP text + `cache_control: ephemeral`; (2) `tools` contains `submit_game` with the schema; (3) `tool_choice` forces that tool; (4) on retry, messages include failed `tool_use` assistant turn + reasons in next user turn; (5) returns `tool_use.input` as candidate; (6) throws if response has no `tool_use`. |
| `packages/ai/tests/generateGame.test.ts` | Orchestrator with injected fake `GameProvider`. (a) valid on first call → `ok`, 1 call. (b) invalid → valid → `ok`, 2 calls, second receives validator reasons. (c) invalid twice → `rejected`, 2 calls, reasons present. (d) provider throws → `error`, 1 call (no retry on transport). |
| `packages/ai/tests/providerSelector.test.ts` | Pure function of env. (a) key set → anthropic. (b) key missing + dev → mock + warn (capture via `vi.spyOn(console, "warn")`). (c) key missing + prod → a provider whose call rejects with the sentinel. |
| `apps/web/app/generate/__tests__/runGenerateAction.test.ts` | Pure helper: valid form → `ok`; `min > max` → `input_error` with `fields.maxPlayers` set; orchestrator returns rejected → action maps reasons to correct `RejectionCategory` (one assertion per category); orchestrator returns error → `status: error`. |

### Existing tests stay green

- `packages/shared/tests/gameSpec.test.ts` (3)
- `packages/ai/tests/mockGenerator.test.ts` (1)
- `packages/ai/tests/validator.test.ts` (3)
- `apps/web/components/__tests__/SafetyPromiseModal.test.tsx` (5)
- `apps/web/lib/__tests__/safety.test.ts` (2)

### Manual smoke checklist

1. `pnpm dev` *with* `ANTHROPIC_API_KEY` in `apps/web/.env.local` → submit form → real game appears in 5–10s; server log shows `status: "ok"` and `model: "claude-sonnet-4-6"`.
2. `pnpm dev` *without* key → submit form → mock game appears; console warns `ANTHROPIC_API_KEY not set; using mock generator`.
3. Submit with `minPlayers=10, maxPlayers=2` → form re-renders with inline "Min must be ≤ Max."

### Coverage philosophy

Every new function gets at least one happy-path test and one primary-failure test. No numeric threshold.

## Homepage integration

The current `apps/web/app/page.tsx` has two entry points that target the deleted `/games/preview`:

1. Quick-pick `<form action="/games/preview">` with `minPlayers`, `maxPlayers`, `circumstances`, `gameType`, and hidden `props` inputs.
2. A `<Link href="/games/preview">Peek at a game</Link>` CTA.

Both retarget to `/generate`. To preserve the homepage's "one-click party" intent without making the homepage itself trigger an Anthropic call:

- The quick-pick form posts to `/generate` (default GET, query string).
- `/generate` reads `searchParams` and uses them as **form defaults** for the existing input components.
- The user clicks the existing submit button on `/generate` to fire the Server Action.

This becomes a two-click flow from the homepage instead of one, which is acceptable for v0. Auto-submit-on-mount is explicitly rejected: it would burn an Anthropic call on any prefilled deep link (including bots and prefetchers).

The "Peek at a game" link's prior meaning (render a static demo of the mock) no longer exists — there is no canonical demo URL. The link is rewritten to `/generate` with sensible defaults preselected via query string and its label changed (e.g. "Try it"). Exact copy is an implementation detail for the plan phase.

## Versioning

- `FINAL_GAME_PROMPT_VERSION` bumps from `final-game-v0.1.0` → `final-game-v0.2.0` because the prompt content meaningfully changes (adds schema description, names the `submit_game` tool, embeds policy text).
- `SAFETY_POLICY_VERSION` stays at `safety-policy-v0.1.0` — semantics unchanged.
- `IP_AVOIDANCE_POLICY_VERSION` stays at `ip-avoidance-v0.1.0` — semantics unchanged.
- `CLARIFICATION_PROMPT_VERSION` stays defined but unused.

## Security & secrets

- `ANTHROPIC_API_KEY` lives only in `apps/web/.env.local` (already in `.gitignore`).
- The key is read once inside the Server Action's module scope; never serialized to the client; never logged.
- No client component ever imports `@anthropic-ai/sdk` or any module that does — the `"use server"` boundary keeps that enforceable.

## Dependencies added

- `@anthropic-ai/sdk` (runtime, `packages/ai`)
- `zod-to-json-schema` (runtime, `packages/ai`)

No other new dependencies. `@bordom-ai/ai` already a workspace dep of `apps/web`, so propagation is automatic.

## Out of scope (explicit non-goals for this round)

- Persistence (Prisma client wiring, `GenerationEvent` writes, `GameVersion` rows).
- Shareable game URLs.
- Clarification round-trip UI.
- Streaming responses.
- Auth / users.
- Quota enforcement.
- E2E tests.
- Real-API integration tests (would require a live key in CI).
