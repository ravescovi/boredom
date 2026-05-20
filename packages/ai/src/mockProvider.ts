import { mockGenerateGame } from "./mockGenerator";
import type { GameProvider } from "./generateGame";

export const mockProvider: GameProvider = async (input) => {
  return mockGenerateGame(input);
};
