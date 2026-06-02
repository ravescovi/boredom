"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  THEMES,
  getCardsForTheme,
  shuffleCards,
  type ConvoCard,
  type Theme,
} from "../lib/convoCards";
import { HAPTIC, vibrate } from "../lib/haptics";

// ── Star ratings (localStorage) ────────────────────────────────────────────

const RATINGS_KEY = "bordom-card-ratings";

type RatingStore = Record<string, { rating: number; text: string; themeId: string; ratedAt: string }>;

function loadRatings(): RatingStore {
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY) ?? "{}"); } catch { return {}; }
}

function saveRating(card: ConvoCard, themeId: string, rating: number) {
  const store = loadRatings();
  if (rating === 0) {
    delete store[card.id];
  } else {
    store[card.id] = { rating, text: card.text, themeId, ratedAt: new Date().toISOString() };
  }
  localStorage.setItem(RATINGS_KEY, JSON.stringify(store));
}

function StarRating({
  cardId,
  rating,
  onRate,
  textColor,
}: {
  cardId: string;
  rating: number;
  onRate: (r: number) => void;
  textColor: string;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || rating;
  return (
    <div className="flex items-center justify-center gap-1" aria-label="Rate this card">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onClick={(e) => { e.stopPropagation(); onRate(rating === s ? 0 : s); }}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${s} star`}
          className="text-[26px] leading-none transition-transform hover:scale-125 active:scale-110"
          style={{
            opacity:  s <= active ? 1 : 0.25,
            filter:   s <= active ? "none" : "grayscale(1)",
            color:    textColor,
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Type badge metadata ─────────────────────────────────────────────────────

const TYPE_META: Record<ConvoCard["type"], { label: string; icon: string }> = {
  "question":         { label: "Question",         icon: "💬" },
  "task":             { label: "Challenge",         icon: "🎯" },
  "would-you-rather": { label: "Would You Rather",  icon: "🤔" },
  "scenario":         { label: "Scenario",          icon: "💭" },
};

// ── Theme decoration icons ──────────────────────────────────────────────────
// Four emoji ornaments scattered in the header band, keyed by theme id.

const THEME_DECO: Record<string, readonly string[]> = {
  couples:    ["💕", "💍", "🌹", "✨"],
  friends:    ["⭐", "🤝", "🎉", "💫"],
  deep:       ["🌊", "💫", "🔮", "🌀"],
  laughs:     ["😂", "🎉", "😜", "🤣"],
  dreams:     ["🌙", "⭐", "🌟", "🚀"],
  nostalgia:  ["📼", "🎵", "📷", "⏰"],
  wyr:        ["🎲", "⚡", "🤔", "🎯"],
  challenges: ["🏆", "🔥", "💪", "⚡"],
};

// ── Theme selector ─────────────────────────────────────────────────────────

function ThemeGrid({ onSelect }: { onSelect: (theme: Theme) => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[15px] leading-[1.55] text-ink/65 max-w-[520px]">
          Pick a theme to start. Read each card aloud and take turns answering — no rules, just conversation.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme)}
            className="group flex flex-col items-start gap-2 rounded-[16px] border-[3px] border-ink p-4 text-left shadow-brut transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#1A1A1A] active:translate-x-0 active:translate-y-0 active:shadow-brut"
            style={{ backgroundColor: theme.bg }}
          >
            <span className="text-[32px] leading-none">{theme.emoji}</span>
            <div>
              <div
                className="font-display text-[16px] font-extrabold -tracking-[.02em] leading-tight"
                style={{ color: theme.textColor }}
              >
                {theme.label}
              </div>
              <div
                className="mt-0.5 text-[12px] font-semibold leading-tight"
                style={{ color: theme.textColor, opacity: 0.65 }}
              >
                {theme.tagline}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Card display ───────────────────────────────────────────────────────────

function ConvoCardDisplay({
  card,
  theme,
  index,
  total,
  visible,
  rating,
  onRate,
}: {
  card: ConvoCard;
  theme: Theme;
  index: number;
  total: number;
  visible: boolean;
  rating: number;
  onRate: (r: number) => void;
}) {
  const meta  = TYPE_META[card.type];
  const decos = THEME_DECO[theme.id] ?? ["✨", "⭐", "💫", "🎊"];

  // Derive contrast helpers based on whether the theme uses a dark background
  const isDark       = theme.textColor === "#FFFCF0";
  const headerBg     = isDark ? "rgba(255,255,255,0.11)" : "rgba(26,26,26,0.09)";
  const dividerColor = isDark ? "rgba(255,255,255,0.14)" : "rgba(26,26,26,0.10)";
  const badgeBorder  = isDark ? "rgba(255,255,255,0.28)" : "rgba(26,26,26,0.22)";
  const badgeBg      = isDark ? "rgba(255,255,255,0.10)" : "rgba(26,26,26,0.07)";
  const barTrack     = isDark ? "rgba(255,255,255,0.14)" : "rgba(26,26,26,0.10)";

  return (
    <div
      className="flex flex-col rounded-[24px] border-[3px] border-ink shadow-[6px_6px_0_#1A1A1A] w-full transition-all duration-200"
      style={{
        backgroundColor: theme.bg,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1) translateY(0)" : "scale(0.97) translateY(8px)",
        minHeight: 420,
        maxWidth: 540,
      }}
    >
      {/* ── Thematic header band ── */}
      <div className="relative overflow-hidden rounded-t-[21px] px-6 py-5">
        {/* Subtle contrast overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: headerBg }} />

        {/* Scattered decorative ornaments */}
        <span
          className="absolute top-2.5 left-4 text-[18px] select-none pointer-events-none"
          style={{ opacity: 0.38 }}
          aria-hidden="true"
        >{decos[0]}</span>
        <span
          className="absolute top-2.5 right-4 text-[18px] select-none pointer-events-none"
          style={{ opacity: 0.38 }}
          aria-hidden="true"
        >{decos[1]}</span>
        <span
          className="absolute bottom-2.5 left-12 text-[13px] select-none pointer-events-none"
          style={{ opacity: 0.22 }}
          aria-hidden="true"
        >{decos[2]}</span>
        <span
          className="absolute bottom-2.5 right-12 text-[13px] select-none pointer-events-none"
          style={{ opacity: 0.22 }}
          aria-hidden="true"
        >{decos[3]}</span>

        {/* Centered theme identity */}
        <div className="relative z-10 flex flex-col items-center gap-1 text-center">
          <span className="text-[38px] leading-none">{theme.emoji}</span>
          <span
            className="font-display text-[12px] font-extrabold uppercase tracking-[.1em] mt-0.5"
            style={{ color: theme.textColor }}
          >
            {theme.label}
          </span>
          <span
            className="text-[11px] font-semibold leading-tight"
            style={{ color: theme.textColor, opacity: 0.62 }}
          >
            {theme.tagline}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6" style={{ height: 2, backgroundColor: dividerColor }} />

      {/* ── Card body — question text ── */}
      <div className="flex flex-1 items-center justify-center px-8 py-8">
        <p
          className="text-center font-display font-extrabold leading-[1.2] -tracking-[.02em]"
          style={{
            color: theme.textColor,
            fontSize: "clamp(20px, 3.5vw, 30px)",
          }}
        >
          {card.text}
        </p>
      </div>

      {/* ── Star rating ── */}
      <div className="px-5 pb-3">
        <div className="flex flex-col items-center gap-1">
          <StarRating cardId={card.id} rating={rating} onRate={onRate} textColor={theme.textColor} />
          <span className="text-[10px] font-bold uppercase tracking-[.08em]" style={{ color: theme.textColor, opacity: 0.4 }}>
            {rating > 0 ? ["","★ Meh","★★ OK","★★★ Good","★★★★ Great","★★★★★ Love it"][rating] : "Rate this card"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-1" style={{ height: 1, backgroundColor: dividerColor }} />

      {/* ── Footer — prominent type badge + progress ── */}
      <div className="px-5 pb-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          {/* Type badge */}
          <div
            className="flex items-center gap-2 rounded-full border-[2px] px-4 py-1.5 text-[12px] font-bold uppercase tracking-[.06em]"
            style={{
              borderColor: badgeBorder,
              backgroundColor: badgeBg,
              color: theme.textColor,
            }}
          >
            <span className="text-[16px]">{meta.icon}</span>
            <span>{meta.label}</span>
          </div>

          {/* Progress counter */}
          <span
            className="font-mono text-[12px] font-bold"
            style={{ color: theme.textColor, opacity: 0.42 }}
          >
            {index + 1} / {total}
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="h-[5px] w-full overflow-hidden rounded-full"
          style={{ backgroundColor: barTrack }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${((index + 1) / total) * 100}%`,
              backgroundColor: theme.textColor,
              opacity: 0.45,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Next card ghost (stack depth illusion) ─────────────────────────────────

function CardGhost({ theme }: { theme: Theme }) {
  return (
    <div
      className="absolute inset-0 rounded-[24px] border-[3px] border-ink"
      style={{
        backgroundColor: theme.bg,
        filter: "brightness(0.88)",
        transform: "translateY(10px) scale(0.97)",
        zIndex: -1,
      }}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────────

export function ConvoCards() {
  const [activeTheme, setActiveTheme] = useState<Theme | null>(null);
  const [cards, setCards]             = useState<ConvoCard[]>([]);
  const [index, setIndex]             = useState(0);
  const [visible, setVisible]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [genError, setGenError]       = useState<string | null>(null);
  const [ratings, setRatings]         = useState<RatingStore>({});

  // Load ratings from localStorage once on mount
  useEffect(() => { setRatings(loadRatings()); }, []);

  const handleRate = useCallback((card: ConvoCard, themeId: string, rating: number) => {
    saveRating(card, themeId, rating);
    setRatings(loadRatings());
  }, []);

  // Touch / pointer swipe state
  const pointerStartX = useRef<number | null>(null);

  const transition = useCallback((fn: () => void) => {
    setVisible(false);
    setTimeout(() => {
      fn();
      setVisible(true);
    }, 180);
  }, []);

  const goNext = useCallback(() => {
    if (!cards.length) return;
    vibrate(HAPTIC.tick);
    transition(() => setIndex((i) => Math.min(i + 1, cards.length - 1)));
  }, [cards.length, transition]);

  const goPrev = useCallback(() => {
    vibrate(HAPTIC.tick);
    transition(() => setIndex((i) => Math.max(i - 1, 0)));
  }, [transition]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!activeTheme) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft")                    { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeTheme, goNext, goPrev]);

  const selectTheme = (theme: Theme) => {
    setActiveTheme(theme);
    setCards(shuffleCards(getCardsForTheme(theme.id)));
    setIndex(0);
    setVisible(true);
    setGenError(null);
  };

  const handleShuffle = () => {
    transition(() => {
      setCards((c) => shuffleCards(c));
      setIndex(0);
    });
  };

  const handleBack = () => {
    setActiveTheme(null);
    setCards([]);
    setIndex(0);
    setGenError(null);
  };

  const generateMore = async () => {
    if (!activeTheme || generating) return;
    setGenerating(true);
    setGenError(null);
    try {
      const existing = cards.map((c) => c.text);
      const store    = loadRatings();
      const topRated = Object.values(store)
        .filter((r) => r.themeId === activeTheme.id && r.rating >= 4)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)
        .map((r) => r.text);
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeId: activeTheme.id,
          themeName: activeTheme.label,
          count: 10,
          existing,
          topRated,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json() as { cards?: ConvoCard[]; error?: string };
      if (data.error) throw new Error(data.error);
      if (data.cards?.length) {
        setCards((prev) => shuffleCards([...prev, ...data.cards!]));
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  // Pointer / touch swipe handlers
  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const diff = e.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(diff) < 40) return;
    if (diff < 0) goNext();
    else goPrev();
  };

  const currentCard = cards[index];
  const isLast  = index === cards.length - 1;
  const isFirst = index === 0;

  // ── Theme selector ──
  if (!activeTheme) {
    return <ThemeGrid onSelect={selectTheme} />;
  }

  // ── Card viewer ──
  return (
    <div className="flex flex-col gap-5">

      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-paper px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
        >
          ← Themes
        </button>

        {/* Active theme badge */}
        <div
          className="flex items-center gap-1.5 rounded-full border-[2.5px] border-ink px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm"
          style={{ backgroundColor: activeTheme.bg, color: activeTheme.textColor }}
        >
          {activeTheme.emoji} {activeTheme.label}
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Generate more */}
          <button
            onClick={generateMore}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-butter px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {generating ? (
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-ink border-t-transparent" />
                Generating…
              </span>
            ) : (
              "✨ More cards"
            )}
          </button>

          {/* Shuffle */}
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 rounded-full border-[2.5px] border-ink bg-paper px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5"
          >
            🔀 Shuffle
          </button>
        </div>
      </div>

      {genError && (
        <div className="rounded-xl border-[2px] border-hot bg-hot/10 px-4 py-2 text-[13px] font-semibold text-hot">
          {genError} — using existing cards.
        </div>
      )}

      {/* Card stack + nav */}
      <div
        className="flex touch-pan-y flex-col items-center gap-6"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {currentCard && (
          <div className="relative w-full" style={{ maxWidth: 540 }}>
            {/* Ghost card behind */}
            {!isLast && <CardGhost theme={activeTheme} />}

            {/* Current card */}
            <ConvoCardDisplay
              card={currentCard}
              theme={activeTheme}
              index={index}
              total={cards.length}
              visible={visible}
              rating={ratings[currentCard.id]?.rating ?? 0}
              onRate={(r) => handleRate(currentCard, activeTheme.id, r)}
            />
          </div>
        )}

        {/* Nav controls */}
        <div className="flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={isFirst}
            className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink bg-paper font-display text-[20px] shadow-brut-sm hover:-translate-y-0.5 transition-transform active:translate-y-0.5 disabled:opacity-25 disabled:pointer-events-none"
            aria-label="Previous card"
          >
            ←
          </button>

          {/* Dot indicators (max 12 visible) */}
          <div className="flex items-center gap-1.5 overflow-hidden" style={{ maxWidth: 200 }}>
            {cards.slice(0, 12).map((_, i) => (
              <button
                key={i}
                onClick={() => transition(() => setIndex(i))}
                className="rounded-full transition-all duration-200 flex-shrink-0"
                style={{
                  width:  i === index ? 20 : 8,
                  height: 8,
                  backgroundColor: i === index ? activeTheme.bg : "#1A1A1A",
                  opacity: i === index ? 1 : 0.2,
                  border: "1.5px solid #1A1A1A",
                }}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
            {cards.length > 12 && (
              <span className="font-mono text-[10px] text-ink/30 ml-0.5">+{cards.length - 12}</span>
            )}
          </div>

          <button
            onClick={goNext}
            disabled={isLast}
            className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink font-display text-[20px] shadow-brut transition-all hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-25 disabled:pointer-events-none"
            style={{ backgroundColor: isLast ? "#FFFCF0" : activeTheme.bg }}
            aria-label="Next card"
          >
            →
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-[12px] font-semibold text-ink/30 hidden sm:block">
          ← → arrow keys · swipe on mobile
        </p>
      </div>
    </div>
  );
}
