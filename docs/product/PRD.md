# Bordon.ai PRD

## Summary

Bordon.ai helps people turn boredom into safe, structured, original games. Users provide context such as number of players, circumstances, preferred game type, and available props. The AI can ask clarification questions, then returns a ruleset as structured JSON.

## v0 Goals

- Generate safe, original game rules from user context.
- Validate every generated game against a standard `GameSpec` schema.
- Render Markdown from the validated JSON source of truth.
- Save games, support shareable links, and preserve game versions.
- Support copy/remix metadata without permitting commercial use.
- Track generation events for quota and future paid plans.

## Non-Goals

- Production auth.
- Payment processing.
- External AI provider calls.
- Commercial licensing for generated games.
- Drinking, gambling, betting, wagering, financial-stakes, or physical-risk games.

## Primary Flow

1. User enters player count, circumstances, game type, and props.
2. System asks clarification questions if context is insufficient.
3. Generator returns a `GameSpec` JSON object.
4. Validator rejects unsafe or schema-invalid output.
5. UI renders Markdown from JSON.
6. User saves, shares, copies, or remixes the game within quota rules.

## Safety Requirements

Generated games must not include drinking, intoxication, gambling, betting, wagering, lotteries, financial stakes, dangerous dares, stunts, pain, restraint, weapons, unsafe movement, or IP-infringing imitation.
