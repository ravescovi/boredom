# 0003: Production DB Reset + Auto-Migrate on Deploy

## Status

Accepted.

## Context

On 2026-05-23 production (`boredom-web.vercel.app`) was found broken: the
scoreboard returned 500 with a Prisma error. Investigation showed the production
Neon database carried the **`backup-local-feat`** schema (`inputJson`,
`inputHash`, `ratingSum`/`ratingCount`, applied via a migration
`20260520191425_add_inputs_ratings_for_v0` that does not exist in `main`), while
`main`'s code queries `shortId`/`score`/`isClassic`. The two had diverged and
`main` had been broken against this DB.

Two root causes:

1. The data models diverged between branches (see [[0002-net-vote-scoring]]); the
   DB was migrated to the model `main` did not adopt.
2. The Vercel build ran only `prisma generate && next build` — it **never applied
   migrations**, so schema changes pushed to `main` silently never reached the DB.

The database held only throwaway data (2 sample games, 3 ratings, 0 users).

## Decision

1. **Reset** the production database to `main`'s schema with
   `prisma migrate reset --force` (replaying `20260521010000_init` +
   `20260523000000_game_input_hash`). A JSON backup of the discarded rows was
   taken first.
2. **Auto-apply migrations on production deploys**: add
   `directUrl = env("DATABASE_URL_UNPOOLED")` to the datasource (Neon's PgBouncer
   pooler is unreliable for migration advisory locks/DDL) and run
   `prisma migrate deploy` from the `apps/web` build script, guarded to
   `VERCEL_ENV=production` so CI/preview/local builds skip it.

## Consequences

- Production schema now matches `main`; the scoreboard and share/star flows work.
- Future migrations apply automatically on production deploys over the direct
  connection; the silent-drift failure mode is closed.
- The guard keeps the plain `build` script DB-free, so CI and preview deploys do
  not need (or touch) a database.
- Migrations are forward-only via `migrate deploy`; destructive schema changes
  still require a deliberate, separately-reviewed migration.
