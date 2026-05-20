import Anthropic from "@anthropic-ai/sdk";
import { createAnthropicProvider } from "./anthropicGenerator";
import { mockProvider } from "./mockProvider";
import type { GameProvider } from "./generateGame";

export type ProviderEnv = {
  ANTHROPIC_API_KEY?: string;
  BORDON_GENERATOR_MODEL?: string;
  NODE_ENV?: string;
};

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

export function selectProvider(env: ProviderEnv): GameProvider {
  const key = env.ANTHROPIC_API_KEY;
  if (key) {
    const client = new Anthropic({ apiKey: key });
    const model = env.BORDON_GENERATOR_MODEL || DEFAULT_MODEL;
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

export type StreamingClient =
  | { mode: "anthropic"; client: Anthropic; model: string }
  | { mode: "mock" }
  | { mode: "unavailable"; reason: string };

export function selectStreamingClient(env: ProviderEnv): StreamingClient {
  const key = env.ANTHROPIC_API_KEY;
  if (key) {
    return {
      mode: "anthropic",
      client: new Anthropic({ apiKey: key }),
      model: env.BORDON_GENERATOR_MODEL || DEFAULT_MODEL
    };
  }
  if (env.NODE_ENV === "production") {
    return { mode: "unavailable", reason: "ANTHROPIC_API_KEY missing in production" };
  }
  return { mode: "mock" };
}
