"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────────────

const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;
const SPACE_COUNT = 36; // total spaces including START and FINISH

type LayoutStyle = "curvy" | "angular";

// Brand palette
const PLAYER_COLORS = [
  { name: "Hot",    fill: "#FF5C8A", text: "#FFFCF0" },
  { name: "Mint",   fill: "#5BE0B0", text: "#1A1A1A" },
  { name: "Sky",    fill: "#8AD7FF", text: "#1A1A1A" },
  { name: "Butter", fill: "#FFE45C", text: "#1A1A1A" },
  { name: "Lilac",  fill: "#C9B6FF", text: "#1A1A1A" },
  { name: "Paper",  fill: "#FFFCF0", text: "#1A1A1A" },
];

// ── SVG piece shape renderers ──────────────────────────────────────────────
// Each function renders a piece with "feet" at (cx, cy), ~18-22 px tall.
// fill = player color, stroke is always #1A1A1A.

const PIECE_RENDERERS = [
  // 0 — Chess pawn
  (cx: number, cy: number, fill: string) => (
    <g>
      {/* Ball */}
      <circle cx={cx} cy={cy - 17} r={5.5} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
      {/* Neck */}
      <rect x={cx - 2.5} y={cy - 12} width={5} height={4.5} fill={fill} stroke="#1A1A1A" strokeWidth="1.5" />
      {/* Base trapezoid */}
      <polygon
        points={`${cx - 7},${cy} ${cx + 7},${cy} ${cx + 4.5},${cy - 8} ${cx - 4.5},${cy - 8}`}
        fill={fill} stroke="#1A1A1A" strokeWidth="2"
      />
    </g>
  ),

  // 1 — Car (side view)
  (cx: number, cy: number, fill: string) => (
    <g>
      {/* Cabin */}
      <polygon
        points={`${cx - 6},${cy - 9} ${cx + 6},${cy - 9} ${cx + 4.5},${cy - 15} ${cx - 4.5},${cy - 15}`}
        fill={fill} stroke="#1A1A1A" strokeWidth="1.5"
      />
      {/* Body */}
      <rect x={cx - 10} y={cy - 9} width={20} height={7} rx={2} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
      {/* Wheels outer */}
      <circle cx={cx - 5} cy={cy} r={3.5} fill="#1A1A1A" />
      <circle cx={cx + 5} cy={cy} r={3.5} fill="#1A1A1A" />
      {/* Wheels inner hubcap */}
      <circle cx={cx - 5} cy={cy} r={1.8} fill={fill} />
      <circle cx={cx + 5} cy={cy} r={1.8} fill={fill} />
    </g>
  ),

  // 2 — Top hat
  (cx: number, cy: number, fill: string) => (
    <g>
      {/* Crown */}
      <rect x={cx - 5} y={cy - 18} width={10} height={14} rx={1} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
      {/* Hat band (decorative stripe) */}
      <rect x={cx - 5} y={cy - 9} width={10} height={2.5} fill="#1A1A1A" opacity={0.4} rx={0.5} />
      {/* Brim */}
      <rect x={cx - 9} y={cy - 4} width={18} height={4} rx={2} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
    </g>
  ),

  // 3 — Boot
  (cx: number, cy: number, fill: string) => (
    <g>
      {/* Leg shaft */}
      <rect x={cx - 3.5} y={cy - 19} width={7} height={13} rx={2} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
      {/* Foot / toe box */}
      <rect x={cx - 3.5} y={cy - 8} width={12} height={7} rx={3.5} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
    </g>
  ),

  // 4 — Sailboat
  (cx: number, cy: number, fill: string) => (
    <g>
      {/* Hull */}
      <path
        d={`M ${cx - 11} ${cy - 4} L ${cx + 11} ${cy - 4} Q ${cx + 9} ${cy + 1} ${cx} ${cy + 1} Q ${cx - 9} ${cy + 1} ${cx - 11} ${cy - 4} Z`}
        fill={fill} stroke="#1A1A1A" strokeWidth="2"
      />
      {/* Mast */}
      <line x1={cx} y1={cy - 4} x2={cx} y2={cy - 19} stroke="#1A1A1A" strokeWidth="1.5" />
      {/* Sail */}
      <polygon
        points={`${cx + 1},${cy - 18} ${cx + 1},${cy - 5} ${cx + 11},${cy - 8}`}
        fill={fill} stroke="#1A1A1A" strokeWidth="1.5" opacity={0.9}
      />
    </g>
  ),

  // 5 — Rocket
  (cx: number, cy: number, fill: string) => (
    <g>
      {/* Nose cone */}
      <polygon
        points={`${cx - 4},${cy - 14} ${cx + 4},${cy - 14} ${cx},${cy - 21}`}
        fill={fill} stroke="#1A1A1A" strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Body */}
      <rect x={cx - 4} y={cy - 14} width={8} height={12} rx={1.5} fill={fill} stroke="#1A1A1A" strokeWidth="2" />
      {/* Left fin */}
      <polygon
        points={`${cx - 4},${cy - 6} ${cx - 4},${cy - 2} ${cx - 8},${cy - 1}`}
        fill={fill} stroke="#1A1A1A" strokeWidth="1.5"
      />
      {/* Right fin */}
      <polygon
        points={`${cx + 4},${cy - 6} ${cx + 4},${cy - 2} ${cx + 8},${cy - 1}`}
        fill={fill} stroke="#1A1A1A" strokeWidth="1.5"
      />
      {/* Flame */}
      <polygon
        points={`${cx - 2.5},${cy - 2} ${cx + 2.5},${cy - 2} ${cx},${cy + 4}`}
        fill="#FFE45C" stroke="#FF5C8A" strokeWidth="1" opacity={0.9}
      />
    </g>
  ),
];

