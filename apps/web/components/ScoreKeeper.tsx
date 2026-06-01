"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_PLAYERS = 8;
const STORAGE_KEY = "bordom-scorekeeper-v2";
const SAVED_GAMES_KEY = "bordom-saved-games";

// One color per player slot — cycles through brand palette
const PLAYER_COLORS = [
  { bg: "bg-hot",    text: "text-white",  border: "border-hot",    hex: "#FF5C8A" },
  { bg: "bg-sky",    text: "text-ink",    border: "border-sky",    hex: "#8AD7FF" },
  { bg: "bg-mint",   text: "text-ink",    border: "border-mint",   hex: "#5BE0B0" },
  { bg: "bg-butter", text: "text-ink",    border: "border-butter", hex: "#FFE45C" },
  { bg: "bg-lilac",  text: "text-ink",    border: "border-lilac",  hex: "#C9B6FF" },
  { bg: "bg-hot",    text: "text-white",  border: "border-hot",    hex: "#FF5C8A" },
  { bg: "bg-sky",    text: "text-ink",    border: "border-sky",    hex: "#8AD7FF" },
  { bg: "bg-mint",   text: "text-ink",    border: "border-mint",   hex: "#5BE0B0" },
] as const;

// Tailwind column bg tints for alternating fill on data rows
const COL_TINTS = [
  "bg-hot/10",
  "bg-sky/20",
  "bg-mint/20",
  "bg-butter/30",
  "bg-lilac/20",
  "bg-hot/10",
  "bg-sky/20",
  "bg-mint/20",
];

type Player = {
  name: string;
  scores: number[];
  avatar: string | null; // base64 data URL
};

type Session = {
  gameTitle: string;
  players: Player[];
  roundInput: string[];
};

type SavedGame = {
  id: string;
  gameTitle: string;
  savedAt: string;
  players: { name: string; total: number; avatar: string | null }[];
};

function blankSession(count: number): Session {
  return {
    gameTitle: "",
    players: Array.from({ length: count }, (_, i) => ({
      name: `Player ${i + 1}`,
      scores: [],
      avatar: null,
    })),
    roundInput: Array(count).fill(""),
  };
}

function totalScore(p: Player) {
  return p.scores.reduce((a, b) => a + b, 0);
}

