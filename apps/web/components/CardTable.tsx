"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CARD_GAME_CATEGORIES } from "../lib/cardGames";
import type { ClassicGame } from "../lib/classics";

// ── Types ──────────────────────────────────────────────────────────────────

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type Card = { id: string; suit: Suit; rank: Rank };

const SUITS: Suit[] = ["♠", "♥", "♦", "♣"];
const RANKS: Rank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

// Deal counts by game shortId (used for the Deal button)
const DEAL_COUNTS: Record<string, number> = {
  RUMMYG: 7, CANSTG: 11, GOLFCD: 6, PHS10G: 10,
  PRESNT: 7, KARMAG: 3, SPITGM: 5, SPEEDG: 5,
  SPADGM: 13, HARTGM: 13, EUCHRG: 5, PTCHGM: 6,
  BSGAME: 0, // deal whole deck evenly
  CHEATG: 0,
  SPOONS: 4, NN9GRM: 9, KINGSG: 7, KEMPSG: 4,
  ERATSC: 0, SNAPGM: 0, CRZY8S: 7, SKULLG: 4,
};

function buildDeck(): Card[] {
  const cards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      cards.push({ id: `${rank}${suit}`, suit, rank });
    }
  }
  return shuffle(cards);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Card visual ────────────────────────────────────────────────────────────

const CARD_W = 68;
const CARD_H = 98;

function isRed(suit: Suit) {
  return suit === "♥" || suit === "♦";
}

function PlayingCard({
  card,
  onClick,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  isDropTarget,
  draggable: draggableProp,
  title,
  style,
  className = "",
}: {
  card: Card;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
  isDropTarget?: boolean;
  draggable?: boolean;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const color = isRed(card.suit) ? "#FF5C8A" : "#1A1A1A";
  const isFace = card.rank === "J" || card.rank === "Q" || card.rank === "K";
  const faceLabel = card.rank === "J" ? "Jck" : card.rank === "Q" ? "Qn" : "Kg";

  return (
    <div
      draggable={draggableProp ?? !!onDragStart}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onClick={onClick}
      title={title}
      className={`relative select-none rounded-[8px] border-[2.5px] border-ink bg-paper transition-all duration-150
        ${onClick || onDragStart ? "cursor-pointer hover:-translate-y-2 hover:shadow-brut" : ""}
        ${isDragging ? "opacity-30 scale-95" : ""}
        ${isDropTarget ? "ring-2 ring-sky -translate-y-1" : ""}
        shadow-[3px_3px_0_#1A1A1A]
        ${className}`}
      style={{ width: CARD_W, height: CARD_H, flexShrink: 0, ...style }}
    >
      {/* Top-left corner */}
      <div className="absolute top-1 left-1.5 leading-none" style={{ color }}>
        <div className="text-[12px] font-extrabold font-display leading-none">{card.rank}</div>
        <div className="text-[10px] leading-none mt-0.5">{card.suit}</div>
      </div>

      {/* Center */}
      <div
        className="absolute inset-0 flex items-center justify-center font-display font-extrabold"
        style={{ color, fontSize: isFace ? 13 : card.rank === "10" ? 22 : 26 }}
      >
        {isFace ? (
          <div className="flex flex-col items-center gap-0.5">
            <span style={{ fontSize: 22 }}>{card.suit}</span>
            <span style={{ fontSize: 10, letterSpacing: 1 }}>{faceLabel}</span>
          </div>
        ) : (
          card.suit
        )}
      </div>

      {/* Bottom-right corner (mirrored) */}
      <div className="absolute bottom-1 right-1.5 leading-none rotate-180" style={{ color }}>
        <div className="text-[12px] font-extrabold font-display leading-none">{card.rank}</div>
        <div className="text-[10px] leading-none mt-0.5">{card.suit}</div>
      </div>
    </div>
  );
}

function CardBack({ style, className = "" }: { style?: React.CSSProperties; className?: string }) {
  return (
    <div
      className={`relative select-none rounded-[8px] border-[2.5px] border-ink shadow-[3px_3px_0_#1A1A1A] overflow-hidden ${className}`}
      style={{ width: CARD_W, height: CARD_H, backgroundColor: "#C9B6FF", flexShrink: 0, ...style }}
    >
      {/* Inner border */}
      <div className="absolute inset-[5px] rounded-[4px] border-[1.5px] border-ink/25" />
      {/* Dot grid */}
      <div
        className="absolute inset-[9px] rounded-[2px]"
        style={{
          backgroundImage: "radial-gradient(circle, #1A1A1A 1.2px, transparent 1.2px)",
          backgroundSize: "9px 9px",
          opacity: 0.18,
        }}
      />
      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-display text-[11px] font-extrabold text-ink/30 -tracking-[.02em]">b.</span>
      </div>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────────────────────────

function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(text);
    timerRef.current = setTimeout(() => setMsg(null), 2000);
  }, []);

  return { msg, toast };
}