// Render a player's assigned piece at (cx, cy)
function renderPiece(
  pieceShapes: number[],
  playerId: number,
  cx: number,
  cy: number,
  fill: string,
) {
  const shapeIdx = pieceShapes[(playerId - 1) % pieceShapes.length];
  return PIECE_RENDERERS[shapeIdx](cx, cy, fill);
}

// ── Space label suggestions ────────────────────────────────────────────────

const SPACE_SUGGESTIONS = [
  "Move forward 2",
  "Tell a joke — everyone rates it",
  "Swap places with any player",
  "Skip your next turn",
  "Roll again!",
  "Move back 1",
  "Everyone points at who they think is losing",
  "Give a compliment to the player on your left",
  "Do your best robot impression",
  "Name 3 board games in 5 seconds",
  "The player with the most points draws a card",
  "Advance to the nearest star space",
  "Describe your dream vacation in 10 words",
  "Trivia: name a country starting with 'M'",
  "Freestyle rap for 10 seconds",
  "The group votes — move forward or back?",
  "Trade tokens with the player of your choice",
  "Say the alphabet backwards — you have 15 sec",
  "The quietest player moves forward 3",
  "Do a dramatic reading of the nearest sign",
];

// ── Board path generation ─────────────────────────────────────────────────

// Returns array of {x,y} center points for each space (0=START, last=FINISH)
// SVG canvas: 900 × 560

function generateCurvyPath(count: number): { x: number; y: number }[] {
  // Snake path with rounded lanes: left→right, drop, right→left, drop, repeat
  const cols = 9;
  const rows = Math.ceil(count / cols);
  const marginX = 55;
  const marginY = 62;
  const spacingX = (900 - marginX * 2) / (cols - 1);
  const spacingY = (580 - marginY * 2) / (rows - 1);

  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const x = marginX + (row % 2 === 0 ? col : cols - 1 - col) * spacingX;
    const y = marginY + row * spacingY;
    pts.push({ x, y });
  }
  return pts;
}

