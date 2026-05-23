export type Roller = () => number;

export function shouldServeCached(rate: number, roll: Roller = Math.random): boolean {
  if (!Number.isFinite(rate) || rate <= 0) return false;
  if (rate >= 1) return true;
  return roll() < rate;
}

export function parseCacheHitRate(env: Record<string, string | undefined>): number {
  const raw = env.BORDON_CACHE_HIT_RATE;
  if (raw === undefined || raw === "") return 0.5;
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}
