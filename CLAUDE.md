# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root unless noted. Package manager is pnpm 9 (workspaces).

- `pnpm dev` — runs only the Next.js app (`@bordon-ai/web`).
- `pnpm build` / `pnpm lint` / `pnpm test` / `pnpm typecheck` — fan out across all workspaces via `pnpm -r`.
- `pnpm format` — Prettier across the whole repo.
- `pnpm --filter @bordon-ai/ai test -- tests/validator.test.ts` — run a single Vitest file in one package. Pass `-t "<name>"` to filter by test name.
- `pnpm --filter @bordon-ai/database db:migrate` — Prisma dev migration (requires `DATABASE_URL`).

There is no root-level Vitest config; each package owns its own `test` script. `apps/web` and `packages/database` use `--passWithNoTests`, so test files only live in `packages/shared` and `packages/ai` today.

## Architecture

The repo is a pnpm monorepo with one app and three packages. Dependency direction is `apps/web` → `@bordon-ai/ai` → `@bordon-ai/shared`. `@bordon-ai/database` is currently standalone (only re-exports `PrismaClient`). TS path aliases in `tsconfig.base.json` resolve workspace packages directly to their `src/index.ts`, so no build step is needed for cross-package imports during dev.

**JSON is the source of truth.** The canonical generated artifact is a `GameSpec` (defined in `packages/shared/src/schemas.ts` as a Zod schema). Markdown is *only* a rendered view, produced by `renderGameSpecMarkdown` in the same package. See `docs/decisions/0001-json-source-markdown-render.md`. Never invert this: don't parse Markdown into JSON, don't store Markdown as the canonical record, don't bypass `GameSpecSchema` when constructing a game.

**Generation boundary.** `packages/ai/src/mockGenerator.ts` stands in for a real model in v0. The pipeline is: form input → generator → `validateGeneratedGameSpec` (`packages/ai/src/validator.ts`) → store/display. The validator does two things: (1) Zod-parses against `GameSpecSchema`, (2) scans all gameplay fields except `safetyNotes` for terms in the `unsafeTerms` list. Any future real provider must return JSON only and pass through this same validator before reaching storage or UI.

**Versioned policies and prompts.** `SAFETY_POLICY_VERSION`, `IP_AVOIDANCE_POLICY_VERSION`, `CLARIFICATION_PROMPT_VERSION`, and `FINAL_GAME_PROMPT_VERSION` are exported strings in `packages/ai/src`. Prisma's `GenerationEvent` and `GameVersion` store `promptVersion` and `safetyPolicyVersion` on every row — bump the version constants whenever prompt text or policy semantics change so audit history stays meaningful.

**Database.** Prisma schema in `packages/database/prisma/schema.prisma` (Postgres). `GameVersion` is immutable and stores `specJson` plus the optional rendered `markdownSnapshot`. `GenerationEvent` is the audit/quota record; `rejectionReasons` is a `String[]` populated from the validator's failure reasons.

## Safety Constraints (Hard Rules)

These are product invariants, not stylistic preferences. They must hold across product code, prompts, schemas, tests, and docs (see `AGENTS.md`, `docs/ai/SAFETY_POLICY.md`):

- No drinking/intoxication, gambling/betting/wagering/lotteries/financial stakes, physical-risk mechanics, dangerous dares/stunts/pain/restraint/weapons/unsafe movement, IP infringement, or commercialization.
- `GameSpecSchema` pins `commercialUseAllowed: z.literal(false)` and `SafetyPolicySchema` pins each `prohibits*` flag to `z.literal(true)` — do not relax these.
- Any schema or policy change requires a corresponding test in `packages/shared/tests` or `packages/ai/tests`.
- Do not add external API keys, paid services, or production AI providers without explicit instruction. Auth, payments, and sharing workflows are intentionally deferred.