function generateAngularPath(count: number): { x: number; y: number }[] {
  // Monopoly-style border track
  const W = 900, H = 580;
  const marginX = 60, marginY = 65;
  const innerW = W - marginX * 2;
  const innerH = H - marginY * 2;

  const sideCount = Math.floor(count / 4);
  const rem = count % 4;
  const sides = [
    sideCount + (rem > 0 ? 1 : 0), // bottom
    sideCount + (rem > 1 ? 1 : 0), // right
    sideCount + (rem > 2 ? 1 : 0), // top
    sideCount,                       // left
  ];

  const pts: { x: number; y: number }[] = [];

  // Bottom: left→right
  for (let i = 0; i < sides[0]; i++) {
    pts.push({ x: marginX + (innerW / (sides[0] - 1 || 1)) * i, y: H - marginY });
  }
  // Right: bottom→top (skip corner already added)
  for (let i = 1; i < sides[1]; i++) {
    pts.push({ x: W - marginX, y: H - marginY - (innerH / (sides[1] - 1 || 1)) * i });
  }
  // Top: right→left (skip corner)
  for (let i = 1; i < sides[2]; i++) {
    pts.push({ x: W - marginX - (innerW / (sides[2] - 1 || 1)) * i, y: marginY });
  }
  // Left: top→bottom (skip corners)
  for (let i = 1; i < sides[3] - 1; i++) {
    pts.push({ x: marginX, y: marginY + (innerH / (sides[3] - 1 || 1)) * i });
  }

  return pts.slice(0, count);
}

