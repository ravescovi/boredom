"use client";

import type { GameSpec } from "@bordon-ai/shared";
import { useEffect, useRef, useState } from "react";
import { AvailablePropsSelector } from "../../components/AvailablePropsSelector";
import { CircumstancesInput } from "../../components/CircumstancesInput";
import { GameTypeSelector } from "../../components/GameTypeSelector";
import { GeneratedGameView } from "../../components/GeneratedGameView";
import { GenerationErrorView } from "../../components/GenerationErrorView";
import { PlayerCountInput } from "../../components/PlayerCountInput";
import { ShareGameButton } from "../../components/ShareGameButton";
import { StarButton } from "../../components/StarButton";
import { useStreamingGenerate, type StreamingState } from "../../lib/useStreamingGenerate";

const HOMEPAGE_REQUIRED_PARAMS = ["minPlayers", "maxPlayers", "circumstances", "gameType"];

export default function GeneratePage() {
  const { state, submit } = useStreamingGenerate();
  const [prefill, setPrefill] = useState<URLSearchParams | null>(null);
  const autoFiredRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPrefill(params);
    if (autoFiredRef.current) return;
    if (state.status !== "idle") return;
    const hasAllFields = HOMEPAGE_REQUIRED_PARAMS.every((k) => params.get(k));
    const isRandom = params.get("random") === "1";
    if (params.get("auto") === "1" && (hasAllFields || isRandom)) {
      autoFiredRef.current = true;
      const fd = new FormData();
      for (const [k, v] of params.entries()) {
        if (k !== "auto") fd.append(k, v);
      }
      submit(fd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
        <span
          className="h-2 w-2 rounded-full bg-mint"
          style={{ animation: "brut-pulse 1.6s infinite" }}
        />
        {state.status === "streaming"
          ? "Cooking"
          : state.status === "ok"
            ? "Tonight's game"
            : state.status === "rejected" || state.status === "error"
              ? "Try again"
              : "Set up"}
      </span>

      <div className="mt-6">
        {state.status === "streaming" ? (
          <GeneratedGameView game={state.partial} streaming />
        ) : state.status === "ok" ? (
          <ResultView game={state.game} shortId={state.shortId} inputHash={state.inputHash} />
        ) : state.status === "rejected" ? (
          <GenerationErrorView
            variant="rejected"
            categories={state.categories}
            onRetry={() => window.location.assign("/generate")}
          />
        ) : state.status === "error" ? (
          <GenerationErrorView
            variant="error"
            message={state.message}
            onRetry={() => window.location.assign("/generate")}
          />
        ) : (
          <FormView state={state} onSubmit={submit} prefill={prefill} />
        )}
      </div>
    </main>
  );
}

function ResultView({
  game,
  shortId: servedShortId,
  inputHash
}: {
  game: GameSpec;
  shortId?: string;
  inputHash?: string;
}) {
  const [shortId, setShortId] = useState<string | null>(servedShortId ?? null);

  useEffect(() => {
    // Cache hit: the served game is already stored, so reuse its short ID rather
    // than creating a duplicate row.
    if (servedShortId) {
      setShortId(servedShortId);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/games", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ spec: game, inputHash })
        });
        if (!res.ok) return;
        const data = (await res.json()) as { shortId?: string };
        if (!cancelled && data.shortId) setShortId(data.shortId);
      } catch {
        // DB unavailable — fall back silently; share + star are non-essential.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [game, servedShortId, inputHash]);

  return (
    <div className="grid gap-6">
      <GeneratedGameView game={game} />
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.location.assign("/generate")}
          className="rounded-xl border-[3px] border-ink bg-paper px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Pick again
        </button>
        <form action="/generate" method="get">
          <input type="hidden" name="auto" value="1" />
          <input type="hidden" name="random" value="1" />
          <button
            type="submit"
            className="rounded-xl border-[3px] border-ink bg-hot px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
          >
            Random game 🎲
          </button>
        </form>
        {shortId && <StarButton shortId={shortId} initialScore={0} />}
        <ShareGameButton game={game} initialShortId={shortId ?? undefined} />
      </div>
    </div>
  );
}

function FormView({
  state,
  onSubmit,
  prefill
}: {
  state: StreamingState;
  onSubmit: (form: FormData) => void;
  prefill: URLSearchParams | null;
}) {
  const fieldErrors = state.status === "input_error" ? state.fields : {};
  const defaults = {
    minPlayers: prefill?.get("minPlayers") ?? "2",
    maxPlayers: prefill?.get("maxPlayers") ?? "6",
    circumstances: prefill?.get("circumstances") ?? "",
    gameType: prefill?.get("gameType") ?? "creative",
    props: prefill?.getAll("props") ?? []
  };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onSubmit(new FormData(e.currentTarget));
  }

  function handleRandom() {
    const fd = new FormData();
    fd.set("random", "1");
    onSubmit(fd);
  }

  return (
    <>
      <h1 className="font-display text-[clamp(40px,6vw,72px)] font-extrabold leading-[.92] -tracking-[.03em]">
        Set up your party{" "}
        <span className="relative inline-block">
          <span className="relative z-10">buddy</span>
          <span
            aria-hidden="true"
            className="absolute -bottom-1 left-[-2%] right-[-2%] z-0 h-3.5 -skew-x-[8deg] bg-mint"
          />
        </span>
        .
      </h1>

      <p className="mt-5 max-w-[560px] text-[17px] leading-[1.55] text-ink/85">
        Pick the number of players, the vibe, and the props. The generator will turn it into a safe
        structured game.
      </p>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleRandom}
          className="rounded-xl border-[3px] border-ink bg-butter px-5 py-3 font-display text-[16px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Just surprise me 🎲
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-6 rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl"
        key={defaults.circumstances + defaults.gameType + defaults.minPlayers + defaults.maxPlayers}
      >
        <PlayerCountInput defaultMin={defaults.minPlayers} defaultMax={defaults.maxPlayers} />
        {fieldErrors.minPlayers && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.minPlayers}</p>
        )}
        {fieldErrors.maxPlayers && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.maxPlayers}</p>
        )}

        <CircumstancesInput defaultValue={defaults.circumstances} />
        {fieldErrors.circumstances && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.circumstances}</p>
        )}

        <GameTypeSelector defaultValue={defaults.gameType} />
        {fieldErrors.gameType && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.gameType}</p>
        )}

        <AvailablePropsSelector defaultProps={defaults.props} />

        <button
          type="submit"
          className="mt-2 w-full rounded-xl border-[3px] border-ink bg-hot py-4 font-display text-[20px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
        >
          Generate game 🎲
        </button>
      </form>
    </>
  );
}
