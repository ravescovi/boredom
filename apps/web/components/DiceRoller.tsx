"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HAPTIC,
  motionNeedsPermission,
  requestMotionPermission,
  usePointerCoarse,
  vibrate,
} from "../lib/haptics";

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

function wrapStyle(rolling: boolean, rotation: number, dx: number, dy: number, spinStart: number): React.CSSProperties {
  if (rolling) {
    return {
      animation: "dice-throw 0.75s cubic-bezier(.22,1,.36,1) forwards",
      "--dx": `${dx}px`,
      "--dy": `${dy}px`,
      "--r0": `${spinStart}deg`,
      "--rf": `${rotation}deg`,
    } as React.CSSProperties;
  }
  return { transform: `rotate(${rotation}deg)`, transition: "transform 0.35s cubic-bezier(.22,1,.36,1)" };
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

type DieProps = { value: number; rolling: boolean; rotation: number; dx: number; dy: number; spinStart: number };

function D6Face({ value, rolling, rotation, dx, dy, spinStart }: DieProps) {
  const pips = PIPS[value] ?? PIPS[1];
  return (
    <div
      className="relative aspect-square w-full rounded-[18px] border-[3px] border-ink bg-paper shadow-brut-lg"
      style={wrapStyle(rolling, rotation, dx, dy, spinStart)}
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

function PolyDieFace({ type, value, rolling, rotation, dx, dy, spinStart }: DieProps & { type: Exclude<DieType, 6> }) {
  const shape = DIE_SHAPES[type];
  return (
    <div className="aspect-square w-full" style={{ ...wrapStyle(rolling, rotation, dx, dy, spinStart), overflow: "visible" }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{ overflow: "visible", filter: "drop-shadow(4px 4px 0 #1A1A1A)" }}
      >
        <polygon points={shape.points} fill={DIE_FILL[type]} stroke="#1A1A1A" strokeWidth="3.5" strokeLinejoin="round" />
        <text x="50" y={shape.numY} textAnchor="middle" dominantBaseline="middle"
          fontFamily='"Bricolage Grotesque", "Arial Black", sans-serif' fontWeight="800" fontSize={shape.numSize} fill="#1A1A1A">
          {value}
        </text>
        <text x="50" y={shape.labelY} textAnchor="middle" dominantBaseline="middle"
          fontFamily="ui-monospace, monospace" fontWeight="600" fontSize="8" fill="#1A1A1A" opacity="0.4">
          d{type}
        </text>
      </svg>
    </div>
  );
}

function DieFace({ type, ...rest }: DieProps & { type: DieType }) {
  if (type === 6) return <D6Face {...rest} />;
  return <PolyDieFace type={type as Exclude<DieType, 6>} {...rest} />;
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

// Random position within the tray, keeping dice fully inside.
// Returns {x, y} as percentages of the tray, and throw deltas from edge.
const DIE_SIZE = 80; // px — must match the size used in the tray

// Place dice in a grid of cells with randomness, keeping them fully inside.
// x/y are percentages of the tray dimensions passed in.
function randomTrayPos(index: number, total: number, trayW: number, trayH: number) {
  const pad  = DIE_SIZE / 2 + 8; // px from edge — die centre never closer than this
  const safeW = trayW - pad * 2;
  const safeH = trayH - pad * 2;

  const cols  = Math.ceil(Math.sqrt(total));
  const rows  = Math.ceil(total / cols);
  const col   = index % cols;
  const row   = Math.floor(index / cols);
  const cellW = safeW / cols;
  const cellH = safeH / rows;

  // Centre of cell + random jitter (up to 40% of cell)
  const cx = pad + col * cellW + cellW / 2 + (Math.random() - 0.5) * cellW * 0.4;
  const cy = pad + row * cellH + cellH / 2 + (Math.random() - 0.5) * cellH * 0.4;

  const angle = Math.random() * Math.PI * 2;
  const dist  = 260 + Math.random() * 140;
  return {
    x: Math.min(Math.max(cx, pad), trayW - pad),
    y: Math.min(Math.max(cy, pad), trayH - pad),
    dx: Math.cos(angle) * dist,
    dy: Math.sin(angle) * dist,
    spinStart: Math.random() * 720 - 360,
    rotation: Math.random() * 50 - 25,
  };
}

const TRAY_W = 780;
const TRAY_H_BASE = 300; // grows with dice count

// ── Roll quality ───────────────────────────────────────────────────────────

const TOP_MSGS    = ["LEGENDARY! 🔥", "ARE YOU KIDDING?! 🤯", "ABSOLUTE BEAST! 💥", "TOO HOT TO HANDLE 🌶️", "THE DICE LOVE YOU 😍"];
const MID_MSGS    = ["decent roll 🎯", "solid 👍", "respectable!", "not bad at all", "that'll do 🎲"];
const BOTTOM_MSGS = ["yikes... 😬", "the dice have spoken 😐", "bold strategy 🤔", "at least you tried 💀", "maybe rub them first? 🫤"];

function rollQuality(total: number, dieTypes: DieType[]): { label: string; color: string; epic: boolean } | null {
  if (dieTypes.length < 2) return null;
  const min = dieTypes.length;
  const max = dieTypes.reduce((s, t) => s + t, 0);
  const range = max - min;
  if (range === 0) return null;
  const pct = (total - min) / range;
  if (pct >= 0.95) return { label: TOP_MSGS[Math.floor(Math.random() * TOP_MSGS.length)],       color: "bg-mint",           epic: true  };
  if (pct >= 0.8)  return { label: TOP_MSGS[Math.floor(Math.random() * TOP_MSGS.length)],       color: "bg-mint",           epic: false };
  if (pct <= 0.2)  return { label: BOTTOM_MSGS[Math.floor(Math.random() * BOTTOM_MSGS.length)], color: "bg-hot text-white", epic: false };
  return { label: MID_MSGS[Math.floor(Math.random() * MID_MSGS.length)], color: "bg-butter", epic: false };
}

const BURST_EMOJIS = ["🔥","🎲","💥","⭐","✨","🎉","🏆","💫","🌟","🎊"];

type HistoryEntry = {
  id: number;
  playerName: string;
  playerColor: string;
  dice: DieType[];
  total: number;
  quality: { label: string; color: string } | null;
};

const MAX_PLAYERS = 8;

export function DiceRoller() {
  const [counts, setCounts] = useState<DiceCounts>({ ...emptyCount(), 6: 2 });

  const [dieOrder,   setDieOrder]   = useState<DieType[]>([6, 6]);
  const [values,     setValues]     = useState<number[]>([1, 1]);
  const [positions,  setPositions]  = useState(() =>
    [0, 1].map((i) => randomTrayPos(i, 2, TRAY_W, TRAY_H_BASE))
  );
  const [rolling,    setRolling]    = useState(false);
  const [hasRolled,  setHasRolled]  = useState(false);
  const [rollSeed,   setRollSeed]   = useState(0);
  const [quality,      setQuality]      = useState<{ label: string; color: string } | null>(null);
  const [history,      setHistory]      = useState<HistoryEntry[]>([]);
  const [histExpanded, setHistExpanded] = useState(false);
  const [burst,        setBurst]        = useState<{ id: number; x: string; r: string; emoji: string; delay: string }[]>([]);

  // Players
  type DicePlayer = { name: string; avatar: string | null };
  const [players,     setPlayers]     = useState<DicePlayer[]>([{ name: "Player 1", avatar: null }, { name: "Player 2", avatar: null }]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const avatarRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Refs so roll() always sees latest values without being recreated
  const currentTurnRef = useRef(0);
  const playersRef     = useRef(players);
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);

  const canRollRef = useRef(true);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Input model: desktop shakes the mouse, touch devices shake the phone.
  // The two paths never run together (mouse-shake is gated off on coarse pointers).
  const isTouch = usePointerCoarse();
  const [motionEnabled, setMotionEnabled] = useState(false);
  const [motionDenied,  setMotionDenied]  = useState(false);
  // iOS gates DeviceMotion behind a one-shot permission tap; Android/desktop don't.
  const needsMotionPermission = isTouch && !motionEnabled && !motionDenied && motionNeedsPermission();

  // Auto-enable shake on touch devices that don't require a permission prompt.
  useEffect(() => {
    if (isTouch && !motionNeedsPermission()) setMotionEnabled(true);
  }, [isTouch]);

  const enableShake = async () => {
    const res = await requestMotionPermission();
    if (res === "granted") setMotionEnabled(true);
    else setMotionDenied(true);
  };

  const totalDice = dieOrder.length;
  const trayH = totalDice <= 3 ? TRAY_H_BASE : totalDice <= 6 ? 380 : 460;

  const roll = useCallback(() => {
    if (!canRollRef.current || dieOrder.length === 0) return;
    canRollRef.current = false;

    const shuffled = shuffle(flattenCounts(counts));
    const finals   = shuffled.map((t) => rollDie(t));
    const newPos   = shuffled.map((_, i) => randomTrayPos(i, shuffled.length, TRAY_W, trayH));

    // Set final values immediately — the animation plays out visually
    const rollTotal     = finals.reduce((s, v) => s + v, 0);
    const q             = shuffled.length >= 2 ? rollQuality(rollTotal, shuffled) : null;
    vibrate(q?.epic ? HAPTIC.epic : HAPTIC.roll);
    const turnIdx       = currentTurnRef.current;
    const currentPlayer = playersRef.current[turnIdx] ?? playersRef.current[0];
    const currentColor  = COLORS[turnIdx % COLORS.length];

    setValues(finals);
    setDieOrder(shuffled);
    setPositions(newPos);
    setHasRolled(true);
    setRolling(true);
    setRollSeed((s) => s + 1);
    setQuality(q);

    // Record history
    setHistory((h) => [{
      id: Date.now(),
      playerName:  currentPlayer.name,
      playerColor: currentColor.bg,
      dice:        shuffled,
      total:       rollTotal,
      quality:     q,
    }, ...h].slice(0, 30));

    // Emoji burst for top 95%
    if (q?.epic) {
      const particles = Array.from({ length: 22 }, (_, idx) => ({
        id:    idx,
        emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
        x:     `${Math.random() * 100}vw`,
        r:     `${Math.random() * 360}deg`,
        delay: `${(Math.random() * 0.5).toFixed(2)}s`,
      }));
      setBurst(particles);
      setTimeout(() => setBurst([]), 3200);
    }

    if (playersRef.current.length > 1) {
      setCurrentTurn((t) => (t + 1) % playersRef.current.length);
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setRolling(false);
      canRollRef.current = true;
    }, 800);
  }, [counts, dieOrder.length, trayH]);

  // Sync die list when counts change — keep values at 1 (not yet rolled).
  useEffect(() => {
    const flat = flattenCounts(counts);
    setDieOrder(flat);
    setValues(flat.map(() => 1));
    setPositions(flat.map((_, i) => randomTrayPos(i, flat.length, TRAY_W, trayH)));
    setHasRolled(false);
    canRollRef.current = true;
  }, [counts]); // trayH intentionally omitted — only reposition on count change

  // Cleanup.
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Mouse shake — desktop only. Never attached on touch devices so it can't
  // collide with the motion sensor.
  useEffect(() => {
    if (isTouch) return;
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
  }, [roll, isTouch]);

  // Device-motion shake — only after motion access is granted/auto-enabled.
  useEffect(() => {
    if (!motionEnabled) return;
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
  }, [roll, motionEnabled]);

  const adjustCount = (type: DieType, delta: number) => {
    setCounts((prev) => {
      const next     = { ...prev, [type]: Math.max(0, prev[type] + delta) };
      const newTotal = DICE_TYPES.reduce((s, t) => s + next[t], 0);
      return newTotal > TOTAL_DICE_CAP ? prev : next;
    });
  };

  const total = values.reduce((s, v) => s + v, 0);

  const EMOJIS = ["🧑","👩","🧔","👧","🧒","👴","👵","🧑‍🦱"];
  const COLORS  = [
    { bg: "bg-hot",    text: "text-white",  hex: "#FF5C8A" },
    { bg: "bg-sky",    text: "text-ink",    hex: "#8AD7FF" },
    { bg: "bg-mint",   text: "text-ink",    hex: "#5BE0B0" },
    { bg: "bg-butter", text: "text-ink",    hex: "#FFE45C" },
    { bg: "bg-lilac",  text: "text-ink",    hex: "#C9B6FF" },
    { bg: "bg-hot",    text: "text-white",  hex: "#FF5C8A" },
    { bg: "bg-sky",    text: "text-ink",    hex: "#8AD7FF" },
    { bg: "bg-mint",   text: "text-ink",    hex: "#5BE0B0" },
  ] as const;

  return (
    <>
    {/* ── Emoji burst overlay ── */}
    {burst.length > 0 && (
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {burst.map((p) => (
          <span
            key={p.id}
            className="absolute bottom-0 text-[40px]"
            style={{
              animation: `emoji-burst 2.6s cubic-bezier(.22,1,.36,1) forwards`,
              animationDelay: p.delay,
              "--ex": p.x,
              "--er": p.r,
            } as React.CSSProperties}
          >
            {p.emoji}
          </span>
        ))}
      </div>
    )}
    <div className="flex flex-col gap-8">

      {/* ── Players ── */}
      <div className="space-y-4">
        {/* Header + add/remove */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-bold uppercase tracking-[.06em] text-ink/60">Players</span>
          <div className="flex items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-4 py-2 shadow-brut-sm">
            <button
              onClick={() => setPlayers((p) => p.length > 1 ? p.slice(0, -1) : p)}
              disabled={players.length <= 1}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper font-bold shadow-brut-sm disabled:opacity-30 hover:bg-hot/10 transition-colors"
            >−</button>
            <span className="w-5 text-center font-display text-[20px] font-extrabold">{players.length}</span>
            <button
              onClick={() => setPlayers((p) => p.length < MAX_PLAYERS ? [...p, { name: `Player ${p.length + 1}`, avatar: null }] : p)}
              disabled={players.length >= MAX_PLAYERS}
              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper font-bold shadow-brut-sm disabled:opacity-30 hover:bg-hot/10 transition-colors"
            >+</button>
          </div>
        </div>

        {/* Player cards — horizontal rectangles matching scorekeeper */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {players.map((p, i) => {
            const color    = COLORS[i % COLORS.length];
            const isActive = i === currentTurn;
            return (
              <div
                key={i}
                onClick={() => setCurrentTurn(i)}
                className={`relative cursor-pointer rounded-[14px] border-[3px] border-ink shadow-brut-lg transition-all select-none
                  ${color.bg} ${isActive ? "shadow-brut-xl -translate-y-0.5" : "opacity-60 hover:opacity-85"}`}
              >
                {/* "rolling" badge */}
                {isActive && (
                  <div className="absolute top-2 right-2 rounded-full border-2 border-ink bg-white/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[.08em]">
                    rolling
                  </div>
                )}

                {/* Horizontal layout: avatar left, name right */}
                <div className="flex items-center gap-3 px-3 py-3">
                  {/* Avatar + camera badge */}
                  <div className="relative shrink-0">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="h-[70px] w-[70px] rounded-full border-[3px] border-ink object-cover shadow-brut" />
                    ) : (
                      <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-ink bg-white/40 shadow-brut">
                        <span className="text-[30px]">{EMOJIS[i % EMOJIS.length]}</span>
                      </div>
                    )}
                    {!p.avatar && (
                      <button
                        onClick={(e) => { e.stopPropagation(); avatarRefs.current[i]?.click(); }}
                        className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-ink bg-white text-[13px] shadow-brut-sm hover:bg-butter transition-colors"
                      >📷</button>
                    )}
                    {p.avatar && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPlayers((prev) => prev.map((pl, idx) => idx === i ? { ...pl, avatar: null } : pl)); }}
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white text-[10px] font-bold shadow-brut-sm hover:bg-hot/20"
                      >✕</button>
                    )}
                    <input
                      ref={(el) => { avatarRefs.current[i] = el; }}
                      type="file" accept="image/*" capture="user" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => setPlayers((prev) => prev.map((pl, idx) => idx === i ? { ...pl, avatar: ev.target?.result as string } : pl));
                        reader.readAsDataURL(file);
                      }}
                    />
                  </div>

                  {/* Name */}
                  <div className="min-w-0 flex-1">
                    <p className={`mb-0.5 text-[9px] font-bold uppercase tracking-[.1em] opacity-50 ${color.text}`}>✏︎ name</p>
                    <input
                      value={p.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setPlayers((prev) => prev.map((pl, idx) => idx === i ? { ...pl, name: e.target.value } : pl))}
                      className={`w-full rounded-lg border-[2px] border-ink/20 bg-white/30 px-2 py-1 font-display text-[20px] font-extrabold -tracking-[.02em] focus:border-ink focus:bg-white/80 focus:outline-none transition-colors ${color.text}`}
                      maxLength={16}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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

      {/* ── Dice tray ── */}
      {totalDice > 0 && (
        <div
          className="relative w-full rounded-[20px] border-[3px] border-ink bg-cream shadow-brut-xl overflow-hidden"
          style={{ height: trayH }}
        >
          <p className="pointer-events-none absolute bottom-3 right-4 font-mono text-[11px] font-bold uppercase tracking-[.1em] text-ink/20 select-none">
            Roll tray
          </p>
          {dieOrder.map((type, i) => {
            const pos = positions[i] ?? randomTrayPos(i, totalDice, TRAY_W, trayH);
            return (
              <div
                key={`${type}-${i}-${rollSeed}`}
                className="absolute"
                style={{
                  left: pos.x,
                  top:  pos.y,
                  width: DIE_SIZE,
                  height: DIE_SIZE,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <DieFace
                  type={type}
                  value={values[i] ?? 1}
                  rolling={rolling}
                  rotation={pos.rotation}
                  dx={pos.dx}
                  dy={pos.dy}
                  spinStart={pos.spinStart}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Roll + total + quality ── */}
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

        {hasRolled && quality && (
          <div className={`rounded-xl border-[3px] border-ink px-5 py-3 font-display text-[20px] font-extrabold shadow-brut-lg ${quality.color}`}>
            {quality.label}
          </div>
        )}
      </div>

      {needsMotionPermission && (
        <button
          onClick={enableShake}
          className="self-start rounded-xl border-[3px] border-ink bg-mint px-5 py-2.5 font-display text-[15px] font-extrabold shadow-brut transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          📱 Enable shake-to-roll
        </button>
      )}

      <p className="text-[13px] font-semibold text-ink/35">
        {isTouch
          ? motionDenied
            ? "📱 Shake is blocked — turn on Motion access in your browser settings"
            : "📱 Shake your phone to roll"
          : "🖱 Shake your mouse to roll"}
      </p>

      {/* ── Roll history ── */}
      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-[17px] font-extrabold -tracking-[.02em]">Roll History</h2>
            <div className="flex gap-2">
              {history.length > 10 && (
                <button
                  onClick={() => setHistExpanded((v) => !v)}
                  className="rounded-lg border-2 border-ink/30 px-3 py-1 text-[11px] font-bold text-ink/50 hover:border-ink hover:text-ink transition-colors"
                >
                  {histExpanded ? "Show less" : `Show all ${history.length}`}
                </button>
              )}
              <button
                onClick={() => { setHistory([]); setHistExpanded(false); }}
                className="rounded-lg border-2 border-ink/30 px-3 py-1 text-[11px] font-bold text-ink/40 hover:border-ink hover:text-ink transition-colors"
              >Clear</button>
            </div>
          </div>
          <div className="overflow-hidden rounded-[12px] border-[3px] border-ink shadow-brut-sm">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="border-b-2 border-ink bg-cream">
                  <th className="px-3 py-1.5 text-left font-bold text-ink/40 w-6">#</th>
                  <th className="px-3 py-1.5 text-left font-bold text-ink/40">Player</th>
                  <th className="px-3 py-1.5 text-left font-bold text-ink/40 hidden sm:table-cell">Dice</th>
                  <th className="px-3 py-1.5 text-right font-bold text-ink/40">Total</th>
                  <th className="px-3 py-1.5 text-left font-bold text-ink/40 hidden md:table-cell">Result</th>
                </tr>
              </thead>
              <tbody>
                {(histExpanded ? history : history.slice(0, 10)).map((h, idx) => (
                  <tr key={h.id} className="border-b border-ink/10 even:bg-cream/40">
                    <td className="px-3 py-1.5 font-mono text-[11px] text-ink/30">{idx + 1}</td>
                    <td className="px-3 py-1.5">
                      <span className={`rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold ${h.playerColor} ${h.playerColor.includes("hot") ? "text-white" : "text-ink"}`}>
                        {h.playerName}
                      </span>
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[11px] text-ink/40 hidden sm:table-cell">
                      {h.dice.map((d) => `d${d}`).join("+")}
                    </td>
                    <td className="px-3 py-1.5 text-right font-display text-[18px] font-extrabold">{h.total}</td>
                    <td className="px-3 py-1.5 hidden md:table-cell">
                      {h.quality && (
                        <span className={`rounded-md border border-ink px-1.5 py-0.5 text-[11px] font-bold ${h.quality.color}`}>
                          {h.quality.label}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
