"use client";

import type { GameSpec } from "@bordom-ai/shared";
import { useState } from "react";

type Phase =
  | { kind: "materials" }
  | { kind: "play"; index: number }
  | { kind: "done" };

const STEP_BG: Record<number, string> = {
  0: "#FFE45C",
  1: "#5BE0B0",
  2: "#8AD7FF",
  3: "#C9B6FF",
  4: "#FF5C8A",
  5: "#FFFCF0",
};

type PlayerRole = {
  label: string;
  sublabel: string;
  color: string;
};

function getPlayerRole(step: string): PlayerRole {
  const s = step.toLowerCase();

  if (s.includes("everyone else") || s.includes("other players") || s.includes("all other")) {
    return { label: "Everyone else", sublabel: "not the active player", color: "#8AD7FF" };
  }
  if (
    s.includes("everyone") ||
    s.includes("all players") ||
    s.includes("each player") ||
    s.includes("the group") ||
    s.includes("the table")
  ) {
    return { label: "Everyone", sublabel: "all players act together", color: "#5BE0B0" };
  }
  if (
    s.includes("one player") ||
    s.includes("the active player") ||
    s.includes("the author") ||
    s.includes("the clue author") ||
    s.includes("the guesser") ||
    s.includes("the actor") ||
    s.includes("the storyteller") ||
    s.includes("the reader") ||
    s.includes("timer-holder") ||
    s.includes("whose turn")
  ) {
    return { label: "Active player", sublabel: "the current turn-holder", color: "#FFE45C" };
  }
  // Imperative verbs at the start → active player's action
  if (/^(create|write|draw|read|pick|take|choose|reveal|flip|pass|roll|go|move|act|describe|mime|say|tell|draw|skip|discard)/.test(s)) {
    return { label: "Active player", sublabel: "the current turn-holder", color: "#FFE45C" };
  }
  // Scoring / tallying → everyone together
  if (s.includes("point") || s.includes("score") || s.includes("award") || s.includes("tally")) {
    return { label: "Everyone", sublabel: "update and announce scores", color: "#5BE0B0" };
  }
  // Guessing → everyone else
  if (s.includes("guess") || s.includes("vote")) {
    return { label: "Everyone else", sublabel: "not the active player", color: "#8AD7FF" };
  }

  return { label: "All players", sublabel: "everyone participates", color: "#5BE0B0" };
}

function getVisualHint(step: string, index: number): string {
  const s = step.toLowerCase();
  if (s.includes("write") || s.includes("clue") || s.includes("jot") || s.includes("note")) {
    return "Pens to paper — ~30 seconds of quiet writing. No peeking at each other's work!";
  }
  if (s.includes("read") && (s.includes("aloud") || s.includes("out") || s.includes("the"))) {
    return "Speak clearly so the whole group can hear. Everyone else just listens for now.";
  }
  if (s.includes("guess") || s.includes("vote")) {
    return "Decide privately before committing. No influencing each other yet!";
  }
  if (s.includes("reveal") || s.includes("flip") || s.includes("show") || s.includes("answer")) {
    return "All at once if possible — the simultaneous reveal keeps it fair and exciting!";
  }
  if (s.includes("point") || s.includes("score") || s.includes("award") || s.includes("tally")) {
    return "Update the shared tally and read out current standings so everyone knows where they stand.";
  }
  if (s.includes("next") || s.includes("rotate") || s.includes("pass")) {
    return "Move clockwise — the next person now becomes the active player.";
  }
  if (s.includes("discuss") || s.includes("explain")) {
    return "Open floor for 30–60 seconds of reactions, then move on.";
  }
  if (s.includes("draw") || s.includes("pick") || s.includes("choose")) {
    return "Take your time choosing — once picked, commit to it.";
  }
  if (index === 0) {
    return "This kicks off every turn. Make sure all players are ready before starting.";
  }
  return "Check in with your group, then proceed together.";
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border-2 border-ink px-3 py-1 font-display text-[12px] font-extrabold uppercase tracking-[.08em] shadow-brut-sm"
      style={{ backgroundColor: "#FFFCF0" }}
    >
      {children}
    </span>
  );
}

