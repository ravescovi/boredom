export type SafetyPromise = {
  id: "drinking" | "gambling" | "physical" | "original";
  emoji: string;
  title: string;
  note: string;
};

export const safetyPromises: readonly SafetyPromise[] = [
  {
    id: "drinking",
    emoji: "🥤",
    title: "No drinking games.",
    note: "Fun stays clear-headed."
  },
  {
    id: "gambling",
    emoji: "🎲",
    title: "No gambling.",
    note: "No bets, wagers, or financial stakes."
  },
  {
    id: "physical",
    emoji: "🛋️",
    title: "No physical risk.",
    note: "Designed for safe, seated, cozy play."
  },
  {
    id: "original",
    emoji: "✨",
    title: "Original only.",
    note: "No franchise copycats. No commercialization."
  }
];
