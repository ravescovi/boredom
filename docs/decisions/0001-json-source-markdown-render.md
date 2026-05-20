# 0001: JSON Source, Markdown Render

## Status

Accepted.

## Context

Bordon.ai needs generated games to be safe, structured, versionable, shareable, and renderable in multiple formats.

## Decision

The canonical generated artifact is a validated `GameSpec` JSON object. Markdown is rendered from JSON and is never the source of truth.

## Consequences

- Safety and schema validation happen against structured data.
- The UI can render consistent previews.
- Database versions can preserve exact generated JSON.
- Markdown can be regenerated when presentation changes.
