import Anthropic from "@anthropic-ai/sdk";
import { createAnthropicProvider } from "./anthropicGenerator";
import { mockProvider } from "./mockProvider";
import type { GameProvider } from "./generateGame";

export type ProviderEnv = {
  ANTHROPIC_API_KEY?: string;
  BORDON_GENERATOR_MODEL?: string;
  NODE_ENV?: string;
};

export function selectProvider(env: ProviderEnv): GameProvider {
  const key = env.ANTHROPIC_API_KEY;
  if (key) {
    const client = new Anthropic({ apiKey: key });
    const model = env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001";
    return createAnthropicProvider(client, model);
  }
  if (env.NODE_ENV === "production") {
    return async () => {
      throw new Error("ANTHROPIC_API_KEY missing in production");
    };
  }
  console.warn("ANTHROPIC_API_KEY not set; using mock generator");
  return mockProvider;
}
