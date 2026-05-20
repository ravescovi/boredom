import type { GameSpec } from "./schemas";

function renderList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

export function renderGameSpecMarkdown(game: GameSpec): string {
  return [
    `# ${game.title}`,
    game.summary,
    `Players: ${game.playerCount.min}-${game.playerCount.max}`,
    `Duration: ${game.durationMinutes} minutes`,
    `Age rating: ${game.ageRating}`,
    "## Required Materials",
    renderList(game.requiredMaterials),
    "## Setup",
    renderList(game.setup),
    "## Rules",
    renderList(game.rules),
    "## Turn Structure",
    renderList(game.turnStructure),
    "## Gameplay Loop",
    renderList(game.gameplayLoop),
    "## Scoring",
    renderList(game.scoring),
    "## Win Condition",
    game.winCondition,
    "## Edge Cases",
    renderList(game.edgeCases),
    "## Variants",
    renderList(game.variants),
    "## Safety Notes",
    renderList(game.safetyNotes)
  ].join("\n\n");
}
