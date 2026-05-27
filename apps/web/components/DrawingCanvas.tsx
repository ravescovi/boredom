"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const COLORS = [
  { label: "Ink",    hex: "#1A1A1A" },
  { label: "Hot",    hex: "#FF5C8A" },
  { label: "Butter", hex: "#FFE45C" },
  { label: "Mint",   hex: "#5BE0B0" },
  { label: "Sky",    hex: "#8AD7FF" },
  { label: "Lilac",  hex: "#C9B6FF" },
  { label: "Paper",  hex: "#FFFCF0" },
];

const BRUSHES = [
  { label: "S", size: 4  },
  { label: "M", size: 12 },
  { label: "L", size: 28 },
];

const TIMER_PRESETS = [
  { label: "⚡ Speed",       seconds: 15  },
  { label: "🎭 Charades",    seconds: 60  },
  { label: "🖼️ Pictionary",  seconds: 90  },
  { label: "🎨 Freestyle",   seconds: 180 },
  { label: "🌿 Bob Ross",    seconds: 300 },
];

const WATERMARKS = [
  "LOUVRE CALLED ✓",
  "PICASSO WHO?",
  "CHEF'S KISS",
  "NAILED IT!",
  "MY 5YR OLD DOES THIS",
  "CERTIFIED BANGER",
  "ART HISTORY ✓",
  "CONTESTANT #1",
  "NFT INCOMING",
  "NOT BAD ACTUALLY",
  "FRAME THIS",
  "HANG IT UP",
  "TIME'S UP LEGEND",
  "SENT TO GALLERY",
];

const CANVAS_W = 1200;
const CANVAS_H = 600;
const BG = "#FFFCF0";

function fmt(s: number) {
  const m = Math.floor(s / 60);
  return `${m}:${(s % 60).toString().padStart(2, "0")}`;
}

