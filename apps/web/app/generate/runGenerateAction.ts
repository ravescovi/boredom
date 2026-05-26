import type { GameSpec } from "@bordom-ai/shared";
import {
  generateGame,
  FINAL_GAME_PROMPT_VERSION,
  SAFETY_POLICY_VERSION,
  type GameProvider,
  type GenerateResult
} from "@bordom-ai/ai";

export type RejectionCategory =
  | "drinking_or_intoxication"
  | "gambling_or_stakes"
  | "physical_risk"
  | "ip_or_imitation"
  | "schema_mismatch"
  | "other";

export type ActionState =
  | { status: "idle" }
  | {
      status: "ok";
      game: GameSpec;
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | {
      status: "rejected";
      categories: RejectionCategory[];
      promptVersion: string;
      safetyPolicyVersion: string;
    }
  | { status: "input_error"; fields: Record<string, string> }
  | { status: "error"; message: string };

export type RunGenerateDeps = {
  provider: GameProvider;
  now?: () => number;
  log?: (entry: Record<string, unknown>) => void;
};

export type ParsedInput = {
  playerCount: { min: number; max: number };
  circumstances: string;
  gameType: string;
  availableProps: string[];
};

export type ParseResult =
  | { ok: true; value: ParsedInput }
  | { ok: false; fields: Record<string, string> };

const DRINKING_TERMS = ["alcohol", "beer", "drink", "drinking", "drunk", "shot"];
const GAMBLING_TERMS = ["bet", "blackjack", "casino", "gamble", "lottery", "poker", "wager"];
const PHYSICAL_TERMS = ["dare", "pain", "restraint", "stunt", "tackle", "weapon"];

const RANDOM_CIRCUMSTANCES = [
  "Friends relaxing indoors with paper, pens, and a 20-minute window.",
  "A cheerful group gathered around a table with snacks, phones away, paper, and pens.",
  "People waiting together with limited space, low energy, and a need for quick laughs.",
  "A relaxed conversation setting with comfortable seats and simple materials.",
  "A long road trip with everyone seated and a desire for a portable game.",
  "An office break room with whiteboard, sticky notes, and a 15-minute lull."
];
const RANDOM_GAME_TYPES = ["creative", "conversation", "puzzle", "collaborative", "party-light"];
const RANDOM_PROP_POOLS: string[][] = [
  ["paper", "pens"],
  ["paper", "pens", "timer"],
  ["cards"],
  ["paper", "sticky notes"],
  ["whiteboard", "pens"],
  ["dice", "paper", "pens"]
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInput(): ParsedInput {
  const min = 2 + Math.floor(Math.random() * 3);
  const max = min + 2 + Math.floor(Math.random() * 4);
  return {
    playerCount: { min, max },
    circumstances: pick(RANDOM_CIRCUMSTANCES),
    gameType: pick(RANDOM_GAME_TYPES),
    availableProps: pick(RANDOM_PROP_POOLS)
  };
}

export function parseFormData(form: FormData): ParseResult {
  const fields: Record<string, string> = {};

  const minStr = String(form.get("minPlayers") ?? "");
  const maxStr = String(form.get("maxPlayers") ?? "");
  const min = Number.parseInt(minStr, 10);
  const max = Number.parseInt(maxStr, 10);

  if (!Number.isFinite(min) || min < 1) fields.minPlayers = "Min players must be at least 1.";
  if (!Number.isFinite(max) || max < 1) fields.maxPlayers = "Max players must be at least 1.";
  if (Number.isFinite(min) && Number.isFinite(max) && min > max) {
    fields.maxPlayers = "Min must be ≤ Max.";
  }

  const circumstances = String(form.get("circumstances") ?? "").trim();
  const gameType = String(form.get("gameType") ?? "").trim();
  if (!circumstances) fields.circumstances = "Pick a vibe.";
  if (!gameType) fields.gameType = "Pick a game style.";

  const props = form
    .getAll("props")
    .map((p) => String(p))
    .filter((p) => p.length > 0);

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    value: { playerCount: { min, max }, circumstances, gameType, availableProps: props }
  };
}

export function categorizeReason(reason: string): RejectionCategory {
  const lc = reason.toLowerCase();
  if (DRINKING_TERMS.some((t) => lc.includes(t))) return "drinking_or_intoxication";
  if (GAMBLING_TERMS.some((t) => lc.includes(t))) return "gambling_or_stakes";
  if (PHYSICAL_TERMS.some((t) => lc.includes(t))) return "physical_risk";
  if (lc.includes("franchise") || lc.includes("trademark") || lc.includes("imitat"))
    return "ip_or_imitation";
  if (lc.includes("required") || lc.includes("string") || lc.includes("must"))
    return "schema_mismatch";
  return "other";
}

export function dedupe<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export async function runGenerateAction(
  form: FormData,
  deps: RunGenerateDeps
): Promise<ActionState> {
  const now = deps.now ?? (() => Date.now());
  const log = deps.log ?? ((entry) => console.log(JSON.stringify(entry)));
  const startedAt = now();

  const isRandom = form.get("random") === "1";
  const parsed: ParseResult = isRandom ? { ok: true, value: randomInput() } : parseFormData(form);
  if (!parsed.ok) {
    log({
      status: "input_error",
      fields: parsed.fields,
      latencyMs: now() - startedAt,
      promptVersion: FINAL_GAME_PROMPT_VERSION,
      safetyPolicyVersion: SAFETY_POLICY_VERSION
    });
    return { status: "input_error", fields: parsed.fields };
  }

  const result: GenerateResult = await generateGame(parsed.value, { provider: deps.provider });
  const latencyMs = now() - startedAt;

  if (result.status === "ok") {
    log({
      status: "ok",
      inputJson: parsed.value,
      outputJson: result.game,
      promptVersion: result.promptVersion,
      safetyPolicyVersion: result.safetyPolicyVersion,
      latencyMs,
      model: process.env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001"
    });
    return result;
  }

  if (result.status === "rejected") {
    const categories = dedupe(result.reasons.map(categorizeReason));
    log({
      status: "rejected",
      inputJson: parsed.value,
      rejectionReasons: result.reasons,
      promptVersion: result.promptVersion,
      safetyPolicyVersion: result.safetyPolicyVersion,
      latencyMs,
      model: process.env.BORDON_GENERATOR_MODEL || "claude-haiku-4-5-20251001"
    });
    return {
      status: "rejected",
      categories,
      promptVersion: result.promptVersion,
      safetyPolicyVersion: result.safetyPolicyVersion
    };
  }

  log({
    status: "error",
    inputJson: parsed.value,
    message: result.message,
    latencyMs,
    promptVersion: FINAL_GAME_PROMPT_VERSION,
    safetyPolicyVersion: SAFETY_POLICY_VERSION,
    model: "claude-sonnet-4-6"
  });
  return { status: "error", message: result.message };
}