function MaterialsScreen({
  materials,
  checked,
  onToggle,
}: {
  materials: string[];
  checked: Set<number>;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="grid gap-5">
      <div>
        <Badge>Before you start</Badge>
        <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.1] -tracking-[.02em] text-ink">
          Gather your gear 🧰
        </h2>
        <p className="mt-2 text-[15px] leading-[1.55] text-ink/70">
          Check off everything before you move on.
        </p>
      </div>
      <ul className="grid gap-2.5">
        {materials.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onToggle(i)}
              className="flex w-full items-start gap-3 rounded-xl border-[2px] border-ink p-3.5 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
              style={{
                backgroundColor: checked.has(i) ? "#FFE45C" : "#FFFCF0",
                boxShadow: checked.has(i) ? "3px 3px 0 #1A1A1A" : "2px 2px 0 #1A1A1A",
              }}
            >
              <span
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-ink text-[12px] font-extrabold"
                style={{
                  backgroundColor: checked.has(i) ? "#1A1A1A" : "white",
                  color: "#FFF8E1",
                }}
              >
                {checked.has(i) ? "✓" : ""}
              </span>
              <span className="text-[15px] leading-[1.4] text-ink">{item}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayScreen({
  step,
  index,
  total,
  round,
  hint,
  role,
}: {
  step: string;
  index: number;
  total: number;
  round: number;
  hint: string;
  role: PlayerRole;
}) {
  const bg = STEP_BG[index % 6];

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Badge>
          Round {round} · Step {index + 1} of {total}
        </Badge>
      </div>

      {/* Player role */}
      <div
        className="flex items-center gap-3 rounded-[12px] border-[2px] border-ink px-4 py-2.5 shadow-brut-sm"
        style={{ backgroundColor: role.color }}
      >
        <div>
          <p className="font-display text-[11px] font-extrabold uppercase tracking-[.07em] text-ink/50">
            Who acts
          </p>
          <p className="font-display text-[18px] font-extrabold leading-none -tracking-[.01em] text-ink">
            {role.label}
          </p>
          <p className="mt-0.5 text-[12px] text-ink/60">{role.sublabel}</p>
        </div>
      </div>

      {/* Step instruction */}
      <div
        className="flex items-start gap-4 rounded-[18px] border-[3px] border-ink p-5 shadow-brut-lg"
        style={{ backgroundColor: bg }}
      >
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-ink bg-white font-display text-[20px] font-extrabold shadow-brut-sm">
          {index + 1}
        </span>
        <p className="pt-1 font-display text-[22px] font-extrabold leading-[1.25] -tracking-[.01em] text-ink">
          {step}
        </p>
      </div>

      {/* Visual hint */}
      <div
        className="rounded-xl border-2 px-4 py-3"
        style={{ borderColor: "rgba(26,26,26,0.15)", backgroundColor: "rgba(26,26,26,0.05)" }}
      >
        <p className="text-[11px] font-extrabold uppercase tracking-[.07em] text-ink/40">
          What it looks like
        </p>
        <p className="mt-1 text-[14px] leading-[1.55] text-ink/75">{hint}</p>
      </div>
    </div>
  );
}

function DoneScreen({
  game,
  round,
  onPlayAgain,
  onClose,
}: {
  game: GameSpec;
  round: number;
  onPlayAgain: () => void;
  onClose: () => void;
}) {
  return (
    <div className="grid gap-6 text-center">
      <div>
        <p className="font-display text-[56px] leading-none">🎉</p>
        <h2 className="mt-2 font-display text-[32px] font-extrabold leading-[1.1] -tracking-[.02em] text-ink">
          Round {round} complete!
        </h2>
        <p className="mt-2 text-[15px] leading-[1.5] text-ink/65">
          Keep going or wrap up — here&apos;s how to decide the winner.
        </p>
      </div>
      <div
        className="rounded-[14px] border-[3px] border-ink px-5 py-4 text-left shadow-brut"
        style={{ backgroundColor: "#FFE45C" }}
      >
        <p className="font-display text-[11px] font-extrabold uppercase tracking-[.07em] text-ink/50">
          Win condition
        </p>
        <p className="mt-1.5 text-[16px] font-semibold leading-[1.5] text-ink">{game.winCondition}</p>
      </div>
      <div className="grid gap-3">
        <button
          onClick={onPlayAgain}
          className="w-full rounded-xl border-[3px] border-ink bg-hot py-4 font-display text-[18px] font-extrabold shadow-brut-lg transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
        >
          Play Round {round + 1} 🔄
        </button>
        <button
          onClick={onClose}
          className="w-full rounded-xl border-[3px] border-ink py-3 font-display text-[16px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
          style={{ backgroundColor: "#FFFCF0" }}
        >
          End game
        </button>
      </div>
    </div>
  );
}

