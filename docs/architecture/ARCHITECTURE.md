# Architecture

## Monorepo Layout

- `apps/web`: Next.js App Router frontend.
- `packages/shared`: Zod schemas, TypeScript types, and Markdown rendering.
- `packages/ai`: prompt templates, safety policy text, IP policy text, mock generation, and validation.
- `packages/database`: Prisma schema and database client boundary.
- `docs`: product, architecture, AI, and decision records.

## Source of Truth

`GameSpec` JSON is the canonical artifact. Markdown exists only as a rendered view or optional snapshot for display/search convenience.

## Generation Boundary

The v0 skeleton uses `mockGenerateGame` instead of an external AI API. Future provider integration should return JSON only, then pass through schema validation and safety validation before storage or display.

## Web App

The Next.js app currently contains:

- Landing page.
- Game setup form placeholder.
- Generated game preview placeholder.
- Safety constraints notice.

Auth, persistence, quota enforcement, and payments are intentionally deferred.
