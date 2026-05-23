# 0002: Net-Vote Scoring (not averaged star ratings)

## Status

Accepted.

## Context

Two rating models were prototyped in parallel branches:

- **`main`**: a single integer `Game.score` incremented by one "star" vote, with
  per-visitor dedup via a `bordon_stars` cookie. The scoreboard ranks by `score`.
- **`backup-local-feat`** (since deleted): a 1–5 star *average*
  (`ratingSum`/`ratingCount`) with a `GameRating` join table keying each rating to
  a `raterCookieId`, plus UUID permalinks.

Only one could be the source of truth. The production database had actually been
migrated to the `backup-local-feat` shape, which is part of what caused the
schema drift documented in [[0003-prod-db-reset-and-auto-migrate]].

## Decision

Use the **net-vote `score`** model from `main`:

- `Game.score` is a monotonic up-vote count; `POST /api/games/[shortId]/star`
  increments it once per `bordon_stars` cookie.
- The scoreboard ranks by `score` then `createdAt`.
- The 1–5 star average model and its `GameRating` table are not used.

## Consequences

- Simpler data model (one integer, no join table) and a one-tap interaction that
  fits the party-game tone better than a 1–5 judgement.
- Cookie-based dedup is best-effort, not identity-backed — acceptable until auth
  exists. A determined user can clear cookies to re-vote.
- No average/quality signal, only popularity. If nuanced ratings are needed later,
  revisit — the deleted star model is recoverable from git history (commit
  `0de1f20`).
