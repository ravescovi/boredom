"use client";

import type { GameSpec } from "@bordon-ai/shared";
import { useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { AvailablePropsSelector } from "../../components/AvailablePropsSelector";
import { CircumstancesInput } from "../../components/CircumstancesInput";
import { CookingLoader } from "../../components/CookingLoader";
import { GameTypeSelector } from "../../components/GameTypeSelector";
import { GeneratedGameView } from "../../components/GeneratedGameView";
import { GenerationErrorView } from "../../components/GenerationErrorView";
import { PlayerCountInput } from "../../components/PlayerCountInput";
import { generateGameAction } from "./actions";
import type { ActionState } from "./runGenerateAction";

const initialState: ActionState = { status: "idle" };

const HOMEPAGE_REQUIRED_PARAMS = ["minPlayers", "maxPlayers", "circumstances", "gameType"];

export default function GeneratePage() {
  const [state, formAction, isPending] = useActionState(generateGameAction, initialState);
  const [prefill, setPrefill] = useState<URLSearchParams | null>(null);
  const autoFiredRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setPrefill(params);
    if (autoFiredRef.current) return;
    if (state.status !== "idle") return;
    const hasAllFields = HOMEPAGE_REQUIRED_PARAMS.every((k) => params.get(k));
    if (params.get("auto") === "1" && hasAllFields) {
      autoFiredRef.current = true;
      const fd = new FormData();
      for (const [k, v] of params.entries()) {
        if (k !== "auto") fd.append(k, v);
      }
      formAction(fd);
    }
  }, [state.status, formAction]);

  return (
    <main className="mx-auto max-w-[860px] px-6 py-10">
      <span className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1.5 text-[12px] font-bold uppercase tracking-[.08em] shadow-brut-sm">
        <span
          className="h-2 w-2 rounded-full bg-mint"
          style={{ animation: "brut-pulse 1.6s infinite" }}
        />
        {isPending
          ? "Cooking"
          : state.status === "ok"
            ? "Tonight's game"
            : state.status === "rejected" || state.status === "error"
              ? "Try again"
              : "Set up"}
      </span>

      <div className="mt-6">
        {isPending ? (
          <CookingLoader />
        ) : state.status === "ok" ? (
          <ResultView game={state.game} />
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
          <FormView state={state} formAction={formAction} prefill={prefill} />
        )}
      </div>
    </main>
  );
}

function ResultView({ game }: { game: GameSpec }) {
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
      </div>
    </div>
  );
}

function FormView({
  state,
  formAction,
  prefill
}: {
  state: ActionState;
  formAction: (formData: FormData) => void;
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
        <form action="/generate" method="get">
          <input type="hidden" name="auto" value="1" />
          <input type="hidden" name="random" value="1" />
          <button
            type="submit"
            className="rounded-xl border-[3px] border-ink bg-butter px-5 py-3 font-display text-[16px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
          >
            Just surprise me 🎲
          </button>
        </form>
      </div>

      <form
        action={formAction}
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
