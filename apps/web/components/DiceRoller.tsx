"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DICE_TYPES = [4, 6, 8, 10, 12, 20] as const;
type DieType = (typeof DICE_TYPES)[number];

// Brand hex values — SVG fills can't use Tailwind classes.
const DIE_FILL: Record<DieType, string> = {
  4:  "#FFE45C",  // butter
  6:  "#FFFCF0",  // paper
  8:  "#5BE0B0",  // mint
  10: "#8AD7FF",  // sky
  12: "#C9B6FF",  // lilac
  20: "#FF5C8A",  // hot
};

// Tailwind bg classes for control-panel badges.
const DIE_BG: Record<DieType, string> = {
  4:  "bg-butter",
  6:  "bg-paper",
  8:  "bg-mint",
  10: "bg-sky",
  12: "bg-lilac",
  20: "bg-hot",
};

// SVG polygon outlines + label positions in a 100×100 viewBox.
// numSize: font-size for the rolled value (triangles need smaller text).
type ShapeSpec = { points: string; numY: number; labelY: number; numSize: number };
const DIE_SHAPES: Record<Exclude<DieType, 6>, ShapeSpec> = {
  // d4  — triangle (3 sides)
  4:  { points: "50,7 5,91 95,91",
        numY: 63, labelY: 74, numSize: 20 },
  // d8  — 6-sided thick diamond (wide flat sides, point top/bottom)
  8:  { points: "50,5 88,28 88,72 50,95 12,72 12,28",
        numY: 50, labelY: 62, numSize: 24 },
  // d10 — 6-sided kite (wider shoulder and hips)
  10: { points: "50,3 76,24 90,66 50,97 10,66 24,24",
        numY: 52, labelY: 64, numSize: 24 },
  // d12 — 10-sided decagon
  12: { points: "50,5 76,14 93,36 93,64 76,86 50,95 24,86 7,64 7,36 24,14",
        numY: 50, labelY: 62, numSize: 24 },
  // d20 — regular hexagon, flat top/bottom
  20: { points: "73,12 95,50 73,88 27,88 5,50 27,12",
        numY: 50, labelY: 62, numSize: 24 },
};

// ── Die face components ────────────────────────────────────────────────────

function wrapStyle(rolling: boolean, tilt: number): React.CSSProperties {
  return rolling
    ? { animation: "dice-roll 0.72s cubic-bezier(.22,1,.36,1) forwards" }
    : { transform: `rotate(${tilt}deg)`, transition: "transform 0.4s cubic-bezier(.22,1,.36,1)" };
}

// Pip layout [x%, y%] for d6.
const PIPS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[72, 28], [28, 72]],
  3: [[72, 28], [50, 50], [28, 72]],
  4: [[28, 28], [72, 28], [28, 72], [72, 72]],
  5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]],
  6: [[28, 20], [72, 20], [28, 50], [72, 50], [28, 80], [72, 80]],
};

function D6Face({ value, rolling, tilt }: { value: number; rolling: boolean; tilt: number }) {
  const pips = PIPS[value] ?? PIPS[1];
  return (
    <div
      className="relative aspect-square w-full rounded-[18px] border-[3px] border-ink bg-paper shadow-brut-lg"
      style={wrapStyle(rolling, tilt)}
    >
      {pips.map(([px, py], i) => (
        <span
          key={i}
          className="absolute rounded-full bg-ink"
          style={{ width: "17%", height: "17%", left: `${px}%`, top: `${py}%`, transform: "translate(-50%,-50%)" }}
        />
      ))}
    </div>
  );
}

