// Local-only smoke: drives the real Anthropic generator end-to-end through the same
// modules the Server Action uses. Not part of the build. Run with:
//   pnpm dlx tsx scripts/smoke-real-generator.mjs
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const envText = readFileSync(join(repoRoot, "apps/web/.env.local"), "utf8");
for (const line of envText.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) process.env[m[1]] = m[2].trim();
}

const aiModule = await import(join(repoRoot, "packages/ai/src/index.ts"));
const { generateGame, selectProvider } = aiModule;

const input = {
  playerCount: { min: 3, max: 5 },
  circumstances:
    "Friends gathered around a kitchen table with paper, pens, and a 25-minute window.",
  gameType: "creative",
  availableProps: ["paper", "pens"]
};

const provider = selectProvider(process.env);
const started = Date.now();
const result = await generateGame(input, { provider });
const ms = Date.now() - started;

console.log("\n=== Result ===");
console.log(`status: ${result.status}`);
console.log(`latency: ${ms}ms`);
if (result.status === "ok") {
  console.log(`promptVersion: ${result.promptVersion}`);
  console.log(`safetyPolicyVersion: ${result.safetyPolicyVersion}`);
  console.log(`\nTitle: ${result.game.title}`);
  console.log(`Summary: ${result.game.summary}`);
  console.log(
    `Players: ${result.game.playerCount.min}-${result.game.playerCount.max}, Duration: ${result.game.durationMinutes}min, Age: ${result.game.ageRating}`
  );
  console.log(`\nRules (${result.game.rules.length}):`);
  for (const r of result.game.rules) console.log(`  - ${r}`);
  console.log(`\nWinCondition: ${result.game.winCondition}`);
} else if (result.status === "rejected") {
  console.log(`reasons: ${JSON.stringify(result.reasons, null, 2)}`);
} else {
  console.log(`message: ${result.message}`);
}