function loadSavedGames(): SavedGame[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_GAMES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function ScoreKeeper() {
  const [session, setSession] = useState<Session>(() => blankSession(2));
  const [loaded, setLoaded] = useState(false);
  const [savedGames, setSavedGames] = useState<SavedGame[]>([]);
  const [showSaved, setShowSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const avatarRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load persisted session
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Session;
        setSession({ ...parsed, roundInput: Array(parsed.players.length).fill("") });
      }
    } catch {}
    setSavedGames(loadSavedGames());
    setLoaded(true);
  }, []);

  // Auto-save current session
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...session, roundInput: [] }));
  }, [session, loaded]);

  const playerCount = session.players.length;
  const rounds = Math.max(0, ...session.players.map((p) => p.scores.length));

  // ── Player count ──────────────────────────────────────────────────────────
  function setPlayerCount(n: number) {
    setSession((prev) => {
      const next = [...prev.players];
      while (next.length < n)
        next.push({ name: `Player ${next.length + 1}`, scores: [], avatar: null });
      return {
        ...prev,
        players: next.slice(0, n),
        roundInput: Array(n).fill(""),
      };
    });
  }

  // ── Player name ───────────────────────────────────────────────────────────
  function setPlayerName(i: number, name: string) {
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p, idx) => (idx === i ? { ...p, name } : p)),
    }));
  }

  // ── Avatar upload ─────────────────────────────────────────────────────────
  function handleAvatarFile(i: number, file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const avatar = e.target?.result as string;
      setSession((prev) => ({
        ...prev,
        players: prev.players.map((p, idx) => (idx === i ? { ...p, avatar } : p)),
      }));
    };
    reader.readAsDataURL(file);
  }

  function onAvatarChange(i: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleAvatarFile(i, file);
  }

  function clearAvatar(i: number) {
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p, idx) => (idx === i ? { ...p, avatar: null } : p)),
    }));
  }

  // ── Round input ───────────────────────────────────────────────────────────
  function setRoundInput(i: number, val: string) {
    setSession((prev) => {
      const roundInput = [...prev.roundInput];
      roundInput[i] = val;
      return { ...prev, roundInput };
    });
  }

  function submitRound() {
    const scores = session.roundInput.map((v) => {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    });
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => ({ ...p, scores: [...p.scores, scores[i]] })),
      roundInput: Array(prev.players.length).fill(""),
    }));
  }

  function editScore(playerIdx: number, roundIdx: number, val: string) {
    const n = parseFloat(val);
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p, i) => {
        if (i !== playerIdx) return p;
        const scores = [...p.scores];
        scores[roundIdx] = isNaN(n) ? 0 : n;
        return { ...p, scores };
      }),
    }));
  }

  function deleteRound(roundIdx: number) {
    setSession((prev) => ({
      ...prev,
      players: prev.players.map((p) => ({
        ...p,
        scores: p.scores.filter((_, i) => i !== roundIdx),
      })),
    }));
  }

  // ── Game title ────────────────────────────────────────────────────────────
  function setGameTitle(t: string) {
    setSession((prev) => ({ ...prev, gameTitle: t }));
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  function saveGame() {
    if (rounds === 0) { setSaveMsg("Nothing to save yet — add at least one round."); return; }
    const entry: SavedGame = {
      id: Date.now().toString(),
      gameTitle: session.gameTitle || "Untitled Game",
      savedAt: new Date().toLocaleString(),
      players: session.players.map((p) => ({
        name: p.name,
        total: totalScore(p),
        avatar: p.avatar,
      })),
    };
    const updated = [entry, ...loadSavedGames()].slice(0, 50);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updated));
    setSavedGames(updated);
    setSaveMsg(`Saved "${entry.gameTitle}"!`);
    setTimeout(() => setSaveMsg(""), 3000);
  }

  function deleteSavedGame(id: string) {
    const updated = savedGames.filter((g) => g.id !== id);
    localStorage.setItem(SAVED_GAMES_KEY, JSON.stringify(updated));
    setSavedGames(updated);
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  function reset() {
    if (!confirm("Reset scores and start a new game?")) return;
    setSession(blankSession(playerCount));
    localStorage.removeItem(STORAGE_KEY);
  }

  const sorted = [...session.players]
    .map((p, i) => ({ ...p, originalIdx: i, total: totalScore(p) }))
    .sort((a, b) => b.total - a.total);

  const leader = sorted[0]?.total ?? 0;

  if (!loaded) return null;

  return (
    <div className="space-y-8">

      {/* Game title + actions */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[220px]">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[.1em] text-ink/50">
            Game Title
          </label>
          <input
            value={session.gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            placeholder="e.g. Catan, Uno, Yahtzee…"
            className="w-full rounded-[12px] border-[3px] border-ink bg-paper px-4 py-3 font-display text-[20px] font-extrabold -tracking-[.02em] placeholder:text-ink/25 focus:outline-none focus:ring-2 focus:ring-hot shadow-brut-lg"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveGame}
            className="rounded-[12px] border-[3px] border-ink bg-mint px-4 py-3 text-[13px] font-bold shadow-brut-lg hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] transition-all"
          >
            💾 Save
          </button>
          <button
            onClick={() => setShowSaved((v) => !v)}
            className="rounded-[12px] border-[3px] border-ink bg-butter px-4 py-3 text-[13px] font-bold shadow-brut-lg hover:-translate-y-0.5 transition-all"
          >
            📂 History {savedGames.length > 0 && `(${savedGames.length})`}
          </button>
          <button
            onClick={reset}
            className="rounded-[12px] border-[3px] border-ink bg-paper px-4 py-3 text-[13px] font-bold shadow-brut-lg hover:bg-hot/10 transition-colors"
          >
            🗑 Reset
          </button>
        </div>
      </div>

      {saveMsg && (
        <p className="rounded-[10px] border-2 border-ink bg-mint px-4 py-2 text-[14px] font-bold shadow-brut-sm">
          {saveMsg}
        </p>
      )}

      {/* Saved games panel */}
      {showSaved && (
        <div className="rounded-[16px] border-[3px] border-ink bg-cream shadow-brut-lg p-5 space-y-3">
          <h2 className="font-display text-[20px] font-extrabold -tracking-[.02em]">Saved Games</h2>
          {savedGames.length === 0 && (
            <p className="text-[14px] text-ink/50">No saved games yet.</p>
          )}
          {savedGames.map((g) => (
            <div key={g.id} className="flex items-center gap-4 rounded-[12px] border-[3px] border-ink bg-paper px-4 py-3 shadow-brut-sm">
              <div className="flex-1 min-w-0">
                <p className="font-display text-[17px] font-extrabold -tracking-[.02em] truncate">{g.gameTitle}</p>
                <p className="text-[12px] text-ink/50">{g.savedAt}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {g.players.map((p, i) => (
                    <span key={i} className={`flex items-center gap-1.5 rounded-full border-2 border-ink px-2 py-0.5 text-[12px] font-bold shadow-brut-sm ${PLAYER_COLORS[i % PLAYER_COLORS.length].bg} ${PLAYER_COLORS[i % PLAYER_COLORS.length].text}`}>
                      {p.avatar && <img src={p.avatar} alt="" className="h-4 w-4 rounded-full object-cover" />}
                      {p.name}: {p.total}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => deleteSavedGame(g.id)}
                className="shrink-0 rounded-md px-2 py-1 text-[12px] text-ink/30 hover:bg-hot/10 hover:text-hot"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Player count */}
      <div className="flex items-center gap-4">
        <span className="text-[13px] font-bold uppercase tracking-[.06em] text-ink/60">Players</span>
        <div className="flex items-center gap-2 rounded-full border-[3px] border-ink bg-paper px-4 py-2 shadow-brut-sm">
          <button
            onClick={() => setPlayerCount(Math.max(1, playerCount - 1))}
            disabled={playerCount <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper font-bold shadow-brut-sm disabled:opacity-30 hover:bg-hot/10 transition-colors"
          >
            −
          </button>
          <span className="w-5 text-center font-display text-[20px] font-extrabold">{playerCount}</span>
          <button
            onClick={() => setPlayerCount(Math.min(MAX_PLAYERS, playerCount + 1))}
            disabled={playerCount >= MAX_PLAYERS}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink bg-paper font-bold shadow-brut-sm disabled:opacity-30 hover:bg-hot/10 transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Score table — player cards live in the header so they align perfectly with columns */}
      <div className="overflow-x-auto rounded-[16px] border-[3px] border-ink shadow-brut-lg">
        <table className="w-full min-w-[480px] border-collapse">
          <thead>
            <tr className="border-b-[3px] border-ink">
              {/* Round label cell */}
              <th className="bg-cream px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[.08em] text-ink/50 w-14 align-bottom">
                Rnd
              </th>

              {/* Player card headers */}
              {session.players.map((p, i) => {
                const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
                return (
                  <th key={i} className={`px-3 pt-4 pb-3 text-left align-top ${color.bg}`}>
                    {/* Avatar + name row */}
                    <div className="flex items-start gap-3">
                      {/* Avatar with camera badge */}
                      <div className="relative shrink-0">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.name}
                            className="h-[70px] w-[70px] rounded-full border-[3px] border-ink object-cover shadow-brut"
                          />
                        ) : (
                          <div className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-ink bg-white/40 shadow-brut">
                            <span className="text-[34px]">
                              {["🧑","👩","🧔","👧","🧒","👴","👵","🧑‍🦱"][i % 8]}
                            </span>
                          </div>
                        )}
                        {/* Camera badge — disappears once photo is set */}
                        {!p.avatar && (
                          <button
                            onClick={() => avatarRefs.current[i]?.click()}
                            title="Add photo"
                            className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-ink bg-white text-[13px] shadow-brut-sm hover:bg-butter transition-colors"
                          >
                            📷
                          </button>
                        )}
                        {p.avatar && (
                          <button
                            onClick={() => clearAvatar(i)}
                            title="Remove photo"
                            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink bg-white text-[10px] font-bold shadow-brut-sm hover:bg-hot/20 transition-colors"
                          >
                            ✕
                          </button>
                        )}
                        <input
                          ref={(el) => { avatarRefs.current[i] = el; }}
                          type="file"
                          accept="image/*"
                          capture="user"
                          className="hidden"
                          onChange={(e) => onAvatarChange(i, e)}
                        />
                      </div>

                      {/* Name input */}
                      <div className="min-w-0 flex-1 pt-1">
                        <p className={`mb-0.5 text-[9px] font-bold uppercase tracking-[.1em] opacity-50 ${color.text}`}>
                          ✏︎ name
                        </p>
                        <input
                          value={p.name}
                          onChange={(e) => setPlayerName(i, e.target.value)}
                          className={`w-full rounded-lg border-[2px] border-ink/20 bg-white/30 px-2 py-1 font-display text-[22px] font-extrabold -tracking-[.03em] focus:border-ink focus:bg-white/80 focus:outline-none transition-colors ${color.text}`}
                          maxLength={20}
                        />
                      </div>
                    </div>
                  </th>
                );
              })}
              <th className="bg-cream w-8" />
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rounds }, (_, r) => (
              <tr key={r} className="border-b border-ink/15">
                <td className="bg-cream/60 px-4 py-2 text-center font-mono text-[12px] font-bold text-ink/40">
                  {r + 1}
                </td>
                {session.players.map((p, i) => (
                  <td key={i} className={`px-2 py-1.5 text-center ${COL_TINTS[i % COL_TINTS.length]}`}>
                    <input
                      type="number"
                      value={p.scores[r] ?? 0}
                      onChange={(e) => editScore(i, r, e.target.value)}
                      className="w-full rounded-lg border-2 border-transparent bg-transparent px-2 py-1 text-center font-mono text-[15px] font-bold focus:border-ink focus:outline-none focus:bg-white"
                    />
                  </td>
                ))}
                <td className="bg-cream/40 px-1 py-1 text-center">
                  <button
                    onClick={() => deleteRound(r)}
                    className="rounded px-1.5 py-0.5 text-[10px] text-ink/25 hover:bg-hot/10 hover:text-hot"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}

            {/* New round input */}
            <tr className="border-b-[3px] border-ink bg-white/60">
              <td className="px-4 py-2 text-center font-mono text-[12px] font-bold text-ink/30">
                {rounds + 1}
              </td>
              {session.roundInput.map((val, i) => {
                const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
                return (
                  <td key={i} className={`px-2 py-1.5 text-center ${COL_TINTS[i % COL_TINTS.length]}`}>
                    <input
                      type="number"
                      value={val}
                      placeholder="0"
                      onChange={(e) => setRoundInput(i, e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitRound()}
                      className={`w-full rounded-lg border-2 border-ink/30 bg-white px-2 py-1.5 text-center font-mono text-[16px] font-bold placeholder:text-ink/20 focus:outline-none focus:border-ink focus:ring-2 focus:ring-offset-1`}
                      style={{ "--tw-ring-color": color.hex } as React.CSSProperties}
                    />
                  </td>
                );
              })}
              <td />
            </tr>

            {/* Totals */}
            <tr>
              <td className="bg-ink px-4 py-3 text-[11px] font-bold uppercase tracking-[.08em] text-cream/60">
                Total
              </td>
              {session.players.map((p, i) => {
                const color = PLAYER_COLORS[i % PLAYER_COLORS.length];
                const total = totalScore(p);
                const isLeader = total === leader && leader > 0;
                return (
                  <td key={i} className={`px-2 py-2 text-center ${color.bg}`}>
                    <span className={`inline-block rounded-xl border-[3px] border-ink px-3 py-1 font-display text-[24px] font-extrabold shadow-brut-sm ${isLeader ? "bg-white scale-110" : "bg-white/50"} transition-transform`}>
                      {total}{isLeader && " 👑"}
                    </span>
                  </td>
                );
              })}
              <td className="bg-ink" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add round button */}
      <button
        onClick={submitRound}
        className="w-full rounded-[14px] border-[3px] border-ink bg-ink px-6 py-4 font-display text-[20px] font-extrabold text-cream shadow-brut-lg hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-y-0 transition-all"
      >
        + Add Round
      </button>

      {/* Standings */}
      {rounds > 0 && (
        <div>
          <h2 className="mb-3 font-display text-[24px] font-extrabold -tracking-[.03em]">Standings</h2>
          <ol className="space-y-2">
            {sorted.map((p, rank) => {
              const color = PLAYER_COLORS[p.originalIdx % PLAYER_COLORS.length];
              return (
                <li key={p.originalIdx} className={`flex items-center gap-4 rounded-[14px] border-[3px] border-ink px-4 py-3 shadow-brut-lg ${color.bg}`}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-white/60 font-display text-[18px] font-extrabold shadow-brut-sm ${color.text}`}>
                    {rank + 1}
                  </span>
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="h-10 w-10 shrink-0 rounded-full border-2 border-ink object-cover shadow-brut-sm" />
                  ) : (
                    <span className="text-[26px]">{["🧑","👩","🧔","👧","🧒","👴","👵","🧑‍🦱"][p.originalIdx % 8]}</span>
                  )}
                  <span className={`flex-1 font-display text-[20px] font-extrabold -tracking-[.02em] ${color.text}`}>
                    {p.name}
                  </span>
                  <span className={`font-display text-[26px] font-extrabold ${color.text}`}>
                    {p.total}{rank === 0 && p.total > 0 && " 👑"}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      )}
    </div>
  );
}
