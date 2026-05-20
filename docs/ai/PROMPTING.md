# Prompting

Prompt templates live in `packages/ai/src/prompts.ts` and must remain versioned.

## Clarification Prompt

The clarification prompt asks concise follow-up questions only when required context is missing. It must not introduce prohibited mechanics.

## Final Generation Prompt

The final generation prompt must require:

- JSON output only.
- Exact `GameSpec` schema conformance.
- `commercialUseAllowed: false`.
- Safety policy compliance.
- IP avoidance policy compliance.

Future provider integrations should store prompt versions on `GenerationEvent` and `GameVersion`.
