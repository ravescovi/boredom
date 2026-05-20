"use client";

import type { GameSpec } from "@bordon-ai/shared";
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

export default function GeneratePage() {
  const [state, formAction, isPending] = useActionState(generateGameAction, initialState);

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
            onRetry={() => window.location.reload()}
          />
        ) : state.status === "error" ? (
          <GenerationErrorView
            variant="error"
            message={state.message}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <FormView state={state} formAction={formAction} />
        )}
      </div>
    </main>
  );
}

function ResultView({ game }: { game: GameSpec }) {
  return (
    <div className="grid gap-6">
      <GeneratedGameView game={game} />
      <button
        type="button"
        onClick={() => window.location.assign("/generate")}
        className="w-fit rounded-xl border-[3px] border-ink bg-hot px-5 py-3.5 font-display text-[18px] font-extrabold -tracking-[.01em] shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A]"
      >
        Make another 🎲
      </button>
    </div>
  );
}

function FormView({
  state,
  formAction
}: {
  state: ActionState;
  formAction: (formData: FormData) => void;
}) {
  const fieldErrors = state.status === "input_error" ? state.fields : {};
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

      <form
        action={formAction}
        className="mt-8 grid gap-6 rounded-[18px] border-[3px] border-ink bg-paper p-6 shadow-brut-xl"
      >
        <PlayerCountInput />
        {fieldErrors.minPlayers && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.minPlayers}</p>
        )}
        {fieldErrors.maxPlayers && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.maxPlayers}</p>
        )}

        <CircumstancesInput />
        {fieldErrors.circumstances && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.circumstances}</p>
        )}

        <GameTypeSelector />
        {fieldErrors.gameType && (
          <p className="text-sm font-semibold text-[#b8175d]">{fieldErrors.gameType}</p>
        )}

        <AvailablePropsSelector />

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