export function GameRunner({ game, onClose }: { game: GameSpec; onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>({ kind: "materials" });
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [round, setRound] = useState(1);

  // Use turnStructure for play — it's more explicit about who does what per step
  const steps = game.turnStructure.length > 0 ? game.turnStructure : game.gameplayLoop;
  const totalSteps = 1 + steps.length; // materials + play steps

  function currentStepIndex(): number {
    if (phase.kind === "materials") return 0;
    if (phase.kind === "play") return 1 + phase.index;
    return totalSteps;
  }

  function advance() {
    if (phase.kind === "materials") {
      if (steps.length > 0) setPhase({ kind: "play", index: 0 });
      else setPhase({ kind: "done" });
    } else if (phase.kind === "play") {
      if (phase.index + 1 < steps.length) setPhase({ kind: "play", index: phase.index + 1 });
      else setPhase({ kind: "done" });
    }
  }

  function retreat() {
    if (phase.kind === "play") {
      if (phase.index > 0) setPhase({ kind: "play", index: phase.index - 1 });
      else setPhase({ kind: "materials" });
    }
  }

  const canGoBack = phase.kind === "play";

  function nextLabel(): string {
    if (phase.kind === "materials") return "Start Round 1 →";
    if (phase.kind === "play") {
      return phase.index === steps.length - 1 ? "Round complete 🎉" : "Next →";
    }
    return "Next →";
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(26,26,26,0.88)", animation: "brut-backdrop-in 0.2s ease" }}
      role="dialog"
      aria-modal="true"
      aria-label="Game runner"
    >
      <div
        className="relative flex w-full max-w-[620px] flex-col overflow-hidden rounded-[24px] border-[3px] border-ink shadow-brut-2xl"
        style={{ backgroundColor: "#FFF8E1", animation: "brut-modal-in 0.25s ease" }}
      >
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between border-b-[3px] border-ink px-6 py-4"
          style={{ backgroundColor: "#FFF8E1" }}
        >
          <span className="font-display text-[13px] font-extrabold uppercase tracking-[.08em] text-ink/60">
            {game.title}
          </span>
          <button
            onClick={onClose}
            aria-label="Exit game runner"
            className="rounded-lg border-2 border-ink px-3 py-1.5 font-display text-[13px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
            style={{ backgroundColor: "#FFFCF0" }}
          >
            ✕ Exit
          </button>
        </div>

        {/* Progress bar */}
        {phase.kind !== "done" && (
          <div className="h-[5px] shrink-0" style={{ backgroundColor: "rgba(26,26,26,0.1)" }}>
            <div
              className="h-full bg-hot transition-all duration-300"
              style={{
                width: `${Math.round(((currentStepIndex() + 1) / totalSteps) * 100)}%`,
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="min-h-[340px] overflow-y-auto px-8 py-8">
          {phase.kind === "materials" && (
            <MaterialsScreen
              materials={game.requiredMaterials}
              checked={checked}
              onToggle={(i) =>
                setChecked((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })
              }
            />
          )}
          {phase.kind === "play" && (
            <PlayScreen
              step={steps[phase.index]}
              index={phase.index}
              total={steps.length}
              round={round}
              hint={getVisualHint(steps[phase.index], phase.index)}
              role={getPlayerRole(steps[phase.index])}
            />
          )}
          {phase.kind === "done" && (
            <DoneScreen
              game={game}
              round={round}
              onPlayAgain={() => {
                setRound((r) => r + 1);
                setPhase({ kind: "play", index: 0 });
              }}
              onClose={onClose}
            />
          )}
        </div>

        {/* Footer nav */}
        {phase.kind !== "done" && (
          <div
            className="flex shrink-0 items-center justify-between border-t-[3px] border-ink px-6 py-4"
            style={{ backgroundColor: "#FFF8E1" }}
          >
            <button
              onClick={retreat}
              disabled={!canGoBack}
              className="rounded-xl border-[3px] border-ink px-5 py-3 font-display text-[16px] font-extrabold shadow-brut-sm transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-25"
              style={{ backgroundColor: "#FFFCF0" }}
            >
              ← Back
            </button>
            <button
              onClick={advance}
              className="rounded-xl border-[3px] border-ink bg-hot px-6 py-3 font-display text-[17px] font-extrabold shadow-brut-lg transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#1A1A1A] active:translate-y-0.5"
            >
              {nextLabel()}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