// ── Rules panel ────────────────────────────────────────────────────────────

function RulesPanel({ game, onClose }: { game: ClassicGame; onClose: () => void }) {
  const s = game.spec;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-ink/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md max-h-[85vh] overflow-y-auto rounded-t-[18px] sm:rounded-[18px] border-[3px] border-ink bg-paper shadow-brut-xl"
        style={{ animation: "brut-modal-in 0.22s cubic-bezier(.22,1,.36,1) forwards" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-[3px] border-ink bg-paper px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{game.emoji}</span>
            <span className="font-display text-[18px] font-extrabold -tracking-[.02em]">{s.title}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-ink bg-cream font-display text-[14px] font-extrabold hover:bg-hot hover:text-paper transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-4">
          {/* Summary */}
          <p className="text-[14px] leading-[1.55] text-ink/75">{s.summary}</p>

          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border-2 border-ink bg-mint px-3 py-1 text-[11px] font-bold">
              👥 {s.playerCount.min}–{s.playerCount.max} players
            </span>
            <span className="rounded-full border-2 border-ink bg-butter px-3 py-1 text-[11px] font-bold">
              ⏱ ~{s.durationMinutes} min
            </span>
            <span className="rounded-full border-2 border-ink bg-sky px-3 py-1 text-[11px] font-bold">
              🎂 {s.ageRating}+
            </span>
          </div>

          {/* Setup */}
          <Section title="Setup" items={s.setup} color="bg-mint" />

          {/* Rules */}
          <Section title="Rules" items={s.rules} color="bg-sky" />

          {/* Turn structure */}
          {s.turnStructure?.length > 0 && (
            <Section title="Each Turn" items={s.turnStructure} color="bg-butter" />
          )}

          {/* Win condition */}
          <div>
            <h3 className="mb-1.5 font-display text-[13px] font-extrabold uppercase tracking-[.06em] text-ink/50">
              Win Condition
            </h3>
            <p className="text-[13px] leading-[1.5] text-ink/80">{s.winCondition}</p>
          </div>

          {/* Variants */}
          {s.variants?.length > 0 && (
            <Section title="Variants" items={s.variants} color="bg-lilac" />
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, items, color }: { title: string; items: readonly string[]; color: string }) {
  return (
    <div>
      <h3 className="mb-2 font-display text-[13px] font-extrabold uppercase tracking-[.06em] text-ink/50">
        {title}
      </h3>
      <ol className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-[1.5] text-ink/80">
            <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[2px] border-ink ${color} text-[10px] font-extrabold`}>
              {i + 1}
            </span>
            {item}
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Pile slot (empty placeholder) ─────────────────────────────────────────

function PileSlot({ label, onClick, highlight }: { label: string; onClick?: () => void; highlight?: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-center rounded-[8px] border-[2.5px] border-dashed text-[11px] font-bold transition-colors
        ${onClick ? "cursor-pointer hover:border-ink hover:bg-cream/50" : ""}
        ${highlight ? "border-sky bg-sky/10" : "border-ink/30 text-ink/30"}
      `}
      style={{ width: CARD_W, height: CARD_H, flexShrink: 0 }}
    >
      {label}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

// All card games flattened from categories
const ALL_CARD_GAMES: ClassicGame[] = CARD_GAME_CATEGORIES.flatMap((cat) => cat.games);

export function CardTable() {
  // ── Game selection ──
  const [gameId, setGameId] = useState<string>("RUMMYG");
  const selectedGame = ALL_CARD_GAMES.find((g) => g.shortId === gameId) ?? ALL_CARD_GAMES[0];

  // ── Card state ──
  const [drawPile, setDrawPile]     = useState<Card[]>(() => buildDeck());
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [hand, setHand]             = useState<Card[]>([]);
  const [tableCards, setTableCards] = useState<Card[]>([]); // meld/played area

  // ── Drag state ──
  const [dragSource, setDragSource] = useState<"hand" | "table" | null>(null);
  const [dragIdx, setDragIdx]       = useState<number | null>(null);
  const [dropIdx, setDropIdx]       = useState<number | null>(null);
  const [dropZone, setDropZone]     = useState<"hand" | "discard" | "table" | null>(null);
  const didDragRef                  = useRef(false);

  // ── UI state ──
  const [rulesOpen, setRulesOpen]   = useState(false);
  const [dealCount, setDealCount]   = useState<number>(() => DEAL_COUNTS[gameId] ?? 7);
  const { msg: toast, toast: showToast } = useToast();

  // Update deal count when game changes
  useEffect(() => {
    setDealCount(DEAL_COUNTS[gameId] ?? 7);
  }, [gameId]);

  // ── Actions ────────────────────────────────────────────────────────────

  const resetGame = () => {
    const fresh = buildDeck();
    setDrawPile(fresh);
    setDiscardPile([]);
    setHand([]);
    setTableCards([]);
    showToast("Deck shuffled. Ready to deal!");
  };

  const dealCards = () => {
    const n = dealCount > 0 ? dealCount : Math.floor(52 / Math.max(2, 1));
    if (drawPile.length < n) {
      showToast("Not enough cards in the draw pile.");
      return;
    }
    const drawn = drawPile.slice(-n);
    setDrawPile((p) => p.slice(0, -n));
    setHand((h) => [...h, ...drawn]);
    showToast(`Dealt ${n} cards`);
  };

  const drawFromPile = () => {
    if (!drawPile.length) {
      if (discardPile.length <= 1) { showToast("No cards left!"); return; }
      // Reshuffle discard into draw pile, leave top discard
      const top = discardPile[discardPile.length - 1];
      const reshuffled = shuffle(discardPile.slice(0, -1));
      setDrawPile(reshuffled);
      setDiscardPile([top]);
      showToast("Reshuffled discard pile into draw pile");
      return;
    }
    const [card, ...rest] = [...drawPile].reverse();
    setDrawPile(rest.reverse());
    setHand((h) => [...h, card]);
    showToast(`Drew ${card.rank}${card.suit}`);
  };

  const takeFromDiscard = () => {
    if (!discardPile.length) { showToast("Discard pile is empty."); return; }
    const card = discardPile[discardPile.length - 1];
    setDiscardPile((p) => p.slice(0, -1));
    setHand((h) => [...h, card]);
    showToast(`Took ${card.rank}${card.suit} from discard`);
  };

  const discardFromHand = (idx: number) => {
    const card = hand[idx];
    setHand((h) => h.filter((_, i) => i !== idx));
    setDiscardPile((p) => [...p, card]);
    showToast(`Discarded ${card.rank}${card.suit}`);
  };

  const playToTable = (idx: number) => {
    const card = hand[idx];
    setHand((h) => h.filter((_, i) => i !== idx));
    setTableCards((t) => [...t, card]);
    showToast(`Played ${card.rank}${card.suit} to table`);
  };

  const returnFromTable = (idx: number) => {
    const card = tableCards[idx];
    setTableCards((t) => t.filter((_, i) => i !== idx));
    setHand((h) => [...h, card]);
    showToast(`Returned ${card.rank}${card.suit} to hand`);
  };

  // Reorder hand via drag-and-drop
  const reorderHand = (from: number, to: number) => {
    setHand((h) => {
      const a = [...h];
      const [card] = a.splice(from, 1);
      a.splice(to, 0, card);
      return a;
    });
  };

  // ── Drag handlers ────────────────────────────────────────────────────────

  const onHandDragStart = (i: number) => {
    didDragRef.current = true;
    setDragSource("hand");
    setDragIdx(i);
  };

  const onHandDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    if (dragSource === "hand") setDropIdx(i);
    setDropZone("hand");
  };

  const onHandDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragSource === "hand" && dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      reorderHand(dragIdx, dropIdx);
    }
    setDragIdx(null); setDropIdx(null); setDragSource(null); setDropZone(null);
  };

  const onDiscardDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZone("discard");
  };

  const onDiscardDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragSource === "hand" && dragIdx !== null) discardFromHand(dragIdx);
    setDragIdx(null); setDropIdx(null); setDragSource(null); setDropZone(null);
  };

  const onTableDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZone("table");
  };

  const onTableDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragSource === "hand" && dragIdx !== null) playToTable(dragIdx);
    setDragIdx(null); setDropIdx(null); setDragSource(null); setDropZone(null);
  };

  const onTableCardDragStart = (i: number) => {
    didDragRef.current = true;
    setDragSource("table");
    setDragIdx(i);
  };

  const onHandZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDropZone("hand");
  };

  const onHandZoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragSource === "table" && dragIdx !== null) returnFromTable(dragIdx);
    setDragIdx(null); setDropIdx(null); setDragSource(null); setDropZone(null);
  };

  const onDragEnd = () => {
    setTimeout(() => { didDragRef.current = false; }, 50);
    setDragIdx(null); setDropIdx(null); setDragSource(null); setDropZone(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const topDiscard = discardPile[discardPile.length - 1];
  const secondDiscard = discardPile[discardPile.length - 2];

  return (
    <div className="flex flex-col gap-0">

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-2 rounded-t-[18px] border-[3px] border-ink bg-paper px-4 py-3 shadow-brut-xl">

        {/* Game selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[.06em] text-ink/40">Game</span>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="rounded-lg border-[2.5px] border-ink bg-cream px-2 py-1.5 font-display text-[13px] font-bold shadow-brut-sm outline-none focus:bg-white cursor-pointer"
          >
            {CARD_GAME_CATEGORIES.map((cat) => (
              <optgroup key={cat.id} label={`${cat.emoji} ${cat.name}`}>
                {cat.games.map((g) => (
                  <option key={g.shortId} value={g.shortId}>
                    {g.emoji} {g.spec.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="h-6 w-[2px] rounded-full bg-ink/15" />

        {/* Deal controls */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[.06em] text-ink/40">Deal</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDealCount((n) => Math.max(1, n - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-ink bg-cream font-display text-[14px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
            >−</button>
            <span className="w-5 text-center font-display text-[16px] font-extrabold tabular-nums">{dealCount}</span>
            <button
              onClick={() => setDealCount((n) => Math.min(26, n + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-ink bg-cream font-display text-[14px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
            >+</button>
          </div>
          <button
            onClick={dealCards}
            disabled={drawPile.length === 0}
            className="rounded-lg border-[2.5px] border-ink bg-mint px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            Deal
          </button>
        </div>

        <div className="h-6 w-[2px] rounded-full bg-ink/15" />

        {/* Reset / Shuffle */}
        <button
          onClick={resetGame}
          className="rounded-lg border-[2.5px] border-ink bg-cream px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
        >
          ↺ New game
        </button>

        {/* Rules */}
        <button
          onClick={() => setRulesOpen(true)}
          className="ml-auto rounded-lg border-[2.5px] border-ink bg-butter px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
        >
          📖 Rules
        </button>
      </div>

      {/* ── Table surface ── */}
      <div
        className="relative flex flex-col gap-6 rounded-b-[18px] border-x-[3px] border-b-[3px] border-ink p-5"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, #3d6b4f 0%, #2e5240 60%, #243f33 100%)",
          minHeight: 480,
        }}
      >

        {/* Toast */}
        {toast && (
          <div className="absolute top-3 left-1/2 z-40 -translate-x-1/2 rounded-full border-[2px] border-ink bg-paper px-4 py-1.5 font-display text-[13px] font-bold shadow-brut-sm">
            {toast}
          </div>
        )}

        {/* ── Piles row ── */}
        <div className="flex items-start gap-8 flex-wrap">

          {/* Draw pile */}
          <div className="flex flex-col items-center gap-2">
            <span className="font-display text-[11px] font-bold uppercase tracking-[.08em] text-white/60">
              Draw pile
            </span>
            <div className="relative cursor-pointer" onClick={drawFromPile} title="Click to draw">
              {drawPile.length > 2 && <CardBack style={{ position: "absolute", top: -4, left: 4, opacity: 0.5 }} />}
              {drawPile.length > 0
                ? <CardBack className="hover:-translate-y-1 transition-transform" />
                : <PileSlot label="Empty" onClick={drawFromPile} />
              }
            </div>
            <span className="font-mono text-[11px] text-white/50">
              {drawPile.length} card{drawPile.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Discard pile */}
          <div
            className="flex flex-col items-center gap-2"
            onDragOver={onDiscardDragOver}
            onDrop={onDiscardDrop}
          >
            <span className="font-display text-[11px] font-bold uppercase tracking-[.08em] text-white/60">
              Discard pile
            </span>
            <div
              className={`relative transition-all ${dropZone === "discard" ? "scale-105" : ""}`}
              style={{ width: CARD_W, height: CARD_H }}
            >
              {secondDiscard && (
                <PlayingCard
                  card={secondDiscard}
                  style={{ position: "absolute", top: -3, left: 3, opacity: 0.45, pointerEvents: "none" }}
                />
              )}
              {topDiscard
                ? <PlayingCard card={topDiscard} onClick={takeFromDiscard} title="Click to take" className={dropZone === "discard" ? "ring-2 ring-sky" : ""} />
                : <PileSlot label="Discard" highlight={dropZone === "discard"} />
              }
            </div>
            <span className="font-mono text-[11px] text-white/50">
              {discardPile.length} card{discardPile.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Help hint */}
          <div className="ml-auto hidden sm:flex flex-col gap-1.5 text-white/35 text-[11px] font-mono self-end pb-1">
            <span>↓ click draw pile to draw</span>
            <span>↑ click discard pile to take</span>
            <span>↔ drag hand cards to reorder</span>
            <span>→ drag to discard or table</span>
          </div>
        </div>

        {/* ── Table / meld zone ── */}
        <div
          onDragOver={onTableDragOver}
          onDrop={onTableDrop}
          className={`min-h-[80px] rounded-[12px] border-[2px] border-dashed transition-all p-3
            ${dropZone === "table"
              ? "border-sky/80 bg-sky/10"
              : "border-white/15 bg-white/5"
            }`}
        >
          <div className="flex items-center gap-1 mb-2">
            <span className="font-display text-[11px] font-bold uppercase tracking-[.08em] text-white/40">
              Table {tableCards.length > 0 ? `· ${tableCards.length} card${tableCards.length !== 1 ? "s" : ""}` : "· drag cards here to play / lay down melds"}
            </span>
          </div>
          {tableCards.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tableCards.map((card, i) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  draggable
                  onDragStart={() => onTableCardDragStart(i)}
                  onDragEnd={onDragEnd}
                  onClick={() => { if (!didDragRef.current) returnFromTable(i); }}
                  isDragging={dragSource === "table" && dragIdx === i}
                  title="Click to return to hand"
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[52px]">
              <span className="text-white/20 text-[12px] font-mono">empty</span>
            </div>
          )}
        </div>

        {/* ── Hand ── */}
        <div
          onDragOver={dragSource === "table" ? onHandZoneDragOver : undefined}
          onDrop={dragSource === "table" ? onHandZoneDrop : undefined}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-[11px] font-bold uppercase tracking-[.08em] text-white/60">
              Your hand · {hand.length} card{hand.length !== 1 ? "s" : ""}
            </span>
            {hand.length > 0 && (
              <span className="text-white/30 text-[10px] font-mono hidden sm:inline">
                click to discard · drag to reorder
              </span>
            )}
          </div>

          {hand.length === 0 ? (
            <div
              className={`flex items-center justify-center rounded-[10px] border-[2px] border-dashed h-[116px] transition-colors
                ${dragSource === "table" && dropZone === "hand" ? "border-sky/70 bg-sky/10" : "border-white/15"}`}
            >
              <span className="text-white/25 text-[12px] font-mono">
                {drawPile.length > 0 ? "Click draw pile or hit Deal ↑" : "No cards"}
              </span>
            </div>
          ) : (
            <div
              className="flex gap-0 flex-wrap"
              onDrop={onHandDrop}
              style={{ gap: 6 }}
            >
              {hand.map((card, i) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  onDragStart={() => onHandDragStart(i)}
                  onDragOver={(e) => onHandDragOver(e, i)}
                  onDragEnd={onDragEnd}
                  onClick={() => { if (!didDragRef.current) discardFromHand(i); }}
                  isDragging={dragSource === "hand" && dragIdx === i}
                  isDropTarget={dragSource === "hand" && dropIdx === i && dragIdx !== i}
                  title={`Click to discard · drag to reorder`}
                />
              ))}

              {/* Drop ghost at end of hand */}
              {dragSource === "hand" && dropIdx === hand.length && (
                <div
                  className="rounded-[8px] border-[2px] border-dashed border-sky/60 bg-sky/10"
                  style={{ width: CARD_W, height: CARD_H, flexShrink: 0 }}
                />
              )}
            </div>
          )}
        </div>

      </div>

      {/* ── Rules modal ── */}
      {rulesOpen && selectedGame && (
        <RulesPanel game={selectedGame} onClose={() => setRulesOpen(false)} />
      )}
    </div>
  );
}
