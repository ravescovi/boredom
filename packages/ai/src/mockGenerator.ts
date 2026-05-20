import type { GameSpec, PlayerConfig } from "@bordon-ai/shared";
import { GameSpecSchema } from "@bordon-ai/shared";

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
      "A safe, original game where players turn details from the current setting into clues and shared guesses.",
    playerCount: input.playerCount,
    durationMinutes: 20,
    ageRating: "8+",
    requiredMaterials: props,
    approvedComponents: [
      {
        id: "component_context_clue",
        name: "Context Clue",
        description: "A prompt based on ordinary, safe details from the current setting.",
        category: "rule",
        safetyReviewed: true
      },
      {
        id: "component_table_turn",
        name: "Table Turn",
        description: "A seated or stationary turn structure with no physical-risk actions.",
        category: "turn",
        safetyReviewed: true
      }
    ],
    setup: [
      `Use this context: ${input.circumstances}`,
      "Give each player a writing surface or shared note area.",
      "Agree that all clues must be original, safe, and non-commercial."
    ],
    rules: [
      "Each player writes one original clue inspired by the current setting.",
      "Clues may not reference protected franchises, existing games, risky actions, intoxication, or stakes.",
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
      `For a ${input.gameType} feel, require clues to fit that tone while remaining safe and original.`
    ],
    safetyNotes: [
      "This game uses seated or stationary discussion and writing only.",
      "No drinking, gambling, financial stakes, risky movement, dares, weapons, pain, or restraint are included."
    ],
    commercialUseAllowed: false
  });
}
