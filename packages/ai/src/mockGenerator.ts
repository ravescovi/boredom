import type { GameSpec, PlayerConfig } from "@bordom-ai/shared";
import { GameSpecSchema } from "@bordom-ai/shared";

export type MockGeneratorInput = {
  playerCount: PlayerConfig;
  circumstances: string;
  gameType: string;
  availableProps: string[];
};

export function mockGenerateGame(input: MockGeneratorInput): GameSpec {
  const props = input.availableProps.length > 0 ? input.availableProps : ["paper", "pens"];

  return GameSpecSchema.parse({
    id: "mock_context_mosaic",
    title: "Context Mosaic",
    summary:
      "Players turn details from the current setting into clues and shared guesses.",
    playerCount: input.playerCount,
    durationMinutes: 20,
    ageRating: "8+",
    requiredMaterials: props,
    setup: [
      `Use this context: ${input.circumstances}`,
      "Give each player a writing surface or shared note area.",
      "Decide who goes first — youngest player starts, or roll to pick."
    ],
    rules: [
      "Each player writes one clue inspired by something in the current setting.",
      "Clues should be short — a word, phrase, or single sentence.",
      "Players guess which detail inspired each clue."
    ],
    turnStructure: [
      "One player reads a clue.",
      "Everyone else writes one guess.",
      "The clue author reveals the intended detail."
    ],
    gameplayLoop: [
      "Create a clue.",
      "Read the clue.",
      "Collect guesses.",
      "Reveal the answer and award points."
    ],
    scoring: [
      "Guessers earn one point for matching the intended detail.",
      "The clue author earns one point if at least one player guesses correctly."
    ],
    winCondition: "After every player has authored two clues, the highest score wins.",
    edgeCases: [
      "If no one guesses correctly, the clue author briefly explains the clue and play continues.",
      "If players tie, they share the win."
    ],
    variants: [
      `For a ${input.gameType} feel, require clues to fit that tone.`
    ],
    safetyNotes: [
      "This game uses seated or stationary discussion and writing only.",
      "No drinking, gambling, financial stakes, risky movement, dares, weapons, pain, or restraint are included."
    ],
    commercialUseAllowed: false
  });
}