function PolyDieFace({
  type, value, rolling, tilt,
}: {
  type: Exclude<DieType, 6>;
  value: number;
  rolling: boolean;
  tilt: number;
}) {
  const shape = DIE_SHAPES[type];
  return (
    <div className="aspect-square w-full" style={{ ...wrapStyle(rolling, tilt), overflow: "visible" }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ overflow: "visible", filter: "drop-shadow(4px 4px 0 #1A1A1A)" }}
      >
        {/* Filled polygon */}
        <polygon
          points={shape.points}
          fill={DIE_FILL[type]}
          stroke="#1A1A1A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* Rolled value */}
        <text
          x="50"
          y={shape.numY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily='"Bricolage Grotesque", "Arial Black", sans-serif'
          fontWeight="800"
          fontSize={shape.numSize}
          fill="#1A1A1A"
        >
          {value}
        </text>
        {/* Die-type label */}
        <text
          x="50"
          y={shape.labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="ui-monospace, monospace"
          fontWeight="600"
          fontSize="8"
          fill="#1A1A1A"
          opacity="0.4"
        >
          d{type}
        </text>
      </svg>
    </div>
  );
}

function DieFace({ type, value, rolling, tilt }: { type: DieType; value: number; rolling: boolean; tilt: number }) {
  if (type === 6) return <D6Face value={value} rolling={rolling} tilt={tilt} />;
  return <PolyDieFace type={type as Exclude<DieType, 6>} value={value} rolling={rolling} tilt={tilt} />;
}

// ── Helpers ────────────────────────────────────────────────────────────────

type DiceCounts = Record<DieType, number>;

function emptyCount(): DiceCounts {
  return { 4: 0, 6: 0, 8: 0, 10: 0, 12: 0, 20: 0 };
}

function flattenCounts(counts: DiceCounts): DieType[] {
  return DICE_TYPES.flatMap((t) => Array.from({ length: counts[t] }, () => t));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

const TOTAL_DICE_CAP = 12;

// ── Main component ─────────────────────────────────────────────────────────

export function DiceRoller() {
  const [counts, setCounts] = useState<DiceCounts>({ ...emptyCount(), 6: 2 });

  // `dieOrder` is the shuffled type-array that drives the display grid.
  // It gets re-shuffled on every roll so positions change each time.
  const [dieOrder,  setDieOrder]  = useState<DieType[]>([6, 6]);
  const [values,    setValues]    = useState<number[]>([1, 1]);
  const [tilts,     setTilts]     = useState<number[]>([0, 0]);
  const [rolling,   setRolling]   = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [rollSeed,  setRollSeed]  = useState(0);

  const finalValuesRef = useRef<number[]>([]);
  const cycleRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const canRollRef     = useRef(true);

  const totalDice = dieOrder.length;

  const roll = useCallback(() => {
    if (!canRollRef.current || dieOrder.length === 0) return;
    canRollRef.current = false;

    // Shuffle die positions on every roll.
    const shuffled = shuffle(flattenCounts(counts));
    const finals   = shuffled.map((t) => rollDie(t));
    const newTilts = shuffled.map(() => Math.random() * 12 - 6);

    finalValuesRef.current = finals;

    setDieOrder(shuffled);
    setTilts(newTilts);
    setHasRolled(true);
    setRolling(true);
    setRollSeed((s) => s + 1);

    // Slot-machine: cycle random values per die type while animating.
    if (cycleRef.current) clearInterval(cycleRef.current);
    cycleRef.current = setInterval(() => {
      setValues(shuffled.map((t) => rollDie(t)));
    }, 55);

    setTimeout(() => {
      if (cycleRef.current) clearInterval(cycleRef.current);
      setValues(finalValuesRef.current);
      setRolling(false);
      canRollRef.current = true;
    }, 750);
  }, [counts, dieOrder.length]);

  // Sync dieOrder / values when counts change.
  useEffect(() => {
    const flat = flattenCounts(counts);
    setDieOrder(flat);
    setValues(flat.map((t) => rollDie(t)));
    setTilts(flat.map(() => 0));
    setHasRolled(false);
    canRollRef.current = true;
  }, [counts]);

  // Cleanup.
  useEffect(() => () => { if (cycleRef.current) clearInterval(cycleRef.current); }, []);

  // Mouse shake.
  useEffect(() => {
    type Pt = { x: number; y: number; t: number };
    const hist: Pt[] = [];
    let lastRollAt = 0;
    const onMove = (e: MouseEvent) => {
      const now = Date.now();
      hist.push({ x: e.clientX, y: e.clientY, t: now });
      while (hist.length && now - hist[0].t > 600) hist.shift();
      if (hist.length < 6) return;
      let rev = 0;
      for (let i = 2; i < hist.length; i++) {
        const dx1 = hist[i-1].x - hist[i-2].x, dx2 = hist[i].x - hist[i-1].x;
        const dy1 = hist[i-1].y - hist[i-2].y, dy2 = hist[i].y - hist[i-1].y;
        if (Math.abs(dx1) > 8 && Math.abs(dx2) > 8 && dx1 * dx2 < 0) rev++;
        if (Math.abs(dy1) > 8 && Math.abs(dy2) > 8 && dy1 * dy2 < 0) rev++;
      }
      if (rev >= 4 && now - lastRollAt > 1000) { lastRollAt = now; hist.length = 0; roll(); }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [roll]);

  // Device-motion shake.
  useEffect(() => {
    let lastRollAt = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;
      const mag = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      const now = Date.now();
      if (mag > 25 && now - lastRollAt > 1000) { lastRollAt = now; roll(); }
    };
    window.addEventListener("devicemotion", onMotion as EventListener);
    return () => window.removeEventListener("devicemotion", onMotion as EventListener);
  }, [roll]);

  const adjustCount = (type: DieType, delta: number) => {
    setCounts((prev) => {
      const next     = { ...prev, [type]: Math.max(0, prev[type] + delta) };
      const newTotal = DICE_TYPES.reduce((s, t) => s + next[t], 0);
      return newTotal > TOTAL_DICE_CAP ? prev : next;
    });
  };

  const total = values.reduce((s, v) => s + v, 0);

  const gridCols =
    totalDice <= 1 ? 1 :
    totalDice <= 2 ? 2 :
    totalDice <= 4 ? 4 :
    totalDice <= 6 ? 3 : 4;

  const maxGridW =
    totalDice <= 1 ? 180 :
    totalDice <= 2 ? 400 :
    totalDice <= 4 ? 600 :
    totalDice <= 6 ? 580 : 760;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Controls ── */}
      <div className="grid grid-cols-2 gap-3 rounded-[18px] border-[3px] border-ink bg-paper p-5 shadow-brut-xl sm:grid-cols-3">
        {DICE_TYPES.map((type) => {
          const n = counts[type];
          const atCap = DICE_TYPES.reduce((s, t) => s + counts[t], 0) >= TOTAL_DICE_CAP;
          return (
            <div key={type} className="flex items-center gap-2">
              <span className={`flex h-10 w-14 shrink-0 items-center justify-center rounded-lg border-[3px] border-ink ${DIE_BG[type]} font-display text-[15px] font-extrabold shadow-brut-sm`}>
                d{type}
              </span>
              <button
                onClick={() => adjustCount(type, -1)}
                disabled={n === 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-ink bg-cream font-display text-[18px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-30"
              >−</button>
              <span className="w-5 text-center font-display text-[20px] font-extrabold tabular-nums leading-none">{n}</span>
              <button
                onClick={() => adjustCount(type, 1)}
                disabled={atCap}
                className="flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-ink bg-cream font-display text-[18px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-30"
              >+</button>
            </div>
          );
        })}
      </div>

      {/* ── Dice grid ── */}
      {totalDice > 0 && (
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`, maxWidth: maxGridW }}
        >
          {dieOrder.map((type, i) => (
            <DieFace
              key={`${type}-${i}-${rollSeed}`}
              type={type}
              value={values[i] ?? 1}
              rolling={rolling}
              tilt={tilts[i] ?? 0}
            />
          ))}
        </div>
      )}

      {/* ── Roll + total ── */}
      <div className="flex flex-wrap items-center gap-4">
        <button
          onClick={roll}
          disabled={totalDice === 0}
          className="rounded-xl border-[3px] border-ink bg-hot px-8 py-4 font-display text-[22px] font-extrabold -tracking-[.01em] text-paper shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-brut disabled:pointer-events-none disabled:opacity-40"
        >
          Roll 🎲
        </button>

        {hasRolled && totalDice > 1 && (
          <div className="flex items-baseline gap-2 rounded-xl border-[3px] border-ink bg-butter px-5 py-3 shadow-brut-lg">
            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">Total</span>
            <span className="font-display text-[34px] font-extrabold tabular-nums -tracking-[.02em]">{total}</span>
          </div>
        )}
      </div>

      <p className="text-[13px] font-semibold text-ink/35">
        🖱 Shake your mouse &nbsp;·&nbsp; 📱 Shake your phone
      </p>
    </div>
  );
}
