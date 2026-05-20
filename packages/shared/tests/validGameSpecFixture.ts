import type { GameSpec } from "../src";

export const validGameSpecFixture: GameSpec = {
  id: "game_pattern_relay",
  title: "Pattern Relay",
  summary: "A calm creative guessing game about building and decoding original patterns.",
  playerCount: { min: 2, max: 6 },
  durationMinutes: 20,
  ageRating: "8+",
  requiredMaterials: ["paper", "pens", "timer"],
  approvedComponents: [
    {
      id: "component_original_pattern_prompt",
      name: "Original Pattern Prompt",
      description: "Players create simple original symbol patterns for others to interpret.",
      category: "rule",
      safetyReviewed: true
    }
  ],
  setup: ["Give each player paper and a pen.", "Set a timer for two-minute rounds."],
  rules: [
    "Players describe patterns without copying protected game formats.",
    "Players keep all prompts safe, non-physical, and non-commercial."
  ],
  turnStructure: ["One player draws an original pattern.", "Other players write a short guess."],
  gameplayLoop: [
    "Reveal the pattern.",
    "Read guesses aloud.",
    "Award points for close, clever, or funny interpretations."
  ],
  scoring: ["One point for a close guess.", "One point for the creator's favorite safe guess."],
  winCondition: "The player with the most points after five rounds wins.",
  edgeCases: ["If there is a tie, tied players share the win."],
  variants: ["Team mode: pairs create patterns together."],
  safetyNotes: ["No physical actions, stakes, intoxication, or risky dares are part of the game."],
  commercialUseAllowed: false
};
