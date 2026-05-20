# Bordon.ai

Bordon.ai is a web app for generating safe, structured games from context such as player count, circumstances, preferred game type, and available props.

This repository is the initial TypeScript monorepo skeleton. It uses Next.js App Router, Tailwind, Zod, Prisma, Vitest, ESLint, Prettier, and pnpm workspaces.

## Workspaces

- `apps/web`: Next.js app.
- `packages/ai`: prompt templates, safety policies, validation, and mock generation.
- `packages/database`: Prisma schema and database package placeholder.
- `packages/shared`: shared schemas, types, and render helpers.
- `docs`: product, architecture, AI, and decision docs.

## Core Product Constraints

- No drinking games.
- No gambling, betting, wagering, lotteries, or financial stakes.
- No physical-risk mechanics.
- No dangerous dares, stunts, pain, restraint, intoxication, weapons, or unsafe movement.
- No IP infringement or imitation of existing games/franchises.
- Users cannot commercialize generated games.
- JSON is the source of truth; Markdown is rendered from JSON.

## Getting Started

```bash
pnpm install
pnpm dev
pnpm test
```

## Status

This is an initial skeleton only. Auth, payments, production AI calls, and sharing workflows are intentionally not implemented yet.