// Build SVG path string for a smooth curvy connector between all points
function buildCurvyConnector(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx = (prev.x + curr.x) / 2;
    const cpy = (prev.y + curr.y) / 2;
    d += ` Q ${prev.x} ${prev.y} ${cpx} ${cpy}`;
  }
  const last = pts[pts.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function buildAngularConnector(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}

// ── Types ─────────────────────────────────────────────────────────────────

interface Player {
  id: number;
  name: string;
  avatar: string | null; // data URL
  position: number; // space index
}

interface Space {
  index: number;
  label: string;
  type: "start" | "finish" | "star" | "normal";
}

// ── Sub-components ────────────────────────────────────────────────────────

function AvatarUpload({
  player,
  onAvatar,
}: {
  player: Player;
  onAvatar: (id: number, dataUrl: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const color = PLAYER_COLORS[(player.id - 1) % PLAYER_COLORS.length];

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onAvatar(player.id, reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        onClick={() => inputRef.current?.click()}
        className="relative h-20 w-20 rounded-full border-[3px] border-ink shadow-brut-sm transition-transform hover:-translate-y-0.5"
        style={{ backgroundColor: color.fill }}
        title="Upload avatar or take photo"
      >
        {/* Inner clip keeps avatar image inside the circle */}
        <span className="absolute inset-0 overflow-hidden rounded-full">
          {player.avatar ? (
            <img src={player.avatar} alt={player.name} className="h-full w-full object-cover" />
          ) : (
            <span
              className="flex h-full w-full items-center justify-center font-display text-[28px] font-extrabold select-none"
              style={{ color: color.text }}
            >
              {player.id}
            </span>
          )}
        </span>
        {/* Camera badge sits outside the clip, fully visible */}
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper text-[13px]">
          📷
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// Large distinctive zone for START and FINISH
function SpecialZone({
  space,
  x,
  y,
  players,
  pieceShapes,
}: {
  space: Space;
  x: number;
  y: number;
  players: Player[];
  pieceShapes: number[];
}) {
  const isStart   = space.type === "start";
  const fill      = isStart ? "#5BE0B0" : "#FF5C8A";
  const rimColor  = isStart ? "#3ABEA0" : "#E0306A";
  const textColor = isStart ? "#1A1A1A" : "#FFFCF0";
  const emoji     = isStart ? "🏁" : "🏆";
  const label     = isStart ? "START" : "FINISH";

  // Pill dimensions
  const pw = 82, ph = 48, rx = 24;

  const here = players.filter((p) => p.position === space.index);

  return (
    <g>
      {/* Drop shadow */}
      <rect x={x - pw / 2 + 4} y={y - ph / 2 + 4} width={pw} height={ph} rx={rx} fill="#1A1A1A" opacity="0.85" />
      {/* Outer accent ring — solid, no dashes */}
      <rect
        x={x - pw / 2 - 4} y={y - ph / 2 - 4} width={pw + 8} height={ph + 8} rx={rx + 4}
        fill="none" stroke={rimColor} strokeWidth="3" opacity="0.5"
      />
      {/* Main pill */}
      <rect x={x - pw / 2} y={y - ph / 2} width={pw} height={ph} rx={rx}
        fill={fill} stroke="#1A1A1A" strokeWidth="3" />
      {/* Emoji */}
      <text x={x} y={y - 7} textAnchor="middle" dominantBaseline="middle" fontSize="16">{emoji}</text>
      {/* Label */}
      <text
        x={x} y={y + 11} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="800"
        fontFamily='"Bricolage Grotesque","Arial Black",sans-serif'
        fill={textColor} letterSpacing="1"
      >
        {label}
      </text>

      {/* Player pieces — fanned above the pill */}
      {here.map((p, pi) => {
        const color  = PLAYER_COLORS[(p.id - 1) % PLAYER_COLORS.length];
        const spread = (here.length - 1) * 13;
        const px = x - spread / 2 + pi * 26;
        const pieceCy = y - ph / 2 - 18;
        return (
          <g key={p.id}>
            {renderPiece(pieceShapes, p.id, px, pieceCy, color.fill)}
          </g>
        );
      })}
    </g>
  );
}

function SpaceCircle({
  space,
  x,
  y,
  players,
  pieceShapes,
  onClick,
  style,
}: {
  space: Space;
  x: number;
  y: number;
  players: Player[];
  pieceShapes: number[];
  onClick: () => void;
  style: LayoutStyle;
}) {
  // Delegate START/FINISH to the special zone renderer
  if (space.type === "start" || space.type === "finish") {
    return <SpecialZone space={space} x={x} y={y} players={players} pieceShapes={pieceShapes} />;
  }

  const r  = style === "angular" ? 22 : 20;
  const bg = space.type === "star" ? "#FFE45C" : "#FFFCF0";

  // Pieces on this space
  const here = players.filter((p) => p.position === space.index);

  return (
    <g className="cursor-pointer" onClick={onClick}>
      {/* Shadow */}
      <circle cx={x + 3} cy={y + 3} r={r} fill="#1A1A1A" />
      {/* Main circle */}
      <circle cx={x} cy={y} r={r} fill={bg} stroke="#1A1A1A" strokeWidth="2.5" />

      {space.type === "star" && (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="13">⭐</text>
      )}
      {space.type === "normal" && (
        <text
          x={x} y={y} textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fontWeight="700" fontFamily="ui-monospace,monospace"
          fill="#1A1A1A" opacity="0.45"
        >{space.index}</text>
      )}

      {/* Player pieces */}
      {here.map((p, pi) => {
        const color = PLAYER_COLORS[(p.id - 1) % PLAYER_COLORS.length];
        const angle = (pi / Math.max(here.length, 1)) * Math.PI * 2;
        const pr    = here.length > 1 ? 11 : 0;
        const px    = x + Math.cos(angle) * pr;
        const py    = y + Math.sin(angle) * pr;
        return (
          <g key={p.id}>
            {renderPiece(pieceShapes, p.id, px, py - 18, color.fill)}
          </g>
        );
      })}
    </g>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function BoardGame() {
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>("curvy");
  const [playerCount, setPlayerCount] = useState(2);
  const [players, setPlayers] = useState<Player[]>(() =>
    Array.from({ length: 2 }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
      avatar: null,
      position: 0,
    }))
  );

  // Randomise which SVG piece shape each player gets.
  // Start with identity order (SSR-safe), then shuffle on the client after hydration.
  const [pieceShapes, setPieceShapes] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  useEffect(() => {
    const arr = [0, 1, 2, 3, 4, 5];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setPieceShapes(arr);
  }, []);

  // Spaces
  const [spaces, setSpaces] = useState<Space[]>(() => buildSpaces(SPACE_COUNT));

  // Editing
  const [editingSpace, setEditingSpace] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Dice
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [activePlayer, setActivePlayer] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  function buildSpaces(count: number): Space[] {
    return Array.from({ length: count }, (_, i) => ({
      index: i,
      label: "",
      type: i === 0 ? "start" : i === count - 1 ? "finish" : i % 7 === 0 ? "star" : "normal",
    }));
  }

  // Update player count
  const handlePlayerCount = (n: number) => {
    setPlayerCount(n);
    setPlayers((prev) => {
      if (n > prev.length) {
        return [
          ...prev,
          ...Array.from({ length: n - prev.length }, (_, i) => ({
            id: prev.length + i + 1,
            name: `Player ${prev.length + i + 1}`,
            avatar: null,
            position: 0,
          })),
        ];
      }
      return prev.slice(0, n);
    });
  };

  const handleAvatar = (id: number, dataUrl: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, avatar: dataUrl } : p)));
  };

  const handleNameChange = (id: number, name: string) => {
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  // Space editing
  const openEdit = (idx: number) => {
    if (idx === 0 || idx === SPACE_COUNT - 1) return; // can't edit START/FINISH
    setEditingSpace(idx);
    setEditValue(spaces[idx].label);
  };

  const saveEdit = () => {
    if (editingSpace === null) return;
    setSpaces((prev) =>
      prev.map((s) => (s.index === editingSpace ? { ...s, label: editValue } : s))
    );
    setEditingSpace(null);
  };

  const fillSuggestion = () => {
    const suggestion = SPACE_SUGGESTIONS[Math.floor(Math.random() * SPACE_SUGGESTIONS.length)];
    setEditValue(suggestion);
  };

  const fillAllEmpty = () => {
    setSpaces((prev) =>
      prev.map((s) => {
        if (s.type === "normal" && !s.label) {
          return { ...s, label: SPACE_SUGGESTIONS[Math.floor(Math.random() * SPACE_SUGGESTIONS.length)] };
        }
        return s;
      })
    );
  };

  // Dice roll + move
  const rollAndMove = useCallback(() => {
    if (rolling) return;
    setRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;

    setTimeout(() => {
      setDiceRoll(roll);
      setRolling(false);

      setPlayers((prev) => {
        const updated = prev.map((p, i) => {
          if (i !== activePlayer) return p;
          const newPos = Math.min(p.position + roll, SPACE_COUNT - 1);
          return { ...p, position: newPos };
        });

        const p = updated[activePlayer];
        const space = spaces[p.position];
        const spaceDesc = space.label || (space.type === "star" ? "⭐ Star space!" : `Space ${p.position}`);
        setLog((l) => [`${p.name} rolled ${roll} → ${spaceDesc}`, ...l.slice(0, 9)]);

        return updated;
      });

      setActivePlayer((a) => (a + 1) % playerCount);
    }, 600);
  }, [rolling, activePlayer, playerCount, spaces]);

  const resetGame = () => {
    setPlayers((prev) => prev.map((p) => ({ ...p, position: 0 })));
    setDiceRoll(null);
    setActivePlayer(0);
    setLog([]);
  };

  // Board path
  const pts =
    layoutStyle === "curvy"
      ? generateCurvyPath(SPACE_COUNT)
      : generateAngularPath(SPACE_COUNT);

  const connectorPath =
    layoutStyle === "curvy"
      ? buildCurvyConnector(pts)
      : buildAngularConnector(pts);

  const currentPlayer = players[activePlayer];
  const currentColor  = PLAYER_COLORS[(currentPlayer?.id - 1) % PLAYER_COLORS.length];
  const winner        = players.find((p) => p.position === SPACE_COUNT - 1);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Setup panel ── */}
      <div className="grid grid-cols-1 gap-4 rounded-[18px] border-[3px] border-ink bg-paper p-5 shadow-brut-xl sm:grid-cols-2 lg:grid-cols-3">

        {/* Layout style */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">Layout</span>
          <div className="flex gap-2">
            {(["curvy", "angular"] as LayoutStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setLayoutStyle(s)}
                className={`rounded-lg border-[3px] border-ink px-4 py-2 font-display text-[14px] font-extrabold capitalize shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 ${
                  layoutStyle === s ? "bg-lilac" : "bg-cream"
                }`}
              >
                {s === "curvy" ? "🌀 Curvy" : "📐 Angular"}
              </button>
            ))}
          </div>
        </div>

        {/* Player count */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">Players / Teams</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePlayerCount(Math.max(MIN_PLAYERS, playerCount - 1))}
              disabled={playerCount <= MIN_PLAYERS}
              className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream font-display text-[18px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-30"
            >−</button>
            <span className="w-6 text-center font-display text-[22px] font-extrabold tabular-nums">{playerCount}</span>
            <button
              onClick={() => handlePlayerCount(Math.min(MAX_PLAYERS, playerCount + 1))}
              disabled={playerCount >= MAX_PLAYERS}
              className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink bg-cream font-display text-[18px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-30"
            >+</button>
          </div>
        </div>

        {/* Fill spaces */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">Spaces</span>
          <button
            onClick={fillAllEmpty}
            className="self-start rounded-lg border-[3px] border-ink bg-butter px-4 py-2 font-display text-[14px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          >
            ✨ Fill empty spaces
          </button>
        </div>
      </div>

      {/* ── Player cards ── */}
      <div className="flex flex-wrap gap-3">
        {players.map((p) => {
          const color    = PLAYER_COLORS[(p.id - 1) % PLAYER_COLORS.length];
          const isActive = players[activePlayer]?.id === p.id;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-3 rounded-[14px] border-[3px] border-ink p-3 shadow-brut-sm transition-transform ${
                isActive ? "-translate-y-1 shadow-brut" : ""
              }`}
              style={{ backgroundColor: isActive ? color.fill : "#FFFCF0" }}
            >
              <AvatarUpload player={p} onAvatar={handleAvatar} />
              <div className="flex flex-col gap-1">
                <input
                  value={p.name}
                  onChange={(e) => handleNameChange(p.id, e.target.value)}
                  className="w-28 rounded border-[2px] border-ink bg-transparent font-display text-[14px] font-extrabold outline-none focus:bg-white/50"
                  maxLength={16}
                />
                <span className="font-mono text-[11px] text-ink/50">
                  Space {p.position} / {SPACE_COUNT - 1}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Board SVG ── */}
      <div className="overflow-x-auto rounded-[18px] border-[3px] border-ink bg-cream shadow-brut-xl">
        <svg
          viewBox="0 0 900 580"
          width="100%"
          style={{ minWidth: 560, display: "block" }}
          fontFamily='"Bricolage Grotesque", "Arial Black", sans-serif'
        >
          {/* Background */}
          <rect width="900" height="580" fill="#FFF8E1" rx="14" />

          {/* Decorative dots */}
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 47) % 900}
              cy={(i * 31) % 560}
              r="3"
              fill="#1A1A1A"
              opacity="0.04"
            />
          ))}

          {/* Track connector */}
          <path
            d={connectorPath}
            fill="none"
            stroke="#1A1A1A"
            strokeWidth={layoutStyle === "angular" ? "3" : "2"}
            strokeDasharray={layoutStyle === "angular" ? "0" : "6 4"}
            opacity="0.18"
          />

          {/* Spaces */}
          {spaces.map((space, i) => (
            <SpaceCircle
              key={i}
              space={space}
              x={pts[i]?.x ?? 0}
              y={pts[i]?.y ?? 0}
              players={players}
              pieceShapes={pieceShapes}
              onClick={() => openEdit(i)}
              style={layoutStyle}
            />
          ))}

          {/* Space labels (shown near the circle) */}
          {spaces.map((space, i) => {
            if (!space.label || space.type === "start" || space.type === "finish") return null;
            const x = pts[i]?.x ?? 0;
            const y = pts[i]?.y ?? 0;
            const labelY = y < 280 ? y - 32 : y + 32;
            return (
              <text
                key={`lbl-${i}`}
                x={x}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7.5"
                fontWeight="600"
                fontFamily="ui-monospace, monospace"
                fill="#1A1A1A"
                opacity="0.65"
                style={{ pointerEvents: "none" }}
              >
                {space.label.length > 22 ? space.label.slice(0, 20) + "…" : space.label}
              </text>
            );
          })}
        </svg>
      </div>

      {/* ── Play controls ── */}
      <div className="flex flex-wrap items-start gap-4">

        {/* Roll */}
        <div className="flex flex-col gap-2">
          {winner ? (
            <div className="rounded-xl border-[3px] border-ink bg-hot px-6 py-4 font-display text-[20px] font-extrabold text-paper shadow-brut-lg">
              🏆 {winner.name} wins!
            </div>
          ) : (
            <button
              onClick={rollAndMove}
              disabled={rolling}
              className="rounded-xl border-[3px] border-ink px-8 py-4 font-display text-[20px] font-extrabold shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-brut disabled:pointer-events-none disabled:opacity-50"
              style={{ backgroundColor: currentColor.fill, color: currentColor.text }}
            >
              {rolling ? "Rolling…" : `🎲 ${currentPlayer?.name ?? "?"} rolls`}
            </button>
          )}

          {diceRoll !== null && (
            <div className="flex items-baseline gap-2 rounded-xl border-[3px] border-ink bg-butter px-5 py-3 shadow-brut">
              <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">Rolled</span>
              <span className="font-display text-[36px] font-extrabold tabular-nums -tracking-[.02em]">{diceRoll}</span>
            </div>
          )}
        </div>

        {/* Reset */}
        <button
          onClick={resetGame}
          className="self-start rounded-xl border-[3px] border-ink bg-paper px-5 py-4 font-display text-[14px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          ↺ Reset game
        </button>

        {/* Log */}
        {log.length > 0 && (
          <div className="flex min-w-[220px] flex-col gap-1 rounded-xl border-[3px] border-ink bg-paper px-4 py-3 shadow-brut-sm">
            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">Move log</span>
            {log.slice(0, 5).map((entry, i) => (
              <span key={i} className="font-mono text-[12px] leading-[1.4] text-ink/70">{entry}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Space editor modal ── */}
      {editingSpace !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setEditingSpace(null); }}
        >
          <div
            className="w-full max-w-sm rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl"
            style={{ animation: "brut-modal-in 0.22s cubic-bezier(.22,1,.36,1) forwards" }}
          >
            <h2 className="mb-4 font-display text-[22px] font-extrabold -tracking-[.02em]">
              Space {editingSpace}
            </h2>
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="What happens on this space?"
              rows={3}
              className="mb-3 w-full resize-none rounded-lg border-[3px] border-ink bg-cream p-3 font-sans text-[14px] outline-none focus:bg-white"
              maxLength={80}
            />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={fillSuggestion}
                className="rounded-lg border-[3px] border-ink bg-sky px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5"
              >
                ✨ Suggest
              </button>
              <button
                onClick={saveEdit}
                className="rounded-lg border-[3px] border-ink bg-mint px-4 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5"
              >
                Save
              </button>
              <button
                onClick={() => setEditingSpace(null)}
                className="ml-auto rounded-lg border-[3px] border-ink bg-cream px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
