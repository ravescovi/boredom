# Data Model

## User

Placeholder user identity for v0. Production auth is not assumed.

## Game

Top-level saved game record with owner, title, summary, visibility, and current JSON.

## GameVersion

Immutable version record for a saved game. Stores `specJson`, prompt version, safety policy version, and optional Markdown snapshot rendered from JSON.

## GameRemix

Links a source game to a remixed game and records the placeholder user that performed the remix.

## GameComponentDefinition

Registry of reusable component definitions that can be approved and included in generated games.

## GenerationEvent

Audit and quota record for each generation attempt, including input JSON, optional output JSON, status, prompt version, safety policy version, and rejection reasons.