export function DrawingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Drawing refs — stable, no re-renders needed.
  const colorRef  = useRef("#1A1A1A");
  const brushRef  = useRef(12);
  const drawing   = useRef(false);
  const lastPos   = useRef<{ x: number; y: number } | null>(null);
  const lockedRef = useRef(false);

  // Drawing UI state.
  const [activeColor, setActiveColor] = useState("#1A1A1A");
  const [activeBrush, setActiveBrush] = useState(12);

  // Timer state.
  const [timerState,   setTimerState]   = useState<"idle" | "running" | "expired">("idle");
  const [timeLeft,     setTimeLeft]     = useState(0);
  const [activePreset, setActivePreset] = useState<typeof TIMER_PRESETS[number] | null>(null);
  const totalTimeRef = useRef(0);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  const pickColor = (hex: string) => { colorRef.current = hex; setActiveColor(hex); };
  const pickBrush = (sz: number)  => { brushRef.current = sz;  setActiveBrush(sz);  };

  // Init canvas background.
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  // Coordinate helper.
  const toCanvas = useCallback(
    (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const sx = CANVAS_W / rect.width;
      const sy = CANVAS_H / rect.height;
      if ("touches" in e) {
        const t = e.touches[0];
        if (!t) return null;
        return { x: (t.clientX - rect.left) * sx, y: (t.clientY - rect.top) * sy };
      }
      return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
    },
    []
  );

  // Drawing handlers.
  const onStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (lockedRef.current) return;
      e.preventDefault();
      const pos = toCanvas(e);
      if (!pos) return;
      drawing.current = true;
      lastPos.current = pos;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushRef.current / 2, 0, Math.PI * 2);
      ctx.fillStyle = colorRef.current;
      ctx.fill();
    },
    [toCanvas]
  );

  const onMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (lockedRef.current) return;
      e.preventDefault();
      if (!drawing.current || !lastPos.current) return;
      const pos = toCanvas(e);
      if (!pos) return;
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = colorRef.current;
      ctx.lineWidth   = brushRef.current;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.stroke();
      lastPos.current = pos;
    },
    [toCanvas]
  );

  const onStop = useCallback(() => {
    drawing.current = false;
    lastPos.current = null;
  }, []);

  // Watermark — stamped diagonally on canvas expiry.
  const applyWatermark = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const text = WATERMARKS[Math.floor(Math.random() * WATERMARKS.length)];

    ctx.save();
    ctx.translate(CANVAS_W / 2, CANVAS_H / 2);
    ctx.rotate(-Math.PI / 9);

    const fontSize = 108;
    ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    // Thick white halo for legibility.
    ctx.globalAlpha  = 1;
    ctx.strokeStyle  = "rgba(255,255,255,0.95)";
    ctx.lineWidth    = 20;
    ctx.lineJoin     = "round";
    ctx.strokeText(text, 0, 0);

    // Hot-pink fill, semi-transparent.
    ctx.globalAlpha = 0.82;
    ctx.fillStyle   = "#FF5C8A";
    ctx.fillText(text, 0, 0);

    // Crisp hot-pink outline on top.
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#FF5C8A";
    ctx.lineWidth   = 4;
    ctx.strokeText(text, 0, 0);

    ctx.restore();
  }, []);

  // Timer controls.
  const startTimer = useCallback(
    (preset: typeof TIMER_PRESETS[number]) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      lockedRef.current = false;
      totalTimeRef.current = preset.seconds;
      setActivePreset(preset);
      setTimeLeft(preset.seconds);
      setTimerState("running");

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            lockedRef.current = true;
            setTimerState("expired");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    },
    []
  );

  // Apply watermark once the state flips to expired.
  useEffect(() => {
    if (timerState === "expired") applyWatermark();
  }, [timerState, applyWatermark]);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    lockedRef.current = false;
    setTimerState("idle");
    setTimeLeft(0);
    setActivePreset(null);
  }, []);

  const clearCanvas = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }, []);

  const resetTimer = useCallback(() => {
    if (!activePreset) return;
    clearCanvas();
    startTimer(activePreset);
  }, [activePreset, clearCanvas, startTimer]);

  const save = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "drawing.png";
    a.href = canvas.toDataURL();
    a.click();
  }, []);

  // Cleanup on unmount.
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const progressPct = totalTimeRef.current > 0
    ? (timeLeft / totalTimeRef.current) * 100
    : 0;
  const progressColor =
    progressPct > 50 ? "#5BE0B0" :
    progressPct > 25 ? "#FFE45C" :
    "#FF5C8A";

  return (
    <div className="overflow-hidden rounded-[18px] border-[3px] border-ink shadow-brut-xl">

      {/* ── Row 1: Drawing tools ── */}
      <div className="flex flex-wrap items-center gap-3 border-b-[3px] border-ink bg-paper px-5 py-3">

        {/* Color swatches */}
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.label}
              onClick={() => pickColor(c.hex)}
              className="relative h-8 w-8 rounded-full border-[3px] transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: c.hex,
                borderColor: activeColor === c.hex ? "#1A1A1A" : "rgba(26,26,26,0.25)",
                boxShadow: activeColor === c.hex ? "3px 3px 0 #1A1A1A" : "none",
                transform: activeColor === c.hex ? "scale(1.2)" : undefined,
              }}
            >
              {activeColor === c.hex && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px]">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="h-8 w-[2px] rounded-full bg-ink/20" />

        {/* Brush sizes */}
        <div className="flex items-center gap-2">
          {BRUSHES.map((b) => (
            <button
              key={b.size}
              onClick={() => pickBrush(b.size)}
              className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-ink font-display text-[13px] font-extrabold transition-transform hover:-translate-y-0.5 active:translate-y-0.5 ${
                activeBrush === b.size ? "bg-ink text-cream shadow-brut" : "bg-paper"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="h-8 w-[2px] rounded-full bg-ink/20" />

        {/* Live preview dot */}
        <div
          className="shrink-0 rounded-full border-[3px] border-ink shadow-brut-sm transition-all duration-150"
          style={{
            width:  Math.max(activeBrush * 1.5, 14),
            height: Math.max(activeBrush * 1.5, 14),
            backgroundColor: activeColor,
          }}
        />

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { clearCanvas(); if (timerState !== "idle") stopTimer(); }}
            className="rounded-lg border-[3px] border-ink bg-paper px-4 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Clear
          </button>
          <button
            onClick={save}
            className="rounded-lg border-[3px] border-ink bg-mint px-4 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          >
            Save ↓
          </button>
        </div>
      </div>

      {/* ── Row 2: Timer ── */}
      <div className="flex flex-wrap items-center gap-3 border-b-[3px] border-ink bg-cream px-5 py-3">
        {timerState === "idle" && (
          <>
            <span className="text-[11px] font-bold uppercase tracking-[.08em] text-ink/50">
              Timer
            </span>
            {TIMER_PRESETS.map((preset) => (
              <button
                key={preset.seconds}
                onClick={() => startTimer(preset)}
                className="rounded-lg border-[3px] border-ink bg-paper px-3 py-1 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              >
                {preset.label}
                <span className="ml-1.5 font-mono text-[11px] font-normal text-ink/50">
                  {fmt(preset.seconds)}
                </span>
              </button>
            ))}
          </>
        )}

        {timerState === "running" && (
          <>
            <span className="rounded-full border-2 border-ink bg-paper px-3 py-1 text-[12px] font-bold shadow-brut-sm">
              {activePreset?.label}
            </span>
            <span
              className="font-display text-[32px] font-extrabold tabular-nums -tracking-[.04em]"
              style={{ color: progressColor }}
            >
              {fmt(timeLeft)}
            </span>
            <button
              onClick={stopTimer}
              className="rounded-lg border-[3px] border-ink bg-hot px-4 py-1 font-display text-[13px] font-extrabold text-paper shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              Stop ✕
            </button>
          </>
        )}

        {timerState === "expired" && (
          <>
            <span className="font-display text-[20px] font-extrabold -tracking-[.02em] text-hot">
              ⏰ Time&apos;s up!
            </span>
            <button
              onClick={resetTimer}
              className="rounded-lg border-[3px] border-ink bg-butter px-4 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              Again? ↺
            </button>
            <button
              onClick={() => { clearCanvas(); stopTimer(); }}
              className="rounded-lg border-[3px] border-ink bg-paper px-4 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            >
              New drawing
            </button>
          </>
        )}
      </div>

      {/* ── Progress bar (only when timer is active) ── */}
      {timerState !== "idle" && (
        <div className="h-[6px] w-full bg-ink/10">
          <div
            className="h-full transition-all duration-1000 ease-linear"
            style={{ width: `${progressPct}%`, backgroundColor: progressColor }}
          />
        </div>
      )}

      {/* ── Canvas ── */}
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="block w-full touch-none"
        style={{
          aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
          cursor: lockedRef.current ? "not-allowed" : "crosshair",
        }}
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onStop}
        onMouseLeave={onStop}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onStop}
      />
    </div>
  );
}
